import { test, expect } from '@jest/globals'
import { client } from '../../utils/rpc'
import Web3 from 'web3'

const client1 = new Web3("http://127.0.0.1:8545")
describe('test_gasPrice', () => {
    test('get_gasPrice_normal_1', async () => {
        const gasPrice = await client.eth.getGasPrice()
        //console.log(gasPrice)
        expect(gasPrice).toBe(BigInt(50000))
    })

    test('get_gasPrice_abnormal_1', async () => {
        try {
            await client1.eth.getGasPrice()
        } catch (err) {
            expect(String(err)).toMatch('connect ECONNREFUSED')
        }
    })
})

//MaxPriorityFeePerGas not support
describe('test_feeHistory', () => {
    test('get_feeHistory_normal_1', async () => {
        try {
            await client.eth.getFeeHistory(1, 1, [])
        } catch (err) {
            //console.log(err)
            expect(err).toHaveProperty(
                'message',
                'Returned error: unsupported interface'
            )
        }
    })
})

test('eth.syncing', async () => {
    const blocknum = await client.eth.getBlockNumber()
    const syncingData = await client.eth.isSyncing()
    console.log(syncingData)
    expect(syncingData).toHaveProperty('currentBlock',
        String(blocknum))
    expect(syncingData).toHaveProperty('highestBlock',
        String(blocknum))
    expect(syncingData).toHaveProperty('startingBlock',
        '1')
})
