import {test, expect, describe} from '@jest/globals'
import {newRpcClient} from '../../utils/rpc'
import {
    ST_ADMIN_1,
    ST_ADMIN_2,
    ST_ADMIN_3,
    ST_ADMIN_4,
    ST_ACCOUNT_5
} from '../../utils/accounts_static'
import {ContractUtils} from '../../utils/contract'
import {
    ST_CONTRACT_DIR,
    ST_GOVERNANCE_CONTRACT_NAME,
    ST_GOVERNANCE_FILENAME,
    ST_GOVERNANCE_COUNCIL_ADDRESS,
    PROPOSAL_TYPE_COUNCIL_ELECT
} from '../../utils/contracts_static'
import {stringToByte, hexToString} from '../../utils/util'

describe('TestCases of council ', () => {
    const client = newRpcClient()
    const utils = new ContractUtils(
        ST_CONTRACT_DIR,
        client,
        ST_ADMIN_1.privateKey
    )
    const client2 = newRpcClient()
    const utils2 = new ContractUtils(
        ST_CONTRACT_DIR,
        client2,
        ST_ADMIN_2.privateKey
    )
    const client3 = newRpcClient()
    const utils3 = new ContractUtils(
        ST_CONTRACT_DIR,
        client3,
        ST_ADMIN_3.privateKey
    )
    const client4 = newRpcClient()
    const utils4 = new ContractUtils(
        ST_CONTRACT_DIR,
        client4,
        ST_ADMIN_4.privateKey
    )
    let extraArgs = {
        candidates: [
            {address: ST_ADMIN_1.address, weight: 1, name: 'test 1'},
            {address: ST_ADMIN_2.address, weight: 1, name: 'test 2'},
            {address: ST_ADMIN_3.address, weight: 1, name: 'test 3'},
            {address: ST_ADMIN_4.address, weight: 1, name: 'test 4'}
        ]
    }
    describe('test council with admins', () => {
        utils.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)

        test('test normal propose and normal vote', async () => {
            console.log('1. admin1 post a proposal')
            const receipt = await utils.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'propose',
                PROPOSAL_TYPE_COUNCIL_ELECT,
                'test title',
                'test desc',
                1000,
                stringToByte(JSON.stringify(extraArgs))
            )

            expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
            var str = hexToString(receipt.logs[0].data)
            expect(str).toMatch('"Status":0')

            const tx = await client.eth.getTransaction(receipt.transactionHash)
            expect(hexToString(tx.data)).toMatch(JSON.stringify(extraArgs))

            //console.log(hexToString(receipt.logs[0].data))
            const match = str.match(/(\d+)/g)
            //console.log(match)
            if (match) {
                console.log('2. admin1 vote this proposal')
                try {
                    await utils.call(
                        ST_GOVERNANCE_CONTRACT_NAME,
                        ST_GOVERNANCE_COUNCIL_ADDRESS,
                        'vote',
                        match[0],
                        0
                    )
                } catch (error) {
                    expect(String(error)).toMatch(
                        'Transaction has been reverted'
                    )
                }

                console.log('3. admin2 vote this proposal')
                utils2.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_2 = await utils2.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                //console.log(hexToString(receipt_2.logs[0].data))
                var str = hexToString(receipt_2.logs[0].data)
                expect(str).toMatch('"Status":0')

                console.log('4. admin3 vote this proposal')
                utils3.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_3 = await utils3.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                //console.log(hexToString(receipt_3.logs[0].data))
                var str = hexToString(receipt_3.logs[0].data)
                expect(str).toMatch('"Status":1')

                console.log('5. admin4 vote this proposal')
                utils4.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                try {
                    await utils4.call(
                        ST_GOVERNANCE_CONTRACT_NAME,
                        ST_GOVERNANCE_COUNCIL_ADDRESS,
                        'vote',
                        match[0],
                        0
                    )
                } catch (error) {
                    //console.log(error)
                    expect(String(error)).toMatch(
                        'Transaction has been reverted'
                    )
                }
            }
        })

        test('test repeat propose', async () => {
            console.log('1. admin1 post a proposal')
            const receipt = await utils.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'propose',
                PROPOSAL_TYPE_COUNCIL_ELECT,
                'test title',
                'test desc',
                1000,
                stringToByte(JSON.stringify(extraArgs))
            )

            expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
            var str = hexToString(receipt.logs[0].data)
            expect(str).toMatch('"Status":0')

            const tx = await client.eth.getTransaction(receipt.transactionHash)
            expect(hexToString(tx.data)).toMatch(JSON.stringify(extraArgs))

            console.log('2. admin2 repeat post a proposal')
            try {
                await utils.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'propose',
                    PROPOSAL_TYPE_COUNCIL_ELECT,
                    'test title',
                    'test desc',
                    1000,
                    stringToByte(JSON.stringify(extraArgs))
                )
            } catch (error) {
                //console.log("error message is :", error)
                expect(String(error)).toMatch('Transaction has been reverted')
            }

            // finish the proposal
            const match = str.match(/(\d+)/g)
            //console.log(match)
            if (match) {
                utils2.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_2 = await utils2.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                //console.log(hexToString(receipt_2.logs[0].data))
                var str = hexToString(receipt_2.logs[0].data)
                expect(str).toMatch('"Status":0')

                utils3.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_3 = await utils3.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                //console.log(hexToString(receipt_3.logs[0].data))
                var str = hexToString(receipt_3.logs[0].data)
                expect(str).toMatch('"Status":1')
            }
        })

        test('test repeat vote', async () => {
            console.log('1. admin1 post a proposal')
            const receipt = await utils.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'propose',
                PROPOSAL_TYPE_COUNCIL_ELECT,
                'test title',
                'test desc',
                1000,
                stringToByte(JSON.stringify(extraArgs))
            )

            expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
            var str = hexToString(receipt.logs[0].data)
            expect(str).toMatch('"Status":0')

            const tx = await client.eth.getTransaction(receipt.transactionHash)
            expect(hexToString(tx.data)).toMatch(JSON.stringify(extraArgs))

            //console.log(hexToString(receipt.logs[0].data))
            const match = str.match(/(\d+)/g)
            //console.log(match)
            if (match) {
                console.log('2. admin2 vote this proposal')
                utils2.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_2 = await utils2.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                var str = hexToString(receipt_2.logs[0].data)
                expect(str).toMatch('"Status":0')

                console.log('3. admin2 repeat vote this proposal')
                try {
                    await utils2.call(
                        ST_GOVERNANCE_CONTRACT_NAME,
                        ST_GOVERNANCE_COUNCIL_ADDRESS,
                        'vote',
                        match[0],
                        0
                    )
                } catch (error) {
                    //console.log("error message is :", err)
                    expect(String(error)).toMatch(
                        'Transaction has been reverted'
                    )
                }

                // finish the proposal
                utils3.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_3 = await utils3.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                var str = hexToString(receipt_3.logs[0].data)
                expect(str).toMatch('"Status":1')
            }
        })
    })

    describe('test council with community users ', () => {
        const client5 = newRpcClient()
        //const user_address = '0x14E1D181F211Eb211b24fe53bd8ebB1580A00eab'
        const utils5 = new ContractUtils(
            ST_CONTRACT_DIR,
            client5,
            ST_ACCOUNT_5.privateKey
        )
        utils.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
        utils5.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)

        let extraArgs = {
            candidates: [
                {address: ST_ADMIN_1.address, weight: 1, name: 'test user1'},
                {address: ST_ADMIN_2.address, weight: 1, name: 'test user2'},
                {address: ST_ADMIN_3.address, weight: 1, name: 'test user3'},
                {address: ST_ADMIN_4.address, weight: 1, name: 'test user4'}
            ]
        }
        test('test community user propose', async () => {
            console.log('2. community user5 post a proposal')
            try {
                await utils5.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'propose',
                    PROPOSAL_TYPE_COUNCIL_ELECT,
                    'test title',
                    'test desc',
                    1000,
                    stringToByte(JSON.stringify(extraArgs))
                )
            } catch (error) {
                //console.log("error message is :", error)
                expect(String(error)).toMatch('Transaction has been reverted')
            }
        })

        test('test community users vote', async () => {
            console.log('1. admin1 post a proposal')
            const receipt = await utils.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'propose',
                PROPOSAL_TYPE_COUNCIL_ELECT,
                'test title',
                'test desc',
                1000,
                stringToByte(JSON.stringify(extraArgs))
            )
            expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
            var str = hexToString(receipt.logs[0].data)
            expect(str).toMatch('"Status":0')

            const tx = await client.eth.getTransaction(receipt.transactionHash)
            expect(hexToString(tx.data)).toMatch(JSON.stringify(extraArgs))

            //console.log(hexToString(receipt.logs[0].data))
            const match = str.match(/(\d+)/g)
            //console.log(match)
            if (match) {
                console.log('2. user5 vote this proposal')
                try {
                    await utils5.call(
                        ST_GOVERNANCE_CONTRACT_NAME,
                        ST_GOVERNANCE_COUNCIL_ADDRESS,
                        'vote',
                        match[0],
                        0
                    )
                } catch (error) {
                    //console.log("error message is :", error)
                    expect(String(error)).toMatch(
                        'Transaction has been reverted'
                    )
                }

                // finish the proposal
                utils2.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_2 = await utils2.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                //console.log(hexToString(receipt_2.logs[0].data))
                var str = hexToString(receipt_2.logs[0].data)
                expect(str).toMatch('"Status":0')

                utils3.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_3 = await utils3.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                //console.log(hexToString(receipt_3.logs[0].data))
                var str = hexToString(receipt_3.logs[0].data)
                expect(str).toMatch('"Status":1')
            }
        })
    })

    describe('test council with error params ', () => {
        utils.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)

        let extraArgs = {
            candidates: [
                {address: ST_ADMIN_1.address, weight: 1, name: 'test user1'},
                {address: ST_ADMIN_2.address, weight: 1, name: 'test user2'},
                {address: ST_ADMIN_3.address, weight: 1, name: 'test user3'},
                {address: ST_ADMIN_4.address, weight: 1, name: 'test user4'}
            ]
        }
        test('test propose with error expired block height', async () => {
            console.log(
                'admin1 post a proposal with error expired block height'
            )
            try {
                await utils.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'propose',
                    PROPOSAL_TYPE_COUNCIL_ELECT,
                    'test title',
                    'test desc',
                    1,
                    stringToByte(JSON.stringify(extraArgs))
                )
            } catch (error) {
                expect(JSON.stringify(error)).toMatch(
                    'Transaction has been reverted'
                )
                expect(JSON.stringify(error)).toMatch(
                    'block number is out of date'
                )
            }
        })
    })

    describe('test query proposal', () => {
        test('test normal propose and query proposal', async () => {
            console.log('1. admin1 post a proposal')
            const receipt = await utils.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'propose',
                PROPOSAL_TYPE_COUNCIL_ELECT,
                'test title',
                'test desc',
                10000,
                stringToByte(JSON.stringify(extraArgs))
            )

            expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
            var str = hexToString(receipt.logs[0].data)
            expect(str).toMatch('"Status":0')

            const tx = await client.eth.getTransaction(receipt.transactionHash)
            expect(hexToString(tx.data)).toMatch(JSON.stringify(extraArgs))

            const match = str.match(/(\d+)/g)
            //console.log(match)
            if (match) {
                console.log('2. admin1 query this proposal')
                var res = await utils.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'proposal',
                    match[0]
                )
                // res is json object
                expect(res.ID).toBe(BigInt(match[0]))

                console.log('3. finish this proposal')
                utils2.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_2 = await utils2.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                var str = hexToString(receipt_2.logs[0].data)
                expect(str).toMatch('"Status":0')

                utils3.compile(
                    ST_GOVERNANCE_FILENAME,
                    ST_GOVERNANCE_CONTRACT_NAME
                )
                const receipt_3 = await utils3.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0
                )
                var str = hexToString(receipt_3.logs[0].data)
                expect(str).toMatch('"Status":1')
            }
        })

        test('test abnormal query proposal', async () => {
            console.log('admin1 query a nonexistent proposal')
            try {
                const receipt = await utils.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'proposal',
                    10000
                )
            } catch (error) {
                expect(JSON.stringify(error)).toMatch('not found proposal')
            }
        })

        test('test get latest proposal id', async () => {
            console.log('admin1 query a latest proposal id')
            const proposalID = await utils.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'getLatestProposalID'
            )
            console.log(proposalID)
        })
    })
})
