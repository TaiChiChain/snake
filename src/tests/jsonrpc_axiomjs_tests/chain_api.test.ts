import {test, expect} from '@jest/globals'
import {newProvider, request} from '../../utils/rpc'

describe('test get gasPrice info', () => {
    test('get_gasPrice', async () => {
        let res = await request('eth_gasPrice')
        console.log(res)
        expect(BigInt(res.result)).toBeGreaterThanOrEqual(BigInt(1000000000000))
        expect(BigInt(res.result)).toBeLessThanOrEqual(BigInt(10000000000000))
    })
})
//eth_feeHistory not support now
describe('test get feeHistory info', () => {
    test('eth_feeHistory', async () => {
        try {
            await request('eth_feeHistory', [1, 1, []])
        } catch (err) {
            console.log(err)
            expect(err).toHaveProperty(
                'message',
                'Returned error: unsupported interface'
            )
        }
    })
})

describe('test get blockchain sync info  ', () => {
    test('eth_syncing', async () => {
        const provider = newProvider()
        const blocknum = await provider.getBlockNumber()
        var res = await request('eth_syncing')
        console.log(res)
        expect(res.result).toHaveProperty('currentBlock', String(blocknum))
        expect(res.result).toHaveProperty('highestBlock', String(blocknum))
        expect(res.result).toHaveProperty('startingBlock', '1')
    })
})

describe('test block info contains coinbase address ', () => {
    const provider = newProvider()
    test('eth_getBlock_latest', async () => {
        const latestBlock = await provider.getBlock('latest', true)
        console.log('The latest block coinbase info is: ', latestBlock?.miner)
        expect(latestBlock?.miner).not.toBeNull
    })

    test('eth_getBlock_earliest', async () => {
        const latestBlock = await provider.getBlock('earliest', true)
        console.log('The latest block coinbase info is: ', latestBlock?.miner)
        expect(latestBlock?.miner).not.toBeNull
        expect(latestBlock?.miner).toBe(
            '0x0000000000000000000000000000000000000000'
        )
    })
})
