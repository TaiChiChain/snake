import { test, expect } from '@jest/globals'
import { client } from './helper'

test('eth_chainId', async () => {
    const chainId = await client.eth.getChainId()
    console.log(chainId)
})

test('eth_blockNumber',async()=>{
    const blocknum =await client.eth.getBlockNumber()
    console.log(blocknum)
})

test('eth_getbalance',async()=>{
    const balance = await client.eth.getBalance("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
    console.log(balance)
})

test('eth.getBlockByNumber',async()=>{
    let block =await client.eth.getBlock(1,true)
    console.log(block)
})

test('eth.getBlockByHash',async()=>{
    let block =await client.eth.getBlock("0xfb041b3d98d317c209d9782e97e873b24f42c3d0c93b24feda94f6a244e73feb",true)
    console.log(block)
})

test('eth_getCode',async()=>{
    let code = await client.eth.getCode("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
    console.log(code)
})

test('eth.getStorageAt',async()=>{
    let storage =await client.eth.getStorageAt("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013","1")
    console.log(storage)
})

// test('eth.call',async()=>{
//     var TransactionCall 
//     await client.eth.call()
// })







