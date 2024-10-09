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

rl.on('line', (input) => {
    if (input.trim() === '.exit') {
        handleExit();
    } else {
        console.log(`Invalid input: '${input}'. Please enter a valid command.`);
    }
    printCurrentDir();
    rl.prompt();
});
rl.on('SIGINT', () => {
    handleExit();
});
