import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import * as fs from 'fs'
import {newWebSocketProvider, newProvider} from '../../utils/rpc'
import {ST_ACCOUNT_5} from '../../utils/accounts_static'
import {ST_CONTRACT_DIR} from '../../utils/contracts_static'

describe('subscribe', () => {
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
    })

    test('subscribe newHeads', async () => {
        const wsProvider = newWebSocketProvider()
        //subscription
        wsProvider.on('block', blockNumber => {
            console.log('Latest block:', blockNumber)
        })

        // subscription.on('pending', tx => {
        //    subscription.getTransaction(tx).then(function (transaction) {
        //        console.log('Latest tx:', transaction)
        //    })
        //})
        // console.log('subscription.listeners:', wsProvider.listeners)

        const subscribe_contract = new ethers.Contract(
            contractAddress,
            abi,
            wallet
        )
        const createReceipt = await subscribe_contract.transfer(
            wallet.address,
            '0xE55Db6E6743111F35F18af34E8331AB1E27214de',
            10
        )
        await createReceipt.wait()
        console.log('Tx successful with hash:', createReceipt.hash)

        //await wsProvider.removeAllListeners()
        //await wsProvider.off('block')
    })
})
