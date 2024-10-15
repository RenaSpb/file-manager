const os = require('os');

const printEOLInfo = () => {
    console.log("Default system End-Of-Line (EOL):");
    console.log("EOL as JSON:", JSON.stringify(os.EOL));
    console.log("EOL length:", os.EOL.length);
    console.log("EOL character codes:", os.EOL.split('').map(char => char.charCodeAt(0)));
}

const printCPUInfo = () => {
    const cpus = os.cpus();
    console.log(`CPUs numbers: ${cpus.length}`);
    cpus.forEach((cpu, index) => {
        console.log(`\nCPU ${index + 1}:`);
        console.log(`  Model: ${cpu.model}`);
        console.log(`  Speed: ${(cpu.speed / 1000).toFixed(2)} GHz`);
    });
}

const printHomedir = () => {
    console.log(`Home Directory: ${os.homedir()}`);
}

const printUsername = () => {
    console.log(`System username: ${os.userInfo().username}`);
}

const printArchitecture = () => {
    console.log(`CPU Architecture: ${os.arch()}`);
};

module.exports = {
    printEOLInfo,
    printCPUInfo,
    printHomedir,
    printUsername,
    printArchitecture
};
