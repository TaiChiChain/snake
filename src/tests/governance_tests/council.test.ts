import {test, expect, describe} from '@jest/globals'
import {ST_ADDRESS, ST_PRIVATEKRY, newRpcClient} from '../../utils/rpc'
import {ContractUtils} from '../../utils/contract'
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
import {stringToByte} from '../../utils/util'

const ADMIN1_ADDRESS = "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013"
const ADMIN2_ADDRESS = "0x79a1215469FaB6f9c63c1816b45183AD3624bE34"
const ADMIN3_ADDRESS = "0x97c8B516D19edBf575D72a172Af7F418BE498C37"
const ADMIN4_ADDRESS = "0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8"

describe('test council', () => {
    const client = newRpcClient()
    const utils = new ContractUtils(ST_CONTRACT_DIR, client, ST_PRIVATEKRY)
    utils.compile(ST_GOVERNANCE_FILENAME, ST_GOVERNANCE_CONTRACT_NAME)

    let extraArgs = {
        candidates: [
            {address: ADMIN1_ADDRESS, weight: 100},
            {address: ADMIN2_ADDRESS, weight: 100},
            {address: ADMIN3_ADDRESS, weight: 100},
            {address: ADMIN4_ADDRESS, weight: 100},
        ]
    };

    test('test propose', async () => {
        const tx = await utils.call(
            ST_GOVERNANCE_CONTRACT_NAME,
            ST_GOVERNANCE_COUNCIL_ADDRESS,
            'propose',
            PROPOSAL_TYPE_COUNCIL_ELECT,
            "test title",
            "test desc",
            100,
            stringToByte(JSON.stringify(extraArgs)),
        )
        expect(tx.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
    })

    test('test vote', async () => {
        const tx = await utils.call(
            ST_GOVERNANCE_CONTRACT_NAME,
            ST_GOVERNANCE_COUNCIL_ADDRESS,
            'vote',
            1,
            0,
            stringToByte("")
        )
        expect(tx.to).toBe(ST_GOVERNANCE_COUNCIL_ADDRESS)
    })

})
