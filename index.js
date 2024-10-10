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
const listContent = () => {
    fs.readdir(process.cwd(), { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.log('Error reading directory:', err);
            return;
        }
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
    });
    printCurrentDir();
}

rl.on('line', (input) => {
    const trimmedInput = input.trim()

    if (trimmedInput === '.exit') {
        handleExit();
    } else if (trimmedInput === 'up') {
        goUp();
    } else if (trimmedInput.startsWith('cd')) {
        changeCd(input);
    } else if (trimmedInput === 'ls') {
        listContent();
    } else {
        console.log(`Invalid input: '${input}'. Please enter a valid command.`);
    }
    printCurrentDir();
    rl.prompt();
});
rl.on('SIGINT', () => {
    handleExit();
});
