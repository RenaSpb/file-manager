const fs = require('fs');
const path = require('path');

const goUp = () => {
    const currentDir = process.cwd();
    const parentDir = path.dirname(currentDir);

    if (currentDir === parentDir) {
        console.log("You are already in the root directory. Cannot go up.");
    } else {
        process.chdir(parentDir);
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
        } else {
            console.log(`Error: "${targetPath}" is not a directory.`);
        }
    } catch (err) {
        console.log(`Operation fail. Error: Directory "${targetPath}" does not exist.`);
    }
}

const listContent = async () => {
    try {
        const entries = await fs.promises.readdir(process.cwd(), { withFileTypes: true });

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
        console.log('Operation fail.');
    }
}

module.exports = {
    goUp,
    changeCd,
    listContent
};
