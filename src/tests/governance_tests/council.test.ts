import {test, expect, describe} from '@jest/globals'
import {
    ST_PRIVATEKRY,
    ST_ADDRESS,
    newRpcClient,
    transfer
} from '../../utils/rpc'
import {ContractUtils} from '../../utils/contract'
import {
    ST_CONTRACT_DIR,
    ST_GOVERNANCE_CONTRACT_NAME,
    ST_GOVERNANCE_FILENAME,
    ST_GOVERNANCE_COUNCIL_ADDRESS,
    PROPOSAL_TYPE_COUNCIL_ELECT,
    PROPOSAL_TYPE_NODE_ADD,
    PROPOSAL_TYPE_NODE_REMOVE,
    PROPOSAL_TYPE_NODE_UPDATE
} from '../../utils/contracts_static'
import {stringToByte, hexToString} from '../../utils/util'

const ADMIN1_ADDRESS = '0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013'
const ADMIN2_ADDRESS = '0x79a1215469FaB6f9c63c1816b45183AD3624bE34'
const ADMIN2_PRIVATEKRY =
    '0x05c3708d30c2c72c4b36314a41f30073ab18ea226cf8c6b9f566720bfe2e8631'
const ADMIN3_ADDRESS = '0x97c8B516D19edBf575D72a172Af7F418BE498C37'
const ADMIN3_PRIVATEKRY =
    '0x85a94dd51403590d4f149f9230b6f5de3a08e58899dcaf0f77768efb1825e854'
const ADMIN4_ADDRESS = '0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8'
const ADMIN4_PRIVATEKRY =
    '0x72efcf4bb0e8a300d3e47e6a10f630bcd540de933f01ed5380897fc5e10dc95d'

const client = newRpcClient()
const utils = new ContractUtils(ST_CONTRACT_DIR, client, ST_PRIVATEKRY)
const client2 = newRpcClient()
const utils2 = new ContractUtils(ST_CONTRACT_DIR, client2, ADMIN2_PRIVATEKRY)
const client3 = newRpcClient()
const utils3 = new ContractUtils(ST_CONTRACT_DIR, client3, ADMIN3_PRIVATEKRY)
const client4 = newRpcClient()
const utils4 = new ContractUtils(ST_CONTRACT_DIR, client4, ADMIN4_PRIVATEKRY)

