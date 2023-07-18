const path = require('path')
const {ContractUtils} = require('./contract')

const ST_CONTRACT_DIR = path.dirname(__dirname) + '/contracts/'
const ST_PRIVATEKRY =
    '0xb6477143e17f889263044f6cf463dc37177ac4526c4c39a7a344198457024a2f'

const ST_STORAGE_FILENAME = 'storage.sol'
const ST_STORAGE_CONTRACT_NAME = 'EIP1153Skeleton'

module.exports = {
    ST_CONTRACT_DIR,
    ST_PRIVATEKRY,
    ST_STORAGE_FILENAME,
    ST_STORAGE_CONTRACT_NAME
}
