import {test, expect, describe} from '@jest/globals'
import {newProvider, transfer} from '../../utils/rpc'
import {
    ST_ADMIN_1,
    ST_ADMIN_2,
    ST_ADMIN_3,
    ST_ADMIN_4,
    ST_ACCOUNT_5
} from '../../utils/accounts_static'
import {
    ST_CONTRACT_DIR,
    ST_GOVERNANCE_COUNCIL_ADDRESS,
    PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE
} from '../../utils/contracts_static'
import {turnLogs, hexToString, stringToUint8Array} from '../../utils/util'
import {ethers} from '@axiomesh/axiom'
import fs from 'fs'

describe('TestCases of councilManager', () => {
    const provider = newProvider()
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Governance/governance.abi',
        'utf8'
    )

    let council_extraArgs = {
        candidates: [
            {address: ST_ADMIN_1.address, weight: 1, name: 'test 1'},
            {address: ST_ADMIN_2.address, weight: 1, name: 'test 2'},
            {address: ST_ADMIN_3.address, weight: 1, name: 'test 3'},
            {address: ST_ADMIN_4.address, weight: 1, name: 'test 4'}
        ]
    }
    let councilArgs = stringToUint8Array(JSON.stringify(council_extraArgs))
    describe('Suite_A: test councilManager with admins', () => {
        test('test normal propose and vote pass', async () => {
            console.log('1. admin1 post a proposal to update council member')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )
            let obj: any = {}

            const propose = await contract.propose(
                PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE,
                'test update council_member',
                'test update council_member',
                1000000,
                councilArgs,
                {
                    gasPrice: 1000000000000,
                    gasLimit: 300000
                }
            )
            await propose.wait()
            const receipt = await provider.getTransactionReceipt(propose.hash)

            if (receipt && receipt.logs.length > 0) {
                expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
                //console.log('receipt.logs is:', receipt.logs)
                let log = turnLogs(receipt.logs[0])
                let parsedLog = contract.interface.parseLog(log)
                //console.log('parsedLog is:', parsedLog)
                expect(parsedLog?.name).toBe('Propose')

                let data = hexToString(parsedLog?.args[3])
                obj = JSON.parse(data)
                expect(obj.ID).toBeGreaterThan(0)
                expect(obj.Type).toBe(PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE)
                expect(data).toMatch('"Status":0')
            } else {
                console.log('receipt or receipt.logs is null')
            }

            console.log('1.1 admin1 query this proposal')
            let res = await contract.proposal(obj.ID)
            // res is json object
            //console.log('res is:', res)
            expect(res.ID).toBe(BigInt(obj.ID))

            console.log('2. admin2 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )

            const result_2 = await contract.vote(obj.ID, 0, {
                gasPrice: 10000000000000,
                gasLimit: 300000
            })
            await result_2.wait()
            const receipt_2 = await provider.getTransactionReceipt(
                result_2.hash
            )

            if (receipt_2 && receipt_2.logs.length > 0) {
                expect(receipt_2.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
                let log = turnLogs(receipt_2.logs[0])
                let parsedLog = contract.interface.parseLog(log)
                //console.log('parsedLog is:', parsedLog)
                expect(parsedLog?.name).toBe('Vote')

                let data = hexToString(parsedLog?.args[3])
                obj = JSON.parse(data)
                expect(obj.ID).toBeGreaterThan(0)
                expect(obj.Type).toBe(PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE)
                expect(data).toMatch('"Status":0')
            } else {
                console.log('receipt or receipt.logs is null')
            }

            console.log('3. admin3 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )
            const result_3 = await contract.vote(obj.ID, 0, {
                gasPrice: 10000000000000,
                gasLimit: 300000
            })
            await result_3.wait()
            const receipt_3 = await provider.getTransactionReceipt(
                result_3.hash
            )

            if (receipt_3 && receipt_3.logs.length > 0) {
                expect(receipt_3.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
                //console.log('logs is:', receipt_3.logs)
                let log = turnLogs(receipt_3.logs[0])
                let parsedLog = contract.interface.parseLog(log)
                //console.log('parsedLog is:', parsedLog)
                expect(parsedLog?.name).toBe('Vote')

                let data = hexToString(parsedLog?.args[3])
                obj = JSON.parse(data)
                expect(obj.ID).toBeGreaterThan(0)
                expect(obj.Type).toBe(PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE)
                expect(data).toMatch('"Status":1')
            } else {
                console.log('receipt or receipt.logs is null')
            }

            console.log('4. admin4 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_4.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )
            try {
                const result_4 = await contract.vote(obj.ID, 0, {
                    gasPrice: 10000000000000,
                    gasLimit: 300000
                })
                await result_4.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('test repeat propose and repeat vote', async () => {
            console.log('1. admin1 post a proposal to update council member')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )
            let obj: any = {}

            const propose = await contract.propose(
                PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE,
                'test update council_member',
                'test update council_member',
                1000000,
                councilArgs,
                {
                    gasPrice: 1000000000000,
                    gasLimit: 300000
                }
            )
            await propose.wait()
            const receipt = await provider.getTransactionReceipt(propose.hash)

            if (receipt && receipt.logs.length > 0) {
                expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
                let log = turnLogs(receipt.logs[0])
                let parsedLog = contract.interface.parseLog(log)
                //console.log('parsedLog is:', parsedLog)
                expect(parsedLog?.name).toBe('Propose')

                let data = hexToString(parsedLog?.args[3])
                obj = JSON.parse(data)
                expect(obj.ID).toBeGreaterThan(0)
                expect(obj.Type).toBe(PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE)
                expect(data).toMatch('"Status":0')
            } else {
                console.log('receipt or receipt.logs is null')
            }

            console.log('2. admin2 repeat propose')
            wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )

            try {
                const propose_2 = await contract.propose(
                    PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE,
                    'test update council_member',
                    'test update council_member',
                    1000000,
                    councilArgs,
                    {
                        gasPrice: 1000000000000,
                        gasLimit: 300000
                    }
                )
                await propose_2.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }

            // finish the proposal
            console.log('2. admin2 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )

            const result_2 = await contract.vote(obj.ID, 1, {
                gasPrice: 10000000000000,
                gasLimit: 300000
            })
            await result_2.wait()

            console.log('2. admin2 repeat vote this proposal')
            try {
                const vote_2 = await contract.vote(obj.ID, 1, {
                    gasPrice: 10000000000000,
                    gasLimit: 300000
                })
                await vote_2.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }

            console.log('3. admin3 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )
            const result_3 = await contract.vote(obj.ID, 1, {
                gasPrice: 10000000000000,
                gasLimit: 300000
            })
            await result_3.wait()
            const receipt_3 = await provider.getTransactionReceipt(
                result_3.hash
            )

            if (receipt_3 && receipt_3.logs.length > 0) {
                expect(receipt_3.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
                let log = turnLogs(receipt_3.logs[0])
                let parsedLog = contract.interface.parseLog(log)
                //console.log('parsedLog is:', parsedLog)
                expect(parsedLog?.name).toBe('Vote')

                let data = hexToString(parsedLog?.args[3])
                obj = JSON.parse(data)
                expect(obj.ID).toBeGreaterThan(0)
                expect(data).toMatch('"Status":2')
            } else {
                console.log('receipt or receipt.logs is null')
            }
        })
    })

    describe('Suite_B: test councilManager with users', () => {
        test('test community user propose', async () => {
            console.log('1. user1 post a proposal to update council member')
            let wallet = new ethers.Wallet(ST_ACCOUNT_5.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )
            try {
                const propose = await contract.propose(
                    PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE,
                    'test update council_member',
                    'test update council_member',
                    1000000,
                    councilArgs,
                    {
                        gasPrice: 1000000000000,
                        gasLimit: 300000
                    }
                )
                await propose.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('test community user vote', async () => {
            console.log('1. admin1 post a proposal to update council member')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )
            let obj: any = {}

            const propose = await contract.propose(
                PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE,
                'test update council_member',
                'test update council_member',
                1000000,
                councilArgs,
                {
                    gasPrice: 1000000000000,
                    gasLimit: 300000
                }
            )
            await propose.wait()
            const receipt = await provider.getTransactionReceipt(propose.hash)

            if (receipt && receipt.logs.length > 0) {
                expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
                let log = turnLogs(receipt.logs[0])
                let parsedLog = contract.interface.parseLog(log)
                //console.log('parsedLog is:', parsedLog)
                expect(parsedLog?.name).toBe('Propose')

                let data = hexToString(parsedLog?.args[3])
                obj = JSON.parse(data)
                expect(obj.ID).toBeGreaterThan(0)
                expect(obj.Type).toBe(PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE)
                expect(data).toMatch('"Status":0')
            } else {
                console.log('receipt or receipt.logs is null')
            }

            console.log('2. user5 vote this proposal')
            try {
                const vote_user5 = await contract.vote(obj.ID, 0, {
                    gasPrice: 10000000000000,
                    gasLimit: 300000
                })
                await vote_user5.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
                console.log('user5 Voting failed')
            }

            // finish the proposal
            console.log('2. admin2 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )

            const result_2 = await contract.vote(obj.ID, 0, {
                gasPrice: 10000000000000,
                gasLimit: 300000
            })
            await result_2.wait()

            console.log('3. admin3 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )
            const result_3 = await contract.vote(obj.ID, 0, {
                gasPrice: 10000000000000,
                gasLimit: 300000
            })
            await result_3.wait()
            const receipt_3 = await provider.getTransactionReceipt(
                result_3.hash
            )

            if (receipt_3 && receipt_3.logs.length > 0) {
                expect(receipt_3.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
                let log = turnLogs(receipt_3.logs[0])
                let parsedLog = contract.interface.parseLog(log)
                //console.log('parsedLog is:', parsedLog)
                expect(parsedLog?.name).toBe('Vote')

                let data = hexToString(parsedLog?.args[3])
                obj = JSON.parse(data)
                expect(obj.ID).toBeGreaterThan(0)
                expect(data).toMatch('"Status":1')
            } else {
                console.log('receipt or receipt.logs is null')
            }
        })
    })

    describe('Suite_C: test councilManager with error params', () => {
        test('test propose with error expired blocknumber', async () => {
            console.log(
                '1. admin1 post a proposal with error expired blocknumber'
            )
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )

            try {
                const propose = await contract.propose(
                    PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE,
                    'test update council_member',
                    'test update council_member',
                    1,
                    councilArgs,
                    {
                        gasPrice: 1000000000000,
                        gasLimit: 300000
                    }
                )
                await propose.wait()
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('test propose with error candidates info', async () => {
            let error_extraArgs = {
                candidates: [
                    {address: '0x12345', weight: 1, name: 'test 1'},
                    {address: ST_ADMIN_2.address, weight: -100, name: 'test 2'},
                    {address: ST_ADMIN_3.address, weight: 1, name: 'test 3'},
                    {address: ST_ADMIN_4.address, weight: 1, name: 'test 4'}
                ]
            }
            let errorArgs = stringToUint8Array(JSON.stringify(error_extraArgs))

            console.log('1. admin1 post a proposal with error candidates info')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                abi,
                wallet
            )

            try {
                const propose = await contract.propose(
                    PROPOSAL_TYPE_COUNCIL_MEMBER_UPDATE,
                    'test update council_member',
                    'test update council_member',
                    100000,
                    errorArgs,
                    {
                        gasPrice: 1000000000000,
                        gasLimit: 300000
                    }
                )
                await propose.wait()
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })
    })
})
