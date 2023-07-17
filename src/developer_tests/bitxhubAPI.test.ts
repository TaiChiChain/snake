import { test, expect } from '@jest/globals'
import { client } from './helper'


test('eth_gasPrice', async () => {
    const gasPrice = await client.eth.getGasPrice()
    console.log(gasPrice)
    expect(gasPrice).toBeDefined()
    
})

//MaxPriorityFeePerGas not support


test('eth_feeHistory', async () => {
    try{
        const feeHistory = await client.eth.getFeeHistory(1,1,[])
    }catch(err){
        console.log(err)
        expect(err).toHaveProperty('message', 'Returned error: unsupported interface');
    }
    
})

test('eth.syncing',async()=>{
    const syncingData = await client.eth.isSyncing()
    console.log(syncingData)
    expect(syncingData).toBeDefined()
    
})






