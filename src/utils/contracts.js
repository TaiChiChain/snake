const path = require('path')

const contractDir = path.dirname(__dirname) + "/contracts/"
const ST_STORAGE_FILENAME = "storage.sol"
const ST_STORAGE_CONTRACT_NAME = "Storage"

module.exports = {
    contractDir,
    ST_STORAGE_FILENAME,
    ST_STORAGE_CONTRACT_NAME
}