import {test, expect, describe} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_EPOCHMANAGER_ADDRESS
} from '../../utils/contracts_static'
import {newProvider} from '../../utils/rpc'
import {ST_ACCOUNT_1, ST_ADMIN_1} from '../../utils/accounts_static'
import fs from 'fs'

describe('TestCases for EpochManager', () => {
    const provider = newProvider()
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Consensus/EpochManager.abi',
        'utf8'
    )
    var wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
    var contract = new ethers.Contract(ST_EPOCHMANAGER_ADDRESS, abi, wallet)

    describe('test query currentEpoch info ', () => {
        test('admin query', async () => {
            let res = await contract.currentEpoch()
            //console.log('res is:', res)

            expect(res.StartBlock).toEqual(
                res.EpochPeriod * (res.Epoch - BigInt(1))
            )
            expect(res.EpochPeriod).toEqual(BigInt(100))
            expect(res.StakeParams.StakeEnable).toBe(true)
        })

        test('user query', async () => {
            var wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
            var contract = new ethers.Contract(
                ST_EPOCHMANAGER_ADDRESS,
                abi,
                wallet
            )
            let res = await contract.currentEpoch()

            expect(res.StartBlock).toEqual(
                res.EpochPeriod * (res.Epoch - BigInt(1))
            )
            expect(res.EpochPeriod).toEqual(BigInt(100))
            expect(res.StakeParams.StakeEnable).toBe(true)
        })

        test('abnormal query', async () => {
            try {
                await contract.currentEpoch('xxx')
                expect(false).toBe(true)
            } catch (error) {
                //console.log('error is:', error)
                expect(String(error)).toMatch('UNSUPPORTED_OPERATION')
            }
        })
    })

    describe('test query nextEpoch info ', () => {
        test('admin query', async () => {
            let res = await contract.nextEpoch()

            expect(res.EpochPeriod).toEqual(BigInt(100))
            expect(res.StartBlock).toEqual(
                res.EpochPeriod * (res.Epoch - BigInt(1))
            )
            expect(res.StakeParams.StakeEnable).toBe(true)
        })

        test('user query', async () => {
            var wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
            var contract = new ethers.Contract(
                ST_EPOCHMANAGER_ADDRESS,
                abi,
                wallet
            )
            let res = await contract.nextEpoch()

            expect(res.EpochPeriod).toEqual(BigInt(100))
            expect(res.StartBlock).toEqual(
                res.EpochPeriod * (res.Epoch - BigInt(1))
            )
            expect(res.StakeParams.StakeEnable).toBe(true)
        })

        test('abnormal query', async () => {
            try {
                await contract.nextEpoch('xxx')
                expect(false).toBe(true)
            } catch (error) {
                expect(String(error)).toMatch('UNSUPPORTED_OPERATION')
            }
        })
    })

    describe('test query historyEpoch info ', () => {
        test('admin query', async () => {
            let res = await contract.historyEpoch(1)

            expect(res.EpochPeriod).toEqual(BigInt(100))
            expect(res.StartBlock).toEqual(
                res.EpochPeriod * (res.Epoch - BigInt(1))
            )
            expect(res.StakeParams.StakeEnable).toBe(true)
        })

        test('user query', async () => {
            var wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
            var contract = new ethers.Contract(
                ST_EPOCHMANAGER_ADDRESS,
                abi,
                wallet
            )
            let res = await contract.historyEpoch(1)

            expect(res.EpochPeriod).toEqual(BigInt(100))
            expect(res.StartBlock).toEqual(
                res.EpochPeriod * (res.Epoch - BigInt(1))
            )
            expect(res.StakeParams.StakeEnable).toBe(true)
        })

        test('query with invalid args(string)', async () => {
            try {
                await contract.historyEpoch('xxx')
                expect(false).toBe(true)
            } catch (error) {
                expect(String(error)).toMatch('INVALID_ARGUMENT')
            }
        })

        test('query with null epochID', async () => {
            try {
                await contract.historyEpoch()
                expect(false).toBe(true)
            } catch (error) {
                expect(String(error)).toMatch('UNSUPPORTED_OPERATION')
            }
        })

        test('query with nonexistent epochID', async () => {
            try {
                await contract.historyEpoch(1000)
                expect(false).toBe(true)
            } catch (error) {
                expect(String(error)).toMatch('CALL_EXCEPTION')
            }
        })

        test('query with 0 epochID', async () => {
            try {
                await contract.historyEpoch(0)
                expect(false).toBe(true)
            } catch (error) {
                expect(String(error)).toMatch('CALL_EXCEPTION')
            }
        })
    })
})
