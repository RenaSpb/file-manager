const os = require('os');
const path = require('path');
const readline = require('readline');

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

rl.on('line', (input) => {
    const trimmedInput = input.trim()

    if (trimmedInput === '.exit') {
        handleExit();
    } else if (trimmedInput === 'up') {
        goUp();
    } else if (trimmedInput.startsWith('cd')) {
        changeCd(input);
    } else {
        console.log(`Invalid input: '${input}'. Please enter a valid command.`);
    }
    printCurrentDir();
    rl.prompt();
});
rl.on('SIGINT', () => {
    handleExit();
});
