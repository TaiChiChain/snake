import { test, expect, describe } from '@jest/globals'
import { ST_PRIVATEKRY, newRpcClient } from '../../utils/rpc'
import { ContractUtils } from '../../utils/contract'
import {
    ST_CONTRACT_DIR,
    ST_GOVERNANCE_CONTRACT_NAME,
    ST_GOVERNANCE_FILENAME,
    ST_GOVERNANCE_COUNCIL_ADDRESS,
    PROPOSAL_TYPE_COUNCIL_ELECT,
    PROPOSAL_TYPE_NODE_ADD,
    PROPOSAL_TYPE_NODE_REMOVE,
    PROPOSAL_TYPE_NODE_UPDATE,
} from '../../utils/contracts_static'
import { stringToByte, hexToString } from '../../utils/util'

const ADMIN1_ADDRESS = "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013"
const ADMIN2_ADDRESS = "0x79a1215469FaB6f9c63c1816b45183AD3624bE34"
const ADMIN2_PRIVATEKRY = "05c3708d30c2c72c4b36314a41f30073ab18ea226cf8c6b9f566720bfe2e8631"
const ADMIN3_ADDRESS = "0x97c8B516D19edBf575D72a172Af7F418BE498C37"
const ADMIN3_PRIVATEKRY = "85a94dd51403590d4f149f9230b6f5de3a08e58899dcaf0f77768efb1825e854"
const ADMIN4_ADDRESS = "0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8"
const ADMIN4_PRIVATEKRY = "72efcf4bb0e8a300d3e47e6a10f630bcd540de933f01ed5380897fc5e10dc95d"

//const client = newRpcClient()
//const utils = new ContractUtils(ST_CONTRACT_DIR, client, ST_PRIVATEKRY)
//const utils_admin2 = new ContractUtils(ST_CONTRACT_DIR, client, ADMIN2_PRIVATEKRY)
//const utils_admin3 = new ContractUtils(ST_CONTRACT_DIR, client, ADMIN3_PRIVATEKRY)
//const utils_admin4 = new ContractUtils(ST_CONTRACT_DIR, client, ADMIN4_PRIVATEKRY)

describe('test council', () => {
    const client = newRpcClient()
    const utils = new ContractUtils(ST_CONTRACT_DIR, client, ST_PRIVATEKRY)
    utils.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)

    let extraArgs = {
        candidates: [
            { address: ADMIN1_ADDRESS, weight: 100 },
            { address: ADMIN2_ADDRESS, weight: 100 },
            { address: ADMIN3_ADDRESS, weight: 100 },
            { address: ADMIN4_ADDRESS, weight: 100 },
        ]
    };

    test('test propose and vote', async () => {
        const receipt = await utils.call(
            ST_GOVERNANCE_CONTRACT_NAME,
            ST_GOVERNANCE_COUNCIL_ADDRESS,
            'propose',
            PROPOSAL_TYPE_COUNCIL_ELECT,
            "test title",
            "test desc",
            100,
            stringToByte(JSON.stringify(extraArgs)),
        )

        expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
        expect(receipt.status).toBe(BigInt(1))
        var str = hexToString(receipt.logs[0].data)
        expect(str).toMatch("\"Status\":0")

        const tx = await client.eth.getTransaction(receipt.transactionHash)
        expect(hexToString(tx.data)).toMatch(JSON.stringify(extraArgs))

        //console.log(hexToString(receipt.logs[0].data))
        var match = str.match(/(\d+)/g)
        if (match) {
            console.log(match[0])
            //vote this proposal
            const receipt2 = await utils.call(
                ST_GOVERNANCE_CONTRACT_NAME,
                ST_GOVERNANCE_COUNCIL_ADDRESS,
                'vote',
                match[0],
                0,
                stringToByte("")
            )
            console.log(hexToString(receipt2.logs[0].data))
        }
        //console.log(receipt2)
        //expect(receipt.logs.data).toBe(BigInt(1))
        //console.log(hexToString(receipt2.logs[0].data))


    })

    test('test vote', async () => {
        const receipt = await utils.call(
            ST_GOVERNANCE_CONTRACT_NAME,
            ST_GOVERNANCE_COUNCIL_ADDRESS,
            'vote',
            1,
            0,
            stringToByte("")
        )
        console.log(receipt)
        //expect(receipt.logs.data).toBe(BigInt(1))
        console.log(hexToString(receipt.logs[0].data))
        //const tx = await client.eth.getTransaction(receipt.transactionHash)
        //console.log(tx)

        //expect(receipt.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
    })

})

