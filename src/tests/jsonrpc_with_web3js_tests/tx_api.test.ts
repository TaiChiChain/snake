import { test, expect } from '@jest/globals'
import {
    ST_CONTRACT_DIR,
    ST_STORAGE_CONTRACT_NAME,
    ST_STORAGE_FILENAME
} from '../../utils/contracts_static'
import { ContractUtils } from '../../utils/contract'
import { newRpcClient, ST_PRIVATEKRY } from '../../utils/rpc'

describe('test_txAPI_by_contract', () => {
    test('test_StorageContract', async () => {
        const client = newRpcClient()
        const utils: ContractUtils = new ContractUtils(
            ST_CONTRACT_DIR,
            client,
            ST_PRIVATEKRY
        )
        utils.compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME)
        const address = await utils.deploy(ST_STORAGE_CONTRACT_NAME)
        console.log('Deploy contract address is : ', address)
        // key = 123 value = 456
        const receipt = await utils.call(
            ST_STORAGE_CONTRACT_NAME,
            address,
            'store',
            '0x7b00000000000000000000000000000000000000000000000000000000000000',
            '0x1c80000000000000000000000000000000000000000000000000000000000000'
        )

        //test getTxByHash
        const txByHash = await client.eth.getTransaction(receipt.transactionHash)
        //console.log(txByHash)
        expect(txByHash.blockNumber).toBe(receipt.blockNumber);

        //test GetBlockTransactionCountByNumber
        const blockTxNum = await client.eth.getBlockTransactionCount(receipt.blockNumber)
        //console.log(blockTxNum)
        expect(blockTxNum).toBe(BigInt(1));

        //test GetTransactionByBlockNumberAndIndex
        const txByBlockNumAndIndex = await client.eth.getTransactionFromBlock(receipt.blockNumber, 0)
        console.log(txByBlockNumAndIndex)
        expect(txByBlockNumAndIndex?.hash).toBe(receipt.transactionHash)

        //test GetTransactionByBlockHashAndIndex
        const txByBlockHashAndIndex = await client.eth.getTransactionFromBlock(receipt.blockHash.toLocaleString(), 0)
        //console.log(txByBlockHashAndIndex)
        expect(txByBlockHashAndIndex?.hash).toBe(receipt.transactionHash)

        //test GetTransactionReceipt
        const txReceipt = await client.eth.getTransactionReceipt(receipt.transactionHash)
        //console.log(txReceipt)
        expect(txReceipt.blockNumber).toBe(receipt.blockNumber);

        const receipt2 = await utils.call(
            ST_STORAGE_CONTRACT_NAME,
            address,
            'retrieve',
            '0x7b00000000000000000000000000000000000000000000000000000000000000'
        )
        expect(receipt2).toBe(
            '0x1c80000000000000000000000000000000000000000000000000000000000000'
        )
    })

    test('get_transactionCount', async () => {
        const client = newRpcClient()
        const nonce = await client.eth.getTransactionCount("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
        console.log(nonce)
        expect(nonce).toBeGreaterThanOrEqual(BigInt(0))
    })

    test('get_transactionCount', async () => {
        const client = newRpcClient()
        const nonce = await client.eth.getTransactionCount("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
        console.log(nonce)
        expect(nonce).toBeGreaterThanOrEqual(BigInt(0))
    })
})