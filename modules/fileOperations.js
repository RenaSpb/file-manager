const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

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
        console.error(`Operation fail. Error creating file '${fileName}':`, err.message);
    }
};

const renameFile = async (filePath, newName) => {
    const oldFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    const newFilePath = path.join(path.dirname(oldFilePath), newName);

    try {
        await fs.promises.rename(oldFilePath, newFilePath);
        console.log(`File renamed from "${filePath.split("\\").at(-1)}" to "${newFilePath.split("\\").at(-1)}"`);
    } catch (error) {
        console.error(`Operation fail: ${error.message}`);
    }
}

const copyFile = (filePath, copyPath) => {
    return new Promise(async (resolve, reject) => {
        const oldFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
        let copyFilePath = path.isAbsolute(copyPath) ? copyPath : path.resolve(process.cwd(), copyPath);

        try {
            const readStream = fs.createReadStream(oldFilePath);
            const writeStream = fs.createWriteStream(copyFilePath);

            await pipeline(readStream, writeStream);
            console.log(`File copied successfully.`);
            resolve();
        } catch (error) {
            reject(`Operation fail.: ${error.message}`);
        }
    });
};

const moveFile = (filePath, movePath) => {
    return new Promise(async (resolve, reject) => {
        const oldFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
        const moveFilePath = path.isAbsolute(movePath) ? movePath : path.resolve(process.cwd(), movePath);

        try {
            const readStream = fs.createReadStream(oldFilePath);
            const writeStream = fs.createWriteStream(moveFilePath);

            await pipeline(readStream, writeStream);
            await fs.promises.unlink(oldFilePath);

            console.log(`File moved successfully.`);
            resolve();
        } catch (error) {
            reject(`Operation fail: ${error.message}`);
        }
    });
};

const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const deleteFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

        fs.promises.unlink(deleteFilePath)
            .then(() => {
                console.log(`File deleted successfully.`);
                resolve();
            })
            .catch((error) => {
                console.error(`Operation fail: ${error.message}`);
                reject(error);
            });
    });
};

module.exports = {
    readFile,
    addFile,
    renameFile,
    copyFile,
    moveFile,
    deleteFile
};
