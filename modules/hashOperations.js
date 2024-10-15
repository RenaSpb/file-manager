const fs = require('fs');
const crypto = require('crypto');

const calculateFileHash = async (filePath) => {
    try {
        const data = await fs.promises.readFile(filePath);
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        console.log(`Hash of ${filePath.split("\\").at(-1)} is \n${hash}`);
    } catch (error) {
        console.error(`Operation fail: ${error.message}`);
    }
};

module.exports = {
    calculateFileHash
};
