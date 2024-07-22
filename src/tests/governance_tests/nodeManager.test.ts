import {test, expect, describe} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_SCRIPTS_DIR,
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
    ST_ACCOUNT_1
} from '../../utils/accounts_static'
import {hexToString, isString} from '../../utils/util'
import fs from 'fs'
import path from 'path'
const util = require('util')
const child_process = require('child_process')

describe('TestCases for nodes manager', () => {
    const provider = newProvider()
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Governance/governance.abi',
        'utf8'
    )
    /*
    beforeAll(async () => {
        console.log('Prepare new node config')

        const nodeGenerateScript = path.join(
            ST_SCRIPTS_DIR,
            'genereta_new_nodes_config.sh'
        )

        await runShellScript(nodeGenerateScript, '')
        console.log('Prepare new node config done')
    })
     */

    describe('test add nodes', () => {
        const nodePostJoinScript = path.join(
            ST_SCRIPTS_DIR,
            'propose_node_join.sh'
        )
        const node5ConfigPath = path.join(
            ST_SCRIPTS_DIR,
            'new-nodes/node5 node5'
        )

        test('normal add node and vote pass', async () => {
            console.log('1.new node5 post a proposal to join cluster')
            let proposalId = await runShellScript(
                nodePostJoinScript,
                node5ConfigPath
            )
            // proposalId should be hex string
            if (isString(proposalId)) {
                console.log('proposalId is:', proposalId.toString())
                proposalId = parseInt(proposalId)
            } else {
                console.error('proposalId is wrong format')
            }

            expect(proposalId).not.toBeNull()
            expect(proposalId).toBeGreaterThan(0)

            console.log('1.1 admin1 query this proposal')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            let res = await contract.proposal(proposalId)
            console.log(res)
            // res is json object
            expect(res.ID).toBe(BigInt(proposalId as number))

            console.log('2. admin2 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )

            const result_2 = await contract.vote(proposalId, 0, {
                gasPrice: 10000000000000,
                gasLimit: 300000
            })
            await result_2.wait()
            const receipt_2 = await provider.getTransactionReceipt(
                result_2.hash
            )
            //console.log('receipt_2 is:', receipt_2?.logs)
            let data = hexToString(receipt_2?.logs[0].data)
            //console.log('data is:', data)
            expect(data).toMatch('"Status":0')

            console.log('3. admin3 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            const result_3 = await contract.vote(proposalId, 0, {
                gasPrice: 10000000000000,
                gasLimit: 300000
            })
            await result_3.wait()
            const receipt_3 = await provider.getTransactionReceipt(
                result_3.hash
            )
            //console.log('receipt_3 logs is:', receipt_3?.logs)
            data = hexToString(receipt_3?.logs[1].data)
            //console.log('data is:', data)
            expect(data).toMatch('"Status":1')

            console.log('4. admin4 vote this proposal')
            wallet = new ethers.Wallet(ST_ADMIN_4.privateKey, provider)
            contract = new ethers.Contract(
                ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
                abi,
                wallet
            )
            try {
                const result_4 = await contract.vote(proposalId, 0, {
                    gasPrice: 10000000000000,
                    gasLimit: 300000
                })
                await result_4.wait()
            } catch (error: any) {
                //console.log('error is:', error.message)
                expect(error.message).toMatch('transaction execution reverted')
            }
        })

        test('add node repeat', async () => {
            console.log(
                '1.new node post a proposal to join cluster with same name'
            )
            let proposalId = await runShellScript(
                nodePostJoinScript,
                node5ConfigPath
            )
            // proposalId should be hex string
            if (isString(proposalId)) {
                console.log('proposalId is:', proposalId.toString())
                proposalId = parseInt(proposalId)
            } else {
                console.error('proposalId is wrong format')
            }

            expect(proposalId).not.toBeNull()
            expect(proposalId).toBeGreaterThan(0)
        })
    })
})

/*
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
            upgradeArgs,
            {
                gasPrice: 10000000000000,
                gasLimit: 300000
            }
        )
        await propose.wait()
        const receipt = await provider.getTransactionReceipt(propose.hash)
        expect(receipt?.to).toBe(ST_GOVERNANCE_NODE_MANAGER_ADDRESS)
        //console.log('receipt is ', receipt)
        let data = hexToString(receipt?.logs[0].data)
        //console.log('data is ', data)
        let obj = JSON.parse(data)
        expect(proposalId).toBeGreaterThan(0)
        expect(obj.Type).toBe(PROPOSAL_TYPE_NODE_UPGRADE)
        expect(obj.Status).toBe(0)

        console.log('1.1 admin1 query this proposal')
        let res = await contract.proposal(proposalId)
        // res is json object
        expect(res.ID).toBe(BigInt(proposalId))

        console.log('2. admin2 vote this proposal')
        wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
        contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
            abi,
            wallet
        )

        const result_2 = await contract.vote(proposalId, 0, {
            gasPrice: 10000000000000,
            gasLimit: 300000
        })
        await result_2.wait()
        const receipt_2 = await provider.getTransactionReceipt(result_2.hash)
        data = hexToString(receipt_2?.logs[0].data)
        expect(data).toMatch('"Status":0')

        console.log('3. admin3 vote this proposal')
        wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
        contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
            abi,
            wallet
        )
        const result_3 = await contract.vote(proposalId, 0, {
            gasPrice: 10000000000000,
            gasLimit: 300000
        })
        await result_3.wait()
        const receipt_3 = await provider.getTransactionReceipt(result_3.hash)
        data = hexToString(receipt_3?.logs[0].data)
        expect(data).toMatch('"Status":1')

        console.log('4. admin4 vote this proposal')
        wallet = new ethers.Wallet(ST_ADMIN_4.privateKey, provider)
        contract = new ethers.Contract(
            ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
            abi,
            wallet
        )
        try {
            const result_4 = await contract.vote(proposalId, 0, {
                gasPrice: 10000000000000,
                gasLimit: 300000
            })
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
                upgradeArgs,
                {
                    gasPrice: 10000000000000,
                    gasLimit: 300000
                }
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
                upgradeArgs,
                {
                    gasPrice: 10000000000000,
                    gasLimit: 300000
                }
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
                upgradeArgs,
                {
                    gasPrice: 10000000000000,
                    gasLimit: 300000
                }
            )
            await propose.wait()
            expect(false).toBe(true)
        } catch (error: any) {
            //console.log('error is:', error.message)
            expect(error.message).toMatch('transaction execution reverted')
        }
    })
})

*/

async function runShellScript(script: any, args: any) {
    const exec = util.promisify(child_process.exec)
    return new Promise((resolve, reject) => {
        exec(
            `bash ${script} ${args}`,
            (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.error(`exec error info: ${error}`)
                    return
                }

                if (stderr) {
                    console.log(`stderr info: ${stderr}`)
                    return
                }
                resolve(stdout ? stdout : stderr)
            }
        )
    })
}
