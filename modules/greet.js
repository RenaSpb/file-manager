const Greet = () => {
    const args = process.argv.slice(2);
    const usernameFull = args.find(arg => arg.startsWith('--username='));
    const username = usernameFull ? usernameFull.split('=')[1] : 'Friend';

    console.log(`Welcome to the File Manager, ${username}!`);
    return username;
}

module.exports = { Greet };
