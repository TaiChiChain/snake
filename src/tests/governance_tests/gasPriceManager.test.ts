import {test, expect, describe} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_GASPRICE_MANAGER_ADDRESS,
    PROPOSAL_TYPE_GAS_PRICE_UPDATE
} from '../../utils/contracts_static'
import {newProvider} from '../../utils/rpc'
import {
    ST_ADMIN_1,
    ST_ADMIN_2,
    ST_ADMIN_3,
    ST_ADMIN_4,
    ST_ACCOUNT_11,
    ST_ACCOUNT_1
} from '../../utils/accounts_static'
import {hexStringToString, stringToUint8Array} from '../../utils/util'
import fs from 'fs'

describe('TestCases for gas price manager', () => {
    const provider = newProvider()
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Governance/governance.abi',
        'utf8'
    )
    let gasExtraArgs = {
        MaxGasPrice: 20000,
        MinGasPrice: 2000,
        InitGasPrice: 2000,
        GasChangeRateValue: 10
    }
    let gasArgs = stringToUint8Array(JSON.stringify(gasExtraArgs))
    describe('test proposal to change gas price ', () => {
        test('normal change gas price ', async () => {
            console.log('1. admin1 post a proposal to change gas price')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GASPRICE_MANAGER_ADDRESS,
                abi,
                wallet
            )

            const propose = await contract.propose(
                PROPOSAL_TYPE_GAS_PRICE_UPDATE,
                'test change gasPrice',
                'test change gasPrice',
                1000000,
                gasArgs
            )
            await propose.wait()
            const receipt = await provider.getTransactionReceipt(propose.hash)
            console.log('receipt is', receipt)
            expect(receipt?.to).toBe(ST_GASPRICE_MANAGER_ADDRESS)
            let data = hexStringToString(receipt?.logs[0].data)
            console.log('data is', data)
            let obj = JSON.parse(data)
            expect(obj.ID).toBeGreaterThan(0)
            expect(obj.Type).toBe(PROPOSAL_TYPE_GAS_PRICE_UPDATE)
            expect(obj.Status).toBe(0)

            console.log('1.1 admin1 query this proposal')
            let res = await contract.proposal(obj.ID)
            console.log('res is ', hexStringToString(res))
            expect(hexStringToString(res)).toMatch('"ID":' + obj.ID)

            console.log('2. admin2 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
            contract = new ethers.Contract(
                ST_GASPRICE_MANAGER_ADDRESS,
                abi,
                wallet
            )

            const result_2 = await contract.vote(
                obj.ID,
                0,
                stringToUint8Array('test')
            )
            await result_2.wait()
            const receipt_2 = await provider.getTransactionReceipt(
                result_2.hash
            )
            data = hexStringToString(receipt_2?.logs[0].data)
            expect(data).toMatch('"Status":0')

            console.log('3. admin3 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
            contract = new ethers.Contract(
                ST_GASPRICE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            const result_3 = await contract.vote(
                obj.ID,
                0,
                stringToUint8Array('test')
            )
            await result_3.wait()
            const receipt_3 = await provider.getTransactionReceipt(
                result_3.hash
            )
            data = hexStringToString(receipt_3?.logs[0].data)
            expect(data).toMatch('"Status":1')

            console.log('4. admin4 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_4.privateKey, provider)
            contract = new ethers.Contract(
                ST_GASPRICE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                const result_4 = await contract.vote(
                    obj.ID,
                    0,
                    stringToUint8Array('test')
                )
                await result_4.wait()
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('user post a proposal to add nodes ', async () => {
            console.log('1. user1 post a proposal to add nodes')
            let wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GASPRICE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                let propose = await contract.propose(
                    PROPOSAL_TYPE_GAS_PRICE_UPDATE,
                    'test add node',
                    'test add node',
                    1000000,
                    gasArgs
                )
                await propose.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('admin post a proposal to add nodes with wrong blocks ', async () => {
            console.log('1. admin1 post a proposal to add nodes')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GASPRICE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                let propose = await contract.propose(
                    PROPOSAL_TYPE_GAS_PRICE_UPDATE,
                    'test add node',
                    'test add node',
                    1,
                    gasArgs
                )
                await propose.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('user post a proposal to remove nodes ', async () => {
            console.log('1. user1 post a proposal to remove nodes')
            let wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GASPRICE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                let propose = await contract.propose(
                    PROPOSAL_TYPE_GAS_PRICE_UPDATE,
                    'test remove node',
                    'test remove node',
                    1000000,
                    gasArgs
                )
                await propose.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('admin post a proposal to remove nodes with wrong blocks ', async () => {
            console.log('1. admin1 post a proposal to remove nodes')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GASPRICE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                let propose = await contract.propose(
                    PROPOSAL_TYPE_GAS_PRICE_UPDATE,
                    'test remove node',
                    'test remove node',
                    1,
                    gasArgs
                )
                await propose.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })
    })
})
