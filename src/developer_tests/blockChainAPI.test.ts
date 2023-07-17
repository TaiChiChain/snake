import { test, expect } from '@jest/globals'
import { client } from './helper'

test('eth_chainId', async () => {
    const chainId = await client.eth.getChainId()
    console.log(chainId)
    expect(chainId).toBe(BigInt(1356));
})

test('eth_blockNumber',async()=>{
    const blocknum =await client.eth.getBlockNumber()
    console.log(blocknum)
    expect(blocknum).toBeDefined()
})

test('eth_getbalance',async()=>{
    const balance = await client.eth.getBalance("0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8")
    console.log(balance)
    expect(balance).not.toBe(BigInt(0))
    
})

test('eth.getBlockByNumber',async()=>{
    const blocknum =await client.eth.getBlockNumber()
    console.log(blocknum)
    let block =await client.eth.getBlock(blocknum,true)
    expect(blocknum).toBeDefined()

})

test('eth.getBlockByHash',async()=>{
    const blocknum =await client.eth.getBlockNumber()
    console.log(blocknum)
    let blockByNum =await client.eth.getBlock(blocknum,true)
    let block =await client.eth.getBlock(blockByNum.hash,true)
    console.log(block)
    expect(block.hash).toBe(blockByNum.hash);
})

test('eth_getCode',async()=>{
    let code = await client.eth.getCode("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
    console.log(code)
    expect(code).toBeDefined()
})

test('eth.getStorageAt',async()=>{
    let storage =await client.eth.getStorageAt("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013","1")
    console.log(storage)
    expect(storage).toBeDefined()
})







