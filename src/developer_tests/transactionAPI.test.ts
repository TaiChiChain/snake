import { test, expect } from '@jest/globals'
import { client } from './helper'


test('eth_getBlockTransactionCountByNumber', async () => {
    const trNum = await client.eth.getBlockTransactionCount(1)
    console.log(trNum)
})


test('eth_getBlockTransactionCountByHash',async()=>{
    const trNum = await client.eth.getBlockTransactionCount("0xfB041b3D98d317C209d9782e97E873B24f42c3D0C93B24feDA94f6A244e73fEb")
    console.log(trNum)
})

test('eth_getTransactionByBlockNumberAndIndex',async()=>{
   let tx = await client.eth.getTransactionFromBlock(1,1)
   console.log(tx)
})

test('eth_getTransactionByBlockHashAndIndex',async()=>{
    let tx=await client.eth.getTransactionFromBlock("0xfB041b3D98d317C209d9782e97E873B24f42c3D0C93B24feDA94f6A244e73fEb",1)
    console.log(tx)
})

test('eth_getTransactionCount',async()=>{
    const trNum=await client.eth.getTransactionCount("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
    console.log(trNum)
})


test('eth_getTransactionByHash',async()=>{
    const tr=await client.eth.getTransaction("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
    console.log(tr)
})

















