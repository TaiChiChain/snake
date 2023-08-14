import { test, expect } from '@jest/globals'
import {
    ST_CONTRACT_DIR,
    ST_STORAGE_CONTRACT_NAME,
    ST_STORAGE_FILENAME
} from '../utils/contracts_static'
import { ContractUtils } from '../utils/contract'
import { newRpcClient, ST_PRIVATEKRY } from '../utils/rpc'

test('eth_testStorageContract', async () => {
    const utils: ContractUtils = new ContractUtils(
        ST_CONTRACT_DIR,
        newRpcClient,
        ST_PRIVATEKRY
    )
    utils.compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME)
    const address = await utils.deploy(ST_STORAGE_CONTRACT_NAME)
    //console.log('Deploy contract address is : ', address)
    const receipt1 = await utils.call(
        ST_STORAGE_CONTRACT_NAME,
        address,
        'store',
        '0x7b00000000000000000000000000000000000000000000000000000000000000',
        '0x1c80000000000000000000000000000000000000000000000000000000000000'
    )
    expect(receipt1.to).toMatch(String(address).toLowerCase())

    const receipt2 = await utils.call(
        ST_STORAGE_CONTRACT_NAME,
        address,
        'retrieve',
        '0x7b00000000000000000000000000000000000000000000000000000000000000'
    )
    //console.log('get value is', receipt2)
    expect(receipt2).toBe(
        '0x1c80000000000000000000000000000000000000000000000000000000000000'
    )
})


