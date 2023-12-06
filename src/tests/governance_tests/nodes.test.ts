import {test, expect, describe} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
    PROPOSAL_TYPE_NODE_ADD,
    PROPOSAL_TYPE_NODE_REMOVE,
    PROPOSAL_TYPE_NODE_UPGRADE
} from '../../utils/contracts_static'
import {newProvider} from '../../utils/rpc'
import {
    ST_ADMIN_1,
    ST_ADMIN_2,
    ST_ADMIN_3,
    ST_ADMIN_4,
    ST_ACCOUNT_11,
    ST_ACCOUNT_12,
    ST_ACCOUNT_13,
    ST_ACCOUNT_14,
    ST_ACCOUNT_1
} from '../../utils/accounts_static'
import {hexStringToString, stringToUint8Array} from '../../utils/util'
import fs from 'fs'

describe('TestCases for nodes manager', () => {
    const provider = newProvider()
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Governance/governance.abi',
        'utf8'
    )
    let extraArgs = {
        Nodes: [
            {
                NodeId: ST_ACCOUNT_11.p2pId,
                Address: ST_ACCOUNT_11.address,
                Name: 'ST_ACCOUNT_11'
            }
            /* {
                NodeId: ST_ACCOUNT_12.p2pId,
                Address: ST_ACCOUNT_12.address,
                Name: 'ST_ACCOUNT_12'
            }, */
        ]
    }
    let args = stringToUint8Array(JSON.stringify(extraArgs))
    describe('test proposal to add and remove nodes ', () => {
        test('normal add nodes ', async () => {
            console.log('1. admin1 post a proposal to add nodes')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )

            const propose = await contract.propose(
                PROPOSAL_TYPE_NODE_ADD,
                'test add node',
                'test add node',
                1000000,
                args
            )
            await propose.wait()
            const receipt = await provider.getTransactionReceipt(propose.hash)
            expect(receipt?.to).toBe(ST_GOVERNANCE_NODE_MANAGER_ADDRESS)
            let data = hexStringToString(receipt?.logs[0].data)
            //console.log(data)
            let obj = JSON.parse(data)
            expect(obj.ID).toBeGreaterThan(0)
            expect(obj.Type).toBe(PROPOSAL_TYPE_NODE_ADD)
            expect(obj.Status).toBe(0)

            console.log('1.1 admin1 query this proposal')
            let res = await contract.proposal(obj.ID)
            //console.log('res is ', hexStringToString(res))
            expect(hexStringToString(res)).toMatch('"ID":' + obj.ID)

            console.log('2. admin2 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
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
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
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
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
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
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                let propose = await contract.propose(
                    PROPOSAL_TYPE_NODE_ADD,
                    'test add node',
                    'test add node',
                    1000000,
                    args
                )
                await propose.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('admin post a proposal add already existing nodes  ', async () => {
            console.log('1. admin1 post a proposal to add admin nodes')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            let extraArgs = {
                Nodes: [
                    {
                        NodeId: ST_ADMIN_1.p2pId,
                        Address: ST_ADMIN_1.address,
                        Name: 'ST_ADMIN_1'
                    },
                    {
                        NodeId: ST_ACCOUNT_11.p2pId,
                        Address: ST_ACCOUNT_11.address,
                        Name: 'ST_ACCOUNT_11'
                    }
                ]
            }
            let args = stringToUint8Array(JSON.stringify(extraArgs))
            try {
                let propose = await contract.propose(
                    PROPOSAL_TYPE_NODE_ADD,
                    'test add node',
                    'test add node',
                    1000000,
                    args
                )
                await propose.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('admin post a proposal to add nodes with wrong blocks ', async () => {
            console.log('1. admin1 post a proposal to add nodes')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                let propose = await contract.propose(
                    PROPOSAL_TYPE_NODE_ADD,
                    'test add node',
                    'test add node',
                    1,
                    args
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
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                let propose = await contract.propose(
                    PROPOSAL_TYPE_NODE_REMOVE,
                    'test remove node',
                    'test remove node',
                    1000000,
                    args
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
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                let propose = await contract.propose(
                    PROPOSAL_TYPE_NODE_REMOVE,
                    'test remove node',
                    'test remove node',
                    1,
                    args
                )
                await propose.wait()
                expect(true).toBe(false)
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('normal remove nodes ', async () => {
            console.log('1. admin1 post a proposal to remove nodes')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )

            const propose = await contract.propose(
                PROPOSAL_TYPE_NODE_REMOVE,
                'test remove node',
                'test remove node',
                1000000,
                args
            )
            await propose.wait()
            const receipt = await provider.getTransactionReceipt(propose.hash)
            expect(receipt?.to).toBe(ST_GOVERNANCE_NODE_MANAGER_ADDRESS)
            let data = hexStringToString(receipt?.logs[0].data)
            let obj = JSON.parse(data)
            expect(obj.ID).toBeGreaterThan(0)
            expect(obj.Type).toBe(PROPOSAL_TYPE_NODE_REMOVE)
            expect(obj.Status).toBe(0)

            console.log('1.1 admin1 query this proposal')
            let res = await contract.proposal(obj.ID)
            //console.log('res is ', hexStringToString(res))
            expect(hexStringToString(res)).toMatch('"ID":' + obj.ID)

            console.log('2. admin2 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
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
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
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
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
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
    })
})

describe('TestCases for nodes upgrade', () => {
    const provider = newProvider()
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Governance/governance.abi',
        'utf8'
    )
    let upgradeExtraArgs = {
        DownloadUrls: [
            'https://github.com/axiomesh/axiom-ledger/archive/refs/tags/v0.0.1.tar.gz',
            'https://github.com/axiomesh/axiom-ledger/archive/refs/tags/v0.0.2.tar.gz'
        ],
        CheckHash:
            'ed15d72d6d437db61a00abc6fa20c3d34f33a9221b8dc770df5ae32149b369bb'
    }
    let upgradeArgs = stringToUint8Array(JSON.stringify(upgradeExtraArgs))

    test('normal upgrade nodes ', async () => {
        console.log('1. admin1 post a proposal to upgrade nodes')
        let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
        let contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
            abi,
            wallet
        )

        const propose = await contract.propose(
            PROPOSAL_TYPE_NODE_UPGRADE,
            'test upgrade node',
            'test upgrade node',
            1000000,
            upgradeArgs
        )
        await propose.wait()
        const receipt = await provider.getTransactionReceipt(propose.hash)
        expect(receipt?.to).toBe(ST_GOVERNANCE_NODE_MANAGER_ADDRESS)
        //console.log('receipt is ', receipt)
        let data = hexStringToString(receipt?.logs[0].data)
        //console.log('data is ', data)
        let obj = JSON.parse(data)
        expect(obj.ID).toBeGreaterThan(0)
        expect(obj.Type).toBe(PROPOSAL_TYPE_NODE_UPGRADE)
        expect(obj.Status).toBe(0)

        console.log('1.1 admin1 query this proposal')
        let res = await contract.proposal(obj.ID)
        //console.log('res is ', hexStringToString(res))
        expect(hexStringToString(res)).toMatch('"ID":' + obj.ID)

        console.log('2. admin2 vote this proposal')
        wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
        contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
            abi,
            wallet
        )

        const result_2 = await contract.vote(
            obj.ID,
            0,
            stringToUint8Array('test')
        )
        await result_2.wait()
        const receipt_2 = await provider.getTransactionReceipt(result_2.hash)
        data = hexStringToString(receipt_2?.logs[0].data)
        expect(data).toMatch('"Status":0')

        console.log('3. admin3 vote this proposal')
        wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
        contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
            abi,
            wallet
        )
        const result_3 = await contract.vote(
            obj.ID,
            0,
            stringToUint8Array('test')
        )
        await result_3.wait()
        const receipt_3 = await provider.getTransactionReceipt(result_3.hash)
        data = hexStringToString(receipt_3?.logs[0].data)
        expect(data).toMatch('"Status":1')

        console.log('4. admin4 vote this proposal')
        wallet = new ethers.Wallet(ST_ADMIN_4.privateKey, provider)
        contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
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

    test('abnormal upgrade nodes with wrong args ', async () => {
        let upgradeExtraArgs = {
            DownloadUrls: [
                'https://github.com/axiomesh/axiom-ledger/archive/refs/tags/v0.0.1.tar.gz',
                'https://github.com/axiomesh/axiom-ledger/archive/refs/tags/v0.0.1.tar.gz'
            ],
            CheckHash:
                'ed15d72d6d437db61a00abc6fa20c3d34f33a9221b8dc770df5ae32149b369bb'
        }
        let upgradeArgs = stringToUint8Array(JSON.stringify(upgradeExtraArgs))
        console.log('1. admin1 post a proposal to upgrade nodes')
        let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
        let contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
            abi,
            wallet
        )
        try {
            const propose = await contract.propose(
                PROPOSAL_TYPE_NODE_UPGRADE,
                'test upgrade node',
                'test upgrade node',
                1000000,
                upgradeArgs
            )
            await propose.wait()
            expect(false).toBe(true)
        } catch (error: any) {
            //console.log('error is:', error.message)
            expect(error.message).toMatch('transaction execution reverted')
        }
    })

    test('abnormal upgrade nodes with wrong block number ', async () => {
        console.log('1. admin1 post a proposal to upgrade nodes')
        let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
        let contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
            abi,
            wallet
        )
        try {
            const propose = await contract.propose(
                PROPOSAL_TYPE_NODE_UPGRADE,
                'test upgrade node',
                'test upgrade node',
                1,
                upgradeArgs
            )
            await propose.wait()
            expect(false).toBe(true)
        } catch (error: any) {
            //console.log('error is:', error.message)
            expect(error.message).toMatch('transaction execution reverted')
        }
    })

    test('user upgrade nodes', async () => {
        console.log('1. user1 post a proposal to upgrade nodes')
        let wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
        let contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
            abi,
            wallet
        )
        try {
            const propose = await contract.propose(
                PROPOSAL_TYPE_NODE_UPGRADE,
                'test upgrade node',
                'test upgrade node',
                1,
                upgradeArgs
            )
            await propose.wait()
            expect(false).toBe(true)
        } catch (error: any) {
            //console.log('error is:', error.message)
            expect(error.message).toMatch('transaction execution reverted')
        }
    })
})
