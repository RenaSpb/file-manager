const os = require('os');
const path = require('path');
const readline = require('readline');
const fs = require('fs');

const Greet = () => {
    const args = process.argv.slice(2);
    const usernameFull = args.find(arg => arg.startsWith('--username='));
    const username = usernameFull ? usernameFull.split('=')[1] : 'Friend';

    console.log(`Welcome to the File Manager, ${username}!`);
    return username;
}
username = Greet();

const homeDir = os.homedir();
process.chdir(homeDir);

const printCurrentDir = () => {
    console.log(`You are currently in ${process.cwd()}`);
};
printCurrentDir();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.setPrompt('Enter command: ');
rl.prompt();

const handleExit = () => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    process.exit();
}
const goUp = () => {
    const currentDir = process.cwd();
    const parentDir = path.dirname(currentDir);

    if (currentDir === parentDir) {
        console.log("You are already in the root directory. Cannot go up.");
    } else {
        process.chdir(parentDir);
        printCurrentDir();
        console.log("Moved up to parent directory.");
    }
}
const changeCd = (input) => {
    const targetPath = input.split(' ')[1];
    if (!targetPath) {
        console.log('Wrong path, try another one')
    }
    const finalPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(process.cwd(), targetPath);

    try {
        const stats = fs.statSync(finalPath);
        if (stats.isDirectory()) {
            process.chdir(finalPath);
            printCurrentDir();
        } else {
            console.log(`Error: "${targetPath}" is not a directory.`);
        }
    } catch (err) {
        console.log(`Error: Directory "${targetPath}" does not exist.`);
    }
}
const listContent = async () => {
    try {
        const entries = await fs.readdir(process.cwd(), { withFileTypes: true });

        const folders = entries.filter(entry => entry.isDirectory());
        const files = entries.filter(entry => entry.isFile());

        const sortedFolders = folders.map(folder => folder.name).sort();
        const sortedFiles = files.map(file => file.name).sort();

        console.log('Directory listing:');
        console.log('Number  Type          Name');
        console.log('-------------------------------------------');

        let index = 1;

        sortedFolders.forEach(folder => {
            console.log(`${index}   Folder        ${folder}`);
            index++;
        });

        sortedFiles.forEach(file => {
            console.log(`${index}   File          ${file}`);
            index++;
        });
    } catch (err) {
        console.log('Error reading directory:', err);
    }

    printCurrentDir();
}
const readFile = async (finalPath) => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(finalPath, { encoding: 'utf8' });

        readStream.on('data', (text) => {
            process.stdout.write(text);
        });
        readStream.on('end', () => {
            resolve();
        });
        readStream.on('error', (error) => {
            reject(error);
        });
    });
};
const addFile = async (fileName) => {
    const filePath = path.resolve(process.cwd(), fileName);
    try {
        await fs.promises.writeFile(filePath, '');
        console.log(`File '${fileName}' created successfully.`);
    } catch (err) {
        console.error(`Error creating file '${fileName}':`, err.message);
    }
};
const renameFile = async (filePath, newName) => {
    const oldFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    const newFilePath = path.join(path.dirname(oldFilePath), newName);

    try {
        await fs.promises.rename(oldFilePath, newFilePath);
        console.log(`File renamed from "${filePath.split("\\").at(-1)}" to "${newFilePath.split("\\").at(-1)}"`);
    } catch (error) {
        console.error(`Error renaming file: ${error.message}`);
    }
}


rl.on('line', async (input) => {
    const trimmedInput = input.trim()

    try {
        if (trimmedInput === '.exit') {
            handleExit();
        } else if (trimmedInput === 'up') {
            goUp();
        } else if (trimmedInput.startsWith('cd')) {
            changeCd(input);
        } else if (trimmedInput === 'ls') {
            await listContent();
        } else if (trimmedInput.startsWith('cat ')) {
            const filePath = trimmedInput.slice(4).trim();
            const finalPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
            await readFile(finalPath);
        } else if (trimmedInput.startsWith('add ')) {
            const fileName = trimmedInput.slice(4).trim();
            await addFile(fileName);
        } else if (trimmedInput.startsWith('rn ')) {
            const filePath = trimmedInput.split(' ')[1];
            const newName = trimmedInput.split(' ')[2];
            await renameFile(filePath, newName);
        } else {
            console.log(`Invalid input: '${input}'. Please enter a valid command.`);
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }

    printCurrentDir();
    rl.prompt();
});
rl.on('SIGINT', () => {
    handleExit();
});
