import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import * as fs from 'fs'
import {newWebSocketProvider, newProvider} from '../../utils/rpc'
import {ST_ACCOUNT_5} from '../../utils/accounts_static'
import {ST_CONTRACT_DIR} from '../../utils/contracts_static'
import {waitAsync} from '../../utils/util'

describe('TestCases of Subscribe', () => {
    const provider = newProvider()
    const wallet = new ethers.Wallet(ST_ACCOUNT_5.privateKey, provider)
    const bytecode = fs.readFileSync(
        ST_CONTRACT_DIR + 'Subscribe/eventSubscribe.bin',
        'utf8'
    )
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Subscribe/eventSubscribe.abi',
        'utf8'
    )
    let contractAddress = ''
    let subscribe_contract: any

    beforeAll(async () => {
        console.log('Deploy eventSubscribe.sol first')
        const subscribe_instance = new ethers.ContractFactory(
            abi,
            bytecode,
            wallet
        )
        const contract = await subscribe_instance.deploy()
        const txReceipt = await contract.deploymentTransaction()?.wait()
        contractAddress = String(txReceipt?.contractAddress)
        console.log(
            'deploy eventSubscribe contract successful with address :',
            contractAddress
        )

        subscribe_contract = new ethers.Contract(contractAddress, abi, wallet)
    })

    test('subscribe new block and new transaction ', async () => {
        const wsProvider = newWebSocketProvider()
        const blockNo = await provider.getBlockNumber()
        wsProvider.on('block', async blockNumber => {
            console.log('new block number is:', blockNumber)
            expect(blockNumber).toBe(blockNo + 1)
        })

        wsProvider.on('pending', async txHash => {
            const tx = await wsProvider.getTransaction(txHash)
            //console.log('new tx is:', tx)
            expect(tx?.data).toMatch('0xbeabacc8')
        })

        //const listeners = await wsProvider.listeners('block')
        //console.log('subscription.listeners:', listeners)

        await subscribe_contract.transfer(
            wallet.address,
            '0xE55Db6E6743111F35F18af34E8331AB1E27214de',
            1
        )
        //console.log('Tx successful with hash:', createReceipt.hash)

        //wait 3s and close the websocket connection
        await waitAsync(1000 * 3)
        wsProvider.websocket.close()
    })

    test('subscribe contract event', async () => {
        const wsProvider = newWebSocketProvider()
        const filter = {
            address: contractAddress
        }
        wsProvider.on(filter, event => {
            //console.log(event)
            expect(event.address).toMatch(contractAddress)
            expect(JSON.stringify(event.topics)).toMatch('27214de')
        })

        await subscribe_contract.transfer(
            wallet.address,
            '0xE55Db6E6743111F35F18af34E8331AB1E27214de',
            1
        )
        //console.log('Tx successful with hash:', createReceipt.hash)
        //wait 3s and close the websocket connection
        await waitAsync(1000 * 3)
        wsProvider.websocket.close()
    })
})
