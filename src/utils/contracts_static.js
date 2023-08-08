const path = require('path')

const ST_CONTRACT_DIR = path.dirname(__dirname) + '/contracts/'

const ST_STORAGE_FILENAME = 'storage.sol'
const ST_STORAGE_CONTRACT_NAME = 'EIP1153Skeleton'
const ST_EVM_FILENAME = 'evm.sol'
const ST_EVM_CONTRACT_NAME = 'EVM'
const ST_CROSS_EVM_FILENAME = 'evm.sol'
const ST_CROSS_EVM_CONTRACT_NAME = 'CrossEVM'

module.exports = {
    ST_CONTRACT_DIR,
    ST_STORAGE_FILENAME,
    ST_STORAGE_CONTRACT_NAME,
    ST_EVM_FILENAME,
    ST_EVM_CONTRACT_NAME,
    ST_CROSS_EVM_FILENAME,
    ST_CROSS_EVM_CONTRACT_NAME
}
