import {test, expect, describe} from '@jest/globals'
import {ethers, id} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_GOVERNANCE_KYC_ADDRESS,
    PROPOSAL_TYPE_KYC_SERVICE_ADD,
    PROPOSAL_TYPE_KYC_SERVICE_REMOVE
} from '../../utils/contracts_static'
import {newProvider} from '../../utils/rpc'
import {
    ST_ADMIN_1,
    ST_ACCOUNT_1,
    ST_ACCOUNT_2,
    ST_ADMIN_2,
    ST_ADMIN_3
} from '../../utils/accounts_static'
import {hexStringToString, stringToUint8Array} from '../../utils/util'
import fs from 'fs'

describe('TestCases for kyc service', () => {
    const provider = newProvider()
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Governance/governance.abi',
        'utf8'
    )
    let extraArgs = {
        Services: [
            {
                KycAddr: ST_ACCOUNT_1.address
            },
            {
                KycAddr: ST_ACCOUNT_2.address
            }
        ]
    }
    let args = stringToUint8Array(JSON.stringify(extraArgs))
    describe('test normal proposal and vote ', () => {
        test('add kyc services', async () => {
            console.log('1. admin1 post a proposal to add kycservices')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            const contract = new ethers.Contract(
                ST_GOVERNANCE_KYC_ADDRESS,
                abi,
                wallet
            )

            const propose = await contract.propose(
                PROPOSAL_TYPE_KYC_SERVICE_ADD,
                'add kyc services',
                'add kyc services',
                1000,
                args
            )
            await propose.wait()
            const receipt = await provider.getTransactionReceipt(propose.hash)
            expect(receipt?.to).toBe(ST_GOVERNANCE_KYC_ADDRESS)
            let data = hexStringToString(receipt?.logs[0].data)

            console.log(data)
            expect(data).toMatch('"Status":0')

            let obj = JSON.parse(data)

            //const match = data.match(/(\d+)/g)
            if (obj.ID) {
                //console.log(BigInt(match[0]))
                console.log('2. admin2 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
                let contract = new ethers.Contract(
                    ST_GOVERNANCE_KYC_ADDRESS,
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
                    ST_GOVERNANCE_KYC_ADDRESS,
                    abi,
                    wallet
                )
                const result_3 = await contract.vote(
                    obj.ID,
                    0,
                    stringToUint8Array('test')
                )
                //console.log(hexStringToString(receipt_3.logs[0].data))
                await result_3.wait()
                const receipt_3 = await provider.getTransactionReceipt(
                    result_3.hash
                )
                data = hexStringToString(receipt_3?.logs[0].data)
                expect(data).toMatch('"Status":1')
            }
        })

        test('remove kyc services', async () => {
            console.log('1. admin1 post a proposal to remove kyc services')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            const contract = new ethers.Contract(
                ST_GOVERNANCE_KYC_ADDRESS,
                abi,
                wallet
            )
            const propose = await contract.propose(
                PROPOSAL_TYPE_KYC_SERVICE_REMOVE,
                'test remove kyc services',
                'test remove kyc services',
                1000,
                args
            )
            await propose.wait()
            let recipet = await provider.getTransactionReceipt(propose.hash)
            let data = hexStringToString(recipet?.logs[0].data)

            console.log(data)
            expect(data).toMatch('"Status":0')

            let obj = JSON.parse(data)
            if (obj.ID) {
                console.log('2. admin2 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
                let contract = new ethers.Contract(
                    ST_GOVERNANCE_KYC_ADDRESS,
                    abi,
                    wallet
                )
                const result_2 = await contract.vote(
                    obj.ID,
                    0,
                    stringToUint8Array('test')
                )
                //console.log(hexStringToString(receipt_2.logs[0].data))
                await result_2.wait()
                const receipt_2 = await provider.getTransactionReceipt(
                    result_2.hash
                )
                data = hexStringToString(receipt_2?.logs[0].data)
                expect(data).toMatch('"Status":0')

                console.log('3. admin3 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
                contract = new ethers.Contract(
                    ST_GOVERNANCE_KYC_ADDRESS,
                    abi,
                    wallet
                )
                const result_3 = await contract.vote(
                    obj.ID,
                    0,
                    stringToUint8Array('test')
                )
                //console.log(hexStringToString(receipt_3.logs[0].data))
                await result_3.wait()
                const receipt_3 = await provider.getTransactionReceipt(
                    result_3.hash
                )
                data = hexStringToString(receipt_3?.logs[0].data)
                expect(data).toMatch('"Status":1')
            }
        })
    })

    describe('test repeat proposal and vote ', () => {
        test('repeat a kyc services proposal', async () => {
            console.log('1. admin1 post a proposal to add kycservices')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            const contract = new ethers.Contract(
                ST_GOVERNANCE_KYC_ADDRESS,
                abi,
                wallet
            )

            const propose = await contract.propose(
                PROPOSAL_TYPE_KYC_SERVICE_ADD,
                'add kyc services',
                'add kyc services',
                1000,
                args
            )
            await propose.wait()
            const receipt = await provider.getTransactionReceipt(propose.hash)
            expect(receipt?.to).toBe(ST_GOVERNANCE_KYC_ADDRESS)
            let data = hexStringToString(receipt?.logs[0].data)
            expect(data).toMatch('"Status":0')
            console.log('propose success,the tx hash is:', receipt?.hash)

            console.log('2. admin1 try post a same proposal again')
            try {
                let res = await contract.propose(
                    PROPOSAL_TYPE_KYC_SERVICE_ADD,
                    'add kyc services',
                    'add kyc services',
                    1000,
                    args
                )
                await res.wait()
            } catch (err) {
                //console.log('error massage is:', err)
                expect(String(err)).toMatch('transaction execution reverted')
            }

            let obj = JSON.parse(data)
            if (obj.ID) {
                console.log('3. admin2 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
                let contract = new ethers.Contract(
                    ST_GOVERNANCE_KYC_ADDRESS,
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

                console.log('4. admin2 repeat vote this proposal')
                try {
                    let res = await contract.vote(
                        obj.ID,
                        0,
                        stringToUint8Array('test')
                    )
                    await res.wait()
                } catch (err) {
                    //console.log('error massage is:', err)
                    expect(String(err)).toMatch(
                        'transaction execution reverted'
                    )
                }

                console.log('finish this proposal')
                console.log('5. admin3 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
                contract = new ethers.Contract(
                    ST_GOVERNANCE_KYC_ADDRESS,
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
            }
        })
    })

    describe('test add same kyc services one time and test remove nonexistent kyc services', () => {
        let extraArgs_1 = {
            Services: [
                {
                    KycAddr: ST_ACCOUNT_1.address
                },
                {
                    KycAddr: ST_ACCOUNT_1.address
                }
            ]
        }
        let args_1 = stringToUint8Array(JSON.stringify(extraArgs_1))

        test('add same kyc services one time', async () => {
            console.log('1. admin1 post a proposal to add kycservices')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            const contract = new ethers.Contract(
                ST_GOVERNANCE_KYC_ADDRESS,
                abi,
                wallet
            )
            try {
                const propose = await contract.propose(
                    PROPOSAL_TYPE_KYC_SERVICE_ADD,
                    'add kyc services',
                    'add kyc services',
                    1000,
                    args_1
                )
                await propose.wait()
            } catch (error) {
                console.log('error massage is:', error)
                expect(String(error)).toMatch('transaction execution reverted')
            }
        })

        test('remove nonexistent kyc services', async () => {
            let wallet_random = ethers.Wallet.createRandom()
            let address = await wallet_random.getAddress()
            let extraArgs_2 = {
                Services: [
                    {
                        KycAddr: ST_ACCOUNT_1.address
                    },
                    {
                        KycAddr: address
                    }
                ]
            }
            let args_2 = stringToUint8Array(JSON.stringify(extraArgs_2))
            console.log(
                '1. admin1 post a proposal to remove nonexistent kycservices'
            )
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            const contract = new ethers.Contract(
                ST_GOVERNANCE_KYC_ADDRESS,
                abi,
                wallet
            )
            try {
                const propose = await contract.propose(
                    PROPOSAL_TYPE_KYC_SERVICE_REMOVE,
                    'remove kyc services',
                    'remove kyc services',
                    1000,
                    args_2
                )
                await propose.wait()
            } catch (error) {
                console.log('error massage is:', error)
                expect(String(error)).toMatch('transaction execution reverted')
            }
        })
    })

    describe('test community users add same and remove kyc services', () => {
        test('community users add kycservices', async () => {
            console.log('1. account1 post a proposal to add kycservices')
            let wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
            const contract = new ethers.Contract(
                ST_GOVERNANCE_KYC_ADDRESS,
                abi,
                wallet
            )
            try {
                const propose = await contract.propose(
                    PROPOSAL_TYPE_KYC_SERVICE_ADD,
                    'add kyc services',
                    'add kyc services',
                    1000,
                    args
                )
                await propose.wait()
            } catch (error) {
                console.log('error massage is:', error)
                expect(String(error)).toMatch('transaction execution reverted')
            }
        })

        test('community users remove kycservices', async () => {
            console.log('1. account1 post a proposal to remove kycservices')
            let wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
            const contract = new ethers.Contract(
                ST_GOVERNANCE_KYC_ADDRESS,
                abi,
                wallet
            )
            try {
                const propose = await contract.propose(
                    PROPOSAL_TYPE_KYC_SERVICE_REMOVE,
                    'remove kyc services',
                    'remove kyc services',
                    1000,
                    args
                )
                await propose.wait()
            } catch (error) {
                console.log('error massage is:', error)
                expect(String(error)).toMatch('transaction execution reverted')
            }
        })

        test('community users vote proposal', async () => {
            console.log('1. admin1 post a proposal to add kycservices')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(
                ST_GOVERNANCE_KYC_ADDRESS,
                abi,
                wallet
            )
            const propose = await contract.propose(
                PROPOSAL_TYPE_KYC_SERVICE_ADD,
                'add kyc services',
                'add kyc services',
                1000,
                args
            )
            await propose.wait()
            const receipt = await provider.getTransactionReceipt(propose.hash)
            expect(receipt?.to).toBe(ST_GOVERNANCE_KYC_ADDRESS)
            let data = hexStringToString(receipt?.logs[0].data)

            console.log(data)
            expect(data).toMatch('"Status":0')

            let obj = JSON.parse(data)

            //const match = data.match(/(\d+)/g)
            if (obj.ID) {
                console.log('2. account1 vote this proposal')
                wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
                let contract = new ethers.Contract(
                    ST_GOVERNANCE_KYC_ADDRESS,
                    abi,
                    wallet
                )
                try {
                    const res_2 = await contract.vote(
                        obj.ID,
                        0,
                        stringToUint8Array('test')
                    )
                    await res_2.wait()
                } catch (error) {
                    console.log('error massage is:', error)
                    expect(String(error)).toMatch(
                        'transaction execution reverted'
                    )
                }

                // finish this proposal
                console.log('3. admin2 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
                contract = new ethers.Contract(
                    ST_GOVERNANCE_KYC_ADDRESS,
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

                console.log('4. admin3 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
                contract = new ethers.Contract(
                    ST_GOVERNANCE_KYC_ADDRESS,
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
            }
        })
    })
})
