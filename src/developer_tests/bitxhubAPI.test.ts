import { test, expect } from '@jest/globals'
import { client } from './helper'


test('eth_gasPrice', async () => {
    const gasPrice = await client.eth.getGasPrice()
    console.log(gasPrice)
})

//MaxPriorityFeePerGas not support


test('eth_feeHistory', async () => {
    const feeHistory = await client.eth.getFeeHistory(1,1,[])
    console.log(feeHistory)
})


test('eth.syncing',async()=>{
    const syncingData = await client.eth.isSyncing()
    console.log(syncingData)
})






