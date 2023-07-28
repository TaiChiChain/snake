import { test, expect } from '@jest/globals'
import axios from 'axios'
import { provider, client, call } from '../../utils/rpc'


describe('test_getChainId', () => {
    test('get_blockByNumber_normal', async () => {
        //const chainId = await provider.call
        const res = await call("eth_getBlockByNumber", ["latest", true])
        //const blockNumber = await provider.getBlockNumber()
        console.log('rpc post---', res)
    })
})