describe('test council with admins', () => {
    utils.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)

    let extraArgs = {
        candidates: [
            {address: ADMIN1_ADDRESS, weight: 1, name: 'test 1'},
            {address: ADMIN2_ADDRESS, weight: 1, name: 'test 2'},
            {address: ADMIN3_ADDRESS, weight: 1, name: 'test 3'},
            {address: ADMIN4_ADDRESS, weight: 1, name: 'test 4'}
        ]
    }

    test('test normal propose and normal vote', async () => {
        console.log('1. admin1 post a proposal')
        const receipt = await utils.call(
            ST_GOVERNANCE_CONTRACT_NAME,
            ST_GOVERNANCE_COUNCIL_ADDRESS,
            'propose',
            PROPOSAL_TYPE_COUNCIL_ELECT,
            'test title',
            'test desc',
            100,
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
                    0,
                    stringToByte('')
                )
            } catch (error) {
                expect(String(error)).toMatch('Transaction has been reverted')
            }

            console.log('3. admin2 vote this proposal')
            utils2.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
            const receipt_2 = await utils2.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'vote',
                match[0],
                0,
                stringToByte('')
            )
            //console.log(hexToString(receipt_2.logs[0].data))
            var str = hexToString(receipt_2.logs[0].data)
            expect(str).toMatch('"Status":0')

            console.log('4. admin3 vote this proposal')
            utils3.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
            const receipt_3 = await utils3.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'vote',
                match[0],
                0,
                stringToByte('')
            )
            //console.log(hexToString(receipt_3.logs[0].data))
            var str = hexToString(receipt_3.logs[0].data)
            expect(str).toMatch('"Status":1')

            console.log('5. admin4 vote this proposal')
            utils4.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
            try {
                await utils4.call(
                    ST_GOVERNANCE_CONTRACT_NAME,
                    ST_GOVERNANCE_COUNCIL_ADDRESS,
                    'vote',
                    match[0],
                    0,
                    stringToByte('')
                )
            } catch (err) {
                //console.log(err)
                expect(String(err)).toMatch('Transaction has been reverted')
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
            100,
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
                100,
                stringToByte(JSON.stringify(extraArgs))
            )
        } catch (err) {
            //console.log("error message is :", err)
            expect(String(err)).toMatch('Transaction has been reverted')
        }

        // finish the proposal
        const match = str.match(/(\d+)/g)
        //console.log(match)
        if (match) {
            utils2.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
            const receipt_2 = await utils2.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'vote',
                match[0],
                0,
                stringToByte('')
            )
            //console.log(hexToString(receipt_2.logs[0].data))
            var str = hexToString(receipt_2.logs[0].data)
            expect(str).toMatch('"Status":0')

            utils3.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
            const receipt_3 = await utils3.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'vote',
                match[0],
                0,
                stringToByte('')
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
            100,
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
            utils2.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
            const receipt_2 = await utils2.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'vote',
                match[0],
                0,
                stringToByte('')
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
                    0,
                    stringToByte('')
                )
            } catch (err) {
                //console.log("error message is :", err)
                expect(String(err)).toMatch('Transaction has been reverted')
            }

            // finish the proposal
            utils3.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
            const receipt_3 = await utils3.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'vote',
                match[0],
                0,
                stringToByte('')
            )
            var str = hexToString(receipt_3.logs[0].data)
            expect(str).toMatch('"Status":1')
        }
    })
})

describe('test council with community users ', () => {
    const client5 = newRpcClient()
    const user_address = '0x14E1D181F211Eb211b24fe53bd8ebB1580A00eab'
    const user_key =
        '0xf7b0475accc21905e81790dda6e3948da8aafa6bac4f4b9034a4eb5a5d9ba729'
    const utils5 = new ContractUtils(ST_CONTRACT_DIR, client5, user_key)

    it('prepare test', async () => {
        console.log('1. transfer to user5 some AXM ')
        let nonce = await client.eth.getTransactionCount(ST_ADDRESS)
        await transfer(
            ST_ADDRESS,
            user_address,
            client.utils.toWei('0.5', 'ether'),
            nonce,
            ST_PRIVATEKRY
        )
    })

    utils.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
    utils5.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)

    let extraArgs = {
        candidates: [
            {address: ADMIN1_ADDRESS, weight: 1, name: 'test user1'},
            {address: ADMIN2_ADDRESS, weight: 1, name: 'test user2'},
            {address: ADMIN3_ADDRESS, weight: 1, name: 'test user3'},
            {address: ADMIN4_ADDRESS, weight: 1, name: 'test user4'}
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
                100,
                stringToByte(JSON.stringify(extraArgs))
            )
        } catch (err) {
            //console.log("error message is :", err)
            expect(String(err)).toMatch('Transaction has been reverted')
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
            100,
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
                    0,
                    stringToByte('')
                )
            } catch (err) {
                //console.log("error message is :", err)
                expect(String(err)).toMatch('Transaction has been reverted')
            }

            // finish the proposal
            utils2.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
            const receipt_2 = await utils2.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'vote',
                match[0],
                0,
                stringToByte('')
            )
            //console.log(hexToString(receipt_2.logs[0].data))
            var str = hexToString(receipt_2.logs[0].data)
            expect(str).toMatch('"Status":0')

            utils3.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)
            const receipt_3 = await utils3.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'vote',
                match[0],
                0,
                stringToByte('')
            )
            //console.log(hexToString(receipt_3.logs[0].data))
            var str = hexToString(receipt_3.logs[0].data)
            expect(str).toMatch('"Status":1')
        }
    })
})
