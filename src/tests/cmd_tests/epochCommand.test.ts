import {test, expect, describe} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_SCRIPTS_DIR,
    ST_GOVERNANCE_NODE_MANAGER_ADDRESS,
    PROPOSAL_TYPE_NODE_REMOVE,
    PROPOSAL_TYPE_NODE_UPGRADE
} from '../../utils/contracts_static'
import {newProvider} from '../../utils/rpc'
import {
    ST_ADMIN_1,
    ST_ADMIN_2,
    ST_ADMIN_3,
    ST_ADMIN_4,
    ST_ACCOUNT_1
} from '../../utils/accounts_static'
import {
    hexToString,
    stringToUint8Array,
    runShellScript,
    isString,
    turnLogs
} from '../../utils/util'
import fs from 'fs'
import path from 'path'

describe('Suite_A: TestCases for epoch command', () => {
    const queryEpochScript = path.join(ST_SCRIPTS_DIR, 'query_epoch_info.sh')
    const queryHistoryEpochScript = path.join(
        ST_SCRIPTS_DIR,
        'query_history_epoch_info.sh'
    )
    /*
    beforeAll(async () => {
        console.log('Prepare axiom-ledger node binary and config')

        const nodeGenerateScript = path.join(
            ST_SCRIPTS_DIR,
            'genereta_new_nodes_config.sh'
        )

        await runShellScript(nodeGenerateScript, '')
        console.log('Prepare new node config done')
    })
        */

    test('TestCase_1: Test query current epoch info', async () => {
        console.log('query epoch info')

        let res = await runShellScript(queryEpochScript, 'current')
        console.log('res is : ', res)
        if (typeof res !== 'string') {
            throw new Error('Expected a string to parse as JSON')
        }
        let res2 = JSON.parse(res)
        expect(res2.StartBlock).toEqual(res2.EpochPeriod * (res2.Epoch - 1))
        expect(res2.EpochPeriod).toEqual(100)
    })

    test('TestCase_2: Test query next epoch info', async () => {
        console.log('query epoch info')

        let res = await runShellScript(queryEpochScript, 'next')
        console.log('res is : ', res)

        if (typeof res !== 'string') {
            throw new Error('Expected a string to parse as JSON')
        }
        let res2 = JSON.parse(res)
        expect(res2.Epoch).toBeGreaterThanOrEqual(2)
        expect(res2.StartBlock).toBeGreaterThanOrEqual(100)
    })

    test('TestCase_3: Test query history epoch info', async () => {
        console.log('query history epoch info')

        let res = await runShellScript(queryHistoryEpochScript, '1')
        //console.log('res is : ', res)

        if (typeof res !== 'string') {
            throw new Error('Expected a string to parse as JSON')
        }
        let res2 = JSON.parse(res)
        expect(res2.Epoch).toBe(1)

        res = await runShellScript(queryHistoryEpochScript, '20')
        //console.log('res is : ', res)
        expect(res).toMatch('get history epoch failed')
    })
})
