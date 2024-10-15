const os = require('os');
const path = require('path');
const readline = require('readline');
const { Greet } = require('./greet');
const { readFile, addFile, renameFile, copyFile, moveFile, deleteFile } = require('./fileOperations');
const { goUp, changeCd, listContent } = require('./directoryOperations');
const { printEOLInfo, printCPUInfo, printHomedir, printUsername, printArchitecture } = require('./systemInfo');
const { calculateFileHash } = require('./hashOperations');
const { compressFile, decompressFile } = require('./compressionOperations');

const username = Greet();
const handleExit = () => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    process.exit();
}

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
            const [, filePath, newName] = trimmedInput.split(' ');
            await renameFile(filePath, newName);
        } else if (trimmedInput.startsWith('cp ')) {
                const [, filePath, copyPath] = trimmedInput.split(' ');
                await copyFile(filePath, copyPath);
        } else if (trimmedInput.startsWith('mv ')) {
            const filePath = trimmedInput.split(' ')[1];
            const movePath = trimmedInput.split(' ')[2];
            await moveFile(filePath, movePath);
        } else if (trimmedInput.startsWith('rm ')) {
            const filePath = trimmedInput.split(' ')[1];
            await deleteFile(filePath);
        }  else if (trimmedInput === 'os --EOL') {
            printEOLInfo();
        }  else if (trimmedInput === 'os --cpus') {
            printCPUInfo();
        }  else if (trimmedInput === 'os --homedir') {
            printHomedir();
        }  else if (trimmedInput === 'os --username') {
            printUsername();
        } else if (trimmedInput === 'os --architecture') {
            printArchitecture();
        } else if (trimmedInput.startsWith('hash ')) {
                const filePath = trimmedInput.split(' ')[1];
                await calculateFileHash(filePath);
        } else if (trimmedInput.startsWith('compress ')) {
            const [, filePath, compressPath] = trimmedInput.split(' ');
            await compressFile(filePath, compressPath);
        } else if (trimmedInput.startsWith('decompress ')) {
            const [, filePath, decompressPath] = trimmedInput.split(' ');
            await decompressFile(filePath, decompressPath);
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
