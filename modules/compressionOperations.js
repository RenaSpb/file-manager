const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

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
        console.error(`Operation fail: ${error.message}`);
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
        console.error(`Operation fail: ${error.message}`);
        throw error;
    }
}

module.exports = {
    compressFile,
    decompressFile
};
