import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {ST_ACCOUNT_4} from '../../utils/accounts_static'
import {newProvider, request, transferAXM} from '../../utils/rpc'

//The first column of the cases element is the call input parameter
//The second column of the cases elements is the result expected to be returned

describe('TestCases of Transaction API', () => {
    const provider = newProvider()
    const wallet = new ethers.Wallet(ST_ACCOUNT_4.privateKey, provider)

    describe('test tx correctly replaced in tx_pool queued', () => {
        test('tx with same nonce, gas_price increase', async () => {
            const wallet_random = ethers.Wallet.createRandom()
            const addressTo = await wallet_random.getAddress()
            const nonce = await provider.getTransactionCount(wallet.address)
            console.log('initial nonce is', nonce)
            //console.log('transfer AXM from', wallet.address, 'to', addressTo)
            for (let i = 1; i < 10; i++) {
                // Create tx object
                const tx = {
                    chainId: '1356',
                    nonce: nonce + i,
                    gasLimit: 21000,
                    gasPrice: 10000000000000 * i,
                    to: addressTo,
                    value: ethers.parseEther('1')
                }
                // signTx
                const singnedTx = await wallet.signTransaction(tx)
                // sendTx
                let res = await request('eth_sendRawTransaction', [singnedTx])
                console.log(i, 'res is :', res)
                expect(JSON.stringify(res.result)).toMatch(/0x[0-9a-fA-F]+/)
                let res2 = await request('txpool_content')
                console.log(i, 'res2 is :', res2)
                // Confirm the tx was correctly replaced
                expect(JSON.stringify(res2.result.queued)).toMatch(res.result)
                expect(res2.result.notReadyTxCount).toEqual(1)
            }
        })
    })

    describe('test tx correctly replaced in tx_pool pending ', () => {
        test('tx with correct nonce increase', async () => {
            const wallet_random = ethers.Wallet.createRandom()
            const addressTo = await wallet_random.getAddress()
            const nonce = await provider.getTransactionCount(wallet.address)
            console.log('nonce is', nonce)
            console.log('transfer AXM from', wallet.address, 'to', addressTo)
            for (let i = 0; i < 100; i++) {
                // Create tx object
                let tx = {
                    chainId: '1356',
                    nonce: nonce + i,
                    gasLimit: 21000,
                    gasPrice: 10000000000000 * (i + 1),
                    to: addressTo,
                    value: ethers.parseEther('1')
                }
                // signTx
                let singnedTx = await wallet.signTransaction(tx)
                // sendTx
                let res = await request('eth_sendRawTransaction', [singnedTx])
                console.log('res is :', res)
                expect(JSON.stringify(res.result)).toMatch(/0x[0-9a-fA-F]+/)
                let res2 = await request('txpool_content')
                console.log('res2 is :', res2)
                // Confirm the tx was correctly replaced
                expect(JSON.stringify(res2.result.pending)).toMatch(res.result)

                // send another tx with same nonce
                let tx2 = {
                    chainId: '1356',
                    nonce: nonce + i,
                    gasLimit: 21000,
                    gasPrice: 10000000000000 * 2 * (i + 1),
                    to: addressTo,
                    value: ethers.parseEther('1')
                }
                // signTx
                let singnedTx2 = await wallet.signTransaction(tx2)
                // sendTx
                let res3 = await request('eth_sendRawTransaction', [singnedTx2])
                console.log('res3 is :', res3)
                expect(JSON.stringify(res3.result)).toMatch(/0x[0-9a-fA-F]+/)
                let res4 = await request('txpool_content')
                console.log('res4 is :', res4)
                // Confirm the tx was correctly replaced
                expect(JSON.stringify(res4.result.pending)).toMatch(res3.result)
                expect(res4.result.readyTxCount).toEqual(i + 1)
            }
        })
    })
})
