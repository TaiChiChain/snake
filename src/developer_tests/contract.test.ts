import {test, expect} from '@jest/globals'
import {
    ST_CONTRACT_DIR,
    ST_PRIVATEKRY,
    ST_STORAGE_CONTRACT_NAME,
    ST_STORAGE_FILENAME
} from '../utils/contracts_static'
import {ContractUtils} from '../utils/contract'
import {client} from '../utils/rpc'

test('eth_testStorageContract', async () => {
    const utils: ContractUtils = new ContractUtils(
        ST_CONTRACT_DIR,
        client,
        ST_PRIVATEKRY
    )
    utils.compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME)
    const address = await utils.deploy(ST_STORAGE_CONTRACT_NAME)

    // key = 123 value = 456
    await utils.call(
        ST_STORAGE_CONTRACT_NAME,
        address,
        'store',
        '0x7b00000000000000000000000000000000000000000000000000000000000000',
        '0x1c80000000000000000000000000000000000000000000000000000000000000'
    )

    const receipt = await utils.call(
        ST_STORAGE_CONTRACT_NAME,
        address,
        'retrieve',
        '0x7b00000000000000000000000000000000000000000000000000000000000000'
    )
    expect(receipt).toBe(
        '0x1c80000000000000000000000000000000000000000000000000000000000000'
    )
})
