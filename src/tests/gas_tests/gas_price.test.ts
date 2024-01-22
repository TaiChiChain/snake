import {test, expect, describe} from '@jest/globals'
import {newRpcClient, transfer} from '../../utils/rpc'
import {TransactionReceipt} from 'web3'
import {ContractUtils} from '../../utils/contract'
import {
    ST_CONTRACT_DIR,
    ST_EVM_CONTRACT_NAME,
    ST_EVM_FILENAME
} from '../../utils/contracts_static'
import {ST_ACCOUNT_2} from '../../utils/accounts_static'

const MIN_BATCH_SIZE = 1
const MAX_BATCH_SIZE = 10
const MIN_PRICE = 1000000000000
const MIN_RATE = 0.9
const MAX_PRICE = 10000000000000
const MAX_RATE = 1.125

describe('test gas price change', () => {
    test('gas price min is 1000', async () => {
        const client = newRpcClient()
        const nowPrice = await client.eth.getGasPrice()
        const count = getCountToMin(nowPrice)

        for (let i = 0; i < count; i++) {
            await sendTransaction(MIN_BATCH_SIZE)
        }
        const price = await client.eth.getGasPrice()
        expect(price).toBe(BigInt(MIN_PRICE))
    })

    test('gas price max is 10000', async () => {
        const client = newRpcClient()
        const nowPrice = await client.eth.getGasPrice()
        const count = getCountToMax(nowPrice)

        for (let i = 0; i < count; i++) {
            var start = performance.now();
            await sendTransaction(MAX_BATCH_SIZE)
            var end = performance.now();
            console.log('cost is', `${end - start}ms`)
        }
        const price = await client.eth.getGasPrice()
        expect(price).toBe(BigInt(MAX_PRICE))
    })

    test('gas price no change', async () => {
        const client = newRpcClient()
        const oldPrice = await client.eth.getGasPrice()
        await sendTransaction(MAX_BATCH_SIZE / 2)
        const newPrice = await client.eth.getGasPrice()
        expect(oldPrice).toBe(newPrice)
    })

    test('gas price down', async () => {
        const client = newRpcClient()
        // gas price up, avoid MIN_PRICE
        for (let i = 0; i < 5; i++) {
            await sendTransaction(MAX_BATCH_SIZE)
        }
        await sendTransaction(MIN_BATCH_SIZE)
        const oldPrice = await client.eth.getGasPrice()
        await sendTransaction(MIN_BATCH_SIZE)
        const newPrice = await client.eth.getGasPrice()
        expect(oldPrice).toBeGreaterThan(newPrice)
    })

    test('gas price up', async () => {
        const client = newRpcClient()
        // gas price down, avoid MAX_PRICE
        for (let i = 0; i < 5; i++) {
            await sendTransaction(MIN_BATCH_SIZE)
        }
        await sendTransaction(MAX_BATCH_SIZE)
        const oldPrice = await client.eth.getGasPrice()
        await sendTransaction(MAX_BATCH_SIZE)
        const newPrice = await client.eth.getGasPrice()
        expect(oldPrice).toBeLessThan(newPrice)
    })

    test('gas price down 10%', async () => {
        const client = newRpcClient()
        // gas price up, avoid MIN_PRICE
        for (let i = 0; i < 5; i++) {
            await sendTransaction(MAX_BATCH_SIZE)
        }
        await sendTransaction(MIN_BATCH_SIZE)
        const oldPrice = await client.eth.getGasPrice()
        await sendTransaction(MIN_BATCH_SIZE)
        const newPrice = await client.eth.getGasPrice()
        expect(Math.floor(Number(oldPrice) * MIN_RATE)).toEqual(
            Number(newPrice)
        )
    })

    test('gas price up 12.5%', async () => {
        const client = newRpcClient()
        // gas price down, avoid MAX_PRICE
        for (let i = 0; i < 5; i++) {
            await sendTransaction(MIN_BATCH_SIZE)
        }
        await sendTransaction(MAX_BATCH_SIZE)
        const oldPrice = await client.eth.getGasPrice()
        await sendTransaction(MAX_BATCH_SIZE)
        const newPrice = await client.eth.getGasPrice()
        expect(Math.floor(Number(oldPrice) * MAX_RATE)).toEqual(
            Number(newPrice)
        )
    })

    test('transfer with amount and gas', async () => {
        const client = newRpcClient()
        const account2 = client.eth.accounts.create()

        const oldBalance = await client.eth.getBalance(ST_ACCOUNT_2.address)
        const nonce = await client.eth.getTransactionCount(ST_ACCOUNT_2.address)
        const gasPrice = await client.eth.getGasPrice()

        const receipt = await transfer(
            ST_ACCOUNT_2.address,
            account2.address,
            client.utils.toWei('0.5', 'ether'),
            nonce,
            ST_ACCOUNT_2.privateKey
        )
        const newBalance = await client.eth.getBalance(ST_ACCOUNT_2.address)
        expect(newBalance).toEqual(
            oldBalance -
                BigInt(client.utils.toWei('0.5', 'ether')) -
                BigInt(receipt.gasUsed) * gasPrice
        )
    })

    test('invoke contract with gas', async () => {
        const client = newRpcClient()
        const nonce = await client.eth.getTransactionCount(ST_ACCOUNT_2.address)

        const utils = new ContractUtils(
            ST_CONTRACT_DIR,
            client,
            ST_ACCOUNT_2.privateKey
        )
        utils.compile(ST_EVM_FILENAME, ST_EVM_CONTRACT_NAME)
        const address = await utils.deploy(ST_EVM_CONTRACT_NAME)

        const oldBalance = await client.eth.getBalance(ST_ACCOUNT_2.address)
        const gasPrice = await client.eth.getGasPrice()
        const receipt = await utils.call(
            ST_EVM_CONTRACT_NAME,
            address,
            'msgValue'
        )
        const newBalance = await client.eth.getBalance(ST_ACCOUNT_2.address)
        expect(newBalance).toEqual(
            oldBalance - BigInt(receipt.gasUsed) * gasPrice
        )
    })
})

async function sendTransaction(count: number) {
    const client = newRpcClient()
    const account = client.eth.accounts.create()
    let nonce = await client.eth.getTransactionCount(ST_ACCOUNT_2.address)

    const tasks: Promise<TransactionReceipt>[] = []
    for (let i = 0; i < count; i++) {
        const task = transfer(
            ST_ACCOUNT_2.address,
            account.address,
            client.utils.toWei('0.1', 'Gwei'),
            nonce,
            ST_ACCOUNT_2.privateKey
        )
        nonce++
        tasks.push(task)
    }
    return await Promise.all(tasks)
}

function getCountToMin(price: bigint) {
    // the recent rate maybe up or down, so add two time
    return (
        Math.ceil(Math.log(MIN_PRICE / Number(price)) / Math.log(MIN_RATE)) + 2
    )
}

function getCountToMax(price: bigint) {
    // the recent rate maybe up or down, so add one time
    return (
        Math.ceil(Math.log(MAX_PRICE / Number(price)) / Math.log(MAX_RATE)) + 1
    )
}
