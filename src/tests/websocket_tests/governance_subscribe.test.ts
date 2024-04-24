import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import * as fs from 'fs'
import {newWebSocketProvider, newProvider} from '../../utils/rpc'
import {ST_ADMIN_1, ST_ADMIN_2, ST_ADMIN_3} from '../../utils/accounts_static'
import {PROPOSAL_TYPE_NODE_UPGRADE, ST_CONTRACT_DIR} from '../../utils/contracts_static'
import {stringToUint8Array, waitAsync} from '../../utils/util'

describe('TestCases of Subscribe', () => {
    const provider = newProvider()
    let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Governance/governance.abi',
        'utf8'
    )
    let contractAddress = '0x0000000000000000000000000000000000001001'

    test('subscribe contract event', async () => {
        const proposalTitle =  'test upgrade node for subscribe'
        const wsProvider = newWebSocketProvider()
        const filter = {
            address: contractAddress
        }
        let count = 0
        let proposalId = 0
        wsProvider.on(filter, event => {
            count++;
            const data = event.data;
            const jsonData = ethers.toUtf8String(data)
            const dataObject = JSON.parse(jsonData);
            proposalId = dataObject.ID;
            expect(dataObject.Title).toMatch(proposalTitle)
        })

        let upgradeExtraArgs = {
            DownloadUrls: [
                'https://github.com/axiomesh/axiom-ledger/archive/refs/tags/v0.0.1.tar.gz',
                'https://github.com/axiomesh/axiom-ledger/archive/refs/tags/v0.0.2.tar.gz'
            ],
            CheckHash:
                'ed15d72d6d437db61a00abc6fa20c3d34f33a9221b8dc770df5ae32149b369bb'
        }
        let upgradeArgs = stringToUint8Array(JSON.stringify(upgradeExtraArgs))

        let govern = new ethers.Contract(contractAddress, abi, wallet);
        await govern.propose(
            PROPOSAL_TYPE_NODE_UPGRADE,
            proposalTitle,
            'test upgrade node',
            1000000,
            upgradeArgs,
            {
                gasPrice: 10000000000000,
                gasLimit: 300000
            }
        )

        wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
        govern = new ethers.Contract(contractAddress, abi, wallet);
        await govern.vote(proposalId, 0, {
            gasPrice: 10000000000000,
            gasLimit: 300000
        })
        wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
        govern = new ethers.Contract(contractAddress, abi, wallet);
        await govern.vote(proposalId, 0, {
            gasPrice: 10000000000000,
            gasLimit: 300000
        })

        await waitAsync(1000 * 3)
        expect(count).toBe(1)
        wsProvider.websocket.close()
    })
})
