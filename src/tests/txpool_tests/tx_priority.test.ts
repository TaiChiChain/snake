import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {ST_ACCOUNT_4} from '../../utils/accounts_static'
import {newProvider, request, transferAXM} from '../../utils/rpc'

//The first column of the cases element is the call input parameter
//The second column of the cases elements is the result expected to be returned

describe('TestCases of Transaction API', () => {
    const provider = newProvider()
    const wallet = new ethers.Wallet(ST_ACCOUNT_4.privateKey, provider)

    describe('test tx correctly replaced in tx_pool ', () => {
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
                    nonce: nonce + 1,
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

    describe('test eth_sendRawTransaction ', () => {
        test('transfer AXM', async () => {
            const wallet_random = ethers.Wallet.createRandom()
            const addressTo = await wallet_random.getAddress()
            const nonce = await provider.getTransactionCount(wallet.address)
            console.log('nonce is', nonce)
            console.log('transfer AXM from', wallet.address, 'to', addressTo)
            // Create tx object
            const tx = {
                chainId: '1356',
                nonce: nonce + 1,
                gasLimit: 21000,
                gasPrice: ethers.parseUnits('20000', 'gwei'),
                to: addressTo,
                value: ethers.parseEther('1')
            }
            // Signtx - wait for receipt
            const singnedTx = await wallet.signTransaction(tx)
            let res = await request('eth_sendRawTransaction', [singnedTx])
            console.log('res is :', res)
            let res2 = await request('txpool_content')
            console.log('res2 is :', res2)
            expect(res2.result.notReadyTxCount).toEqual(1)
            //expect(JSON.stringify(res.error)).toMatch('verify tx err')
        })
    })
})
