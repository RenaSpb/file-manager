const os = require('os');
const path = require('path');
const readline = require('readline');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const crypto = require('crypto');
const zlib = require('zlib');

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
        console.log(`Error: Directory "${targetPath}" does not exist.`);
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
        console.log('Error reading directory:', err);
    }
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
            console.error(`Failed to copy: ${error.message}`);
            reject(error);
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

            console.log(`File moved  successfully.`);
            resolve();
        } catch (error) {
            console.error(`Failed to moved : ${error.message}`);
            reject(error);
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
                console.error(`Failed to delete: ${error.message}`);
                reject(error);
            });
    });
};
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
const calculateFileHash = async (filePath) => {
    try {
        const data = await fs.promises.readFile(filePath);
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        console.log(`Hash of ${filePath.split("\\").at(-1)} is \n${hash}`);
    } catch (error) {
        console.error(`Error calculating hash: ${error.message}`);
    }
};
const compressFile = async (filePath, compressPath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error('Source file does not exist');
    }

    let finalCompressPath = compressPath;
    const originalFileNameWithoutExt = path.basename(filePath, path.extname(filePath));

    if (fs.existsSync(compressPath) && fs.statSync(compressPath).isDirectory()) {
        finalCompressPath = path.join(compressPath, originalFileNameWithoutExt + '.br');
    } else {
        if (!compressPath.endsWith('.br')) {
            finalCompressPath += '.br';
        }
    }

    if (filePath === finalCompressPath) {
        throw new Error('Source and destination paths cannot be the same');
    }

    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(finalCompressPath);
    const brotli = zlib.createBrotliCompress();

    try {
        await pipeline(readStream, brotli, writeStream);
        console.log(`File compressed successfully: ${finalCompressPath}`);
    } catch (error) {
        console.error(`Compression failed: ${error.message}`);
        throw error;
    }
}
const decompressFile = async (filePath, decompressPath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error('Source file does not exist');
    }
    if (!filePath.endsWith('.br')) {
        throw new Error('Input file must be a .br compressed file');
    }

    let finalDecompressPath = decompressPath;
    const originalFileName = path.basename(filePath, '.br');
    const originalExt = path.extname(originalFileName);

    if (fs.existsSync(decompressPath) && fs.statSync(decompressPath).isDirectory()) {
        finalDecompressPath = path.join(decompressPath, originalFileName);  // Use original name without .br
    } else {
        if (path.extname(decompressPath) === '') {
            finalDecompressPath = originalExt ? `${decompressPath}${originalExt}` : `${decompressPath}.txt`;
        }
    }
    if (filePath === finalDecompressPath) {
        throw new Error('Source and destination paths cannot be the same');
    }

    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(finalDecompressPath);
    const brotli = zlib.createBrotliDecompress();

    try {
        await pipeline(readStream, brotli, writeStream);
        console.log(`File decompressed successfully to ${finalDecompressPath}`);
    } catch (error) {
        console.error(`Decompression failed: ${error.message}`);
        throw error;
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
