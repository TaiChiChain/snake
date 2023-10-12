import {test, expect, describe} from '@jest/globals'
import {ethers, id} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_GOVERNANCE_KYC_ADDRESS,
    PROPOSAL_TYPE_KYC_SERVICE_ADD,
    PROPOSAL_TYPE_KYC_SERVICE_REMOVE,
} from "../../utils/contracts_static";
import {provider} from "../../utils/rpc";
import {ST_ADMIN_1, ST_ACCOUNT_1, ST_ACCOUNT_2, ST_ADMIN_2, ST_ADMIN_3} from "../../utils/accounts_static";
import {hexStringToString, hexToString, stringToUint8Array} from "../../utils/util";
import fs from "fs";

describe('test case for kyc service', () => {
    const abi = fs.readFileSync(ST_CONTRACT_DIR + 'Governance/governance.abi', 'utf8')
    const extraArgs = {
        Services: [
            {
                rawAddress: ethers.getBytes(ST_ACCOUNT_1.address),  // Convert to byte array
                addressStr: ST_ACCOUNT_1.address  // Keep as a checksum address string
            },
            {
                rawAddress: ethers.getBytes(ST_ACCOUNT_2.address),
                addressStr: ST_ACCOUNT_2.address
            },
        ]
    }
    describe('test normal proposal and vote', () => {
        test('add kyc services', async () => {
            // eslint-disable-next-line no-console
            console.log('1. admin1 post a proposal')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            const contract = new ethers.Contract(ST_GOVERNANCE_KYC_ADDRESS, abi, wallet);
            const toByte = stringToUint8Array(JSON.stringify(extraArgs));
            const propose = await contract.propose(
                PROPOSAL_TYPE_KYC_SERVICE_ADD,
                'test title',
                'test desc',
                100,
                toByte
            );
            await propose.wait()
            let tx = await provider.getTransactionReceipt(propose.hash)
            let str = ""
            if (tx != null) {
                str = hexStringToString(tx.logs[0].data)
            }
            // eslint-disable-next-line no-console
            console.log(str)
            // let str = hexToString(tx.logs[0].data)
            expect(str).toMatch('"Status":0')
            // eslint-disable-next-line no-control-regex
            str = str.replace(/^\u0000/, '');
            let obj;
            try {
                obj = JSON.parse(str);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("Error parsing JSON string:", e);
            }
            let match
            if (obj) {
                match = obj.ID;
                // eslint-disable-next-line no-console
                console.log("ID:", id);
            }
            if (match) {
                // eslint-disable-next-line no-console
                console.log('3. admin2 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
                let contract = new ethers.Contract(ST_GOVERNANCE_KYC_ADDRESS, abi, wallet);
                const receipt_2 = await contract.vote(
                    match,
                    0,
                    stringToUint8Array('')
                )
                //console.log(hexToString(receipt_2.logs[0].data))
                await receipt_2.wait()
                tx = await provider.getTransactionReceipt(receipt_2.hash)
                str = hexToString(tx?.logs[0].data)
                expect(str).toMatch('"Status":0')

                // eslint-disable-next-line no-console
                console.log('4. admin3 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
                contract = new ethers.Contract(ST_GOVERNANCE_KYC_ADDRESS, abi, wallet);
                const receipt_3 = await contract.vote(
                    match,
                    0,
                    stringToUint8Array('')
                )
                //console.log(hexToString(receipt_3.logs[0].data))
                await receipt_3.wait()
                tx = await provider.getTransactionReceipt(receipt_3.hash)
                str = hexToString(tx?.logs[0].data)
                expect(str).toMatch('"Status":1')
            }
        })

        test('remove kyc services', async () => {
            // eslint-disable-next-line no-console
            console.log('1. admin1 post a proposal')
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            const contract = new ethers.Contract(ST_GOVERNANCE_KYC_ADDRESS, abi, wallet);
            const toByte = stringToUint8Array(JSON.stringify(extraArgs));
            const propose = await contract.propose(
                PROPOSAL_TYPE_KYC_SERVICE_REMOVE,
                'test title',
                'test desc',
                100,
                toByte
            );
            await propose.wait()
            let tx = await provider.getTransactionReceipt(propose.hash)
            let str = ""
            if (tx != null) {
                str = hexStringToString(tx.logs[0].data)
            }
            // eslint-disable-next-line no-console
            console.log(str)
            // let str = hexToString(tx.logs[0].data)
            expect(str).toMatch('"Status":0')
            // eslint-disable-next-line no-control-regex
            str = str.replace(/^\u0000/, '');
            let obj;
            try {
                obj = JSON.parse(str);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("Error parsing JSON string:", e);
            }
            let match
            if (obj) {
                match = obj.ID;
                // eslint-disable-next-line no-console
                console.log("ID:", id);
            }
            if (match) {
                // eslint-disable-next-line no-console
                console.log('3. admin2 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_2.privateKey, provider)
                let contract = new ethers.Contract(ST_GOVERNANCE_KYC_ADDRESS, abi, wallet);
                const receipt_2 = await contract.vote(
                    match,
                    0,
                    stringToUint8Array('')
                )
                //console.log(hexToString(receipt_2.logs[0].data))
                await receipt_2.wait()
                tx = await provider.getTransactionReceipt(receipt_2.hash)
                str = hexToString(tx?.logs[0].data)
                expect(str).toMatch('"Status":0')

                // eslint-disable-next-line no-console
                console.log('4. admin3 vote this proposal')
                wallet = new ethers.Wallet(ST_ADMIN_3.privateKey, provider)
                contract = new ethers.Contract(ST_GOVERNANCE_KYC_ADDRESS, abi, wallet);
                const receipt_3 = await contract.vote(
                    match,
                    0,
                    stringToUint8Array('')
                )
                //console.log(hexToString(receipt_3.logs[0].data))
                await receipt_3.wait()
                tx = await provider.getTransactionReceipt(receipt_3.hash)
                str = hexToString(tx?.logs[0].data)
                expect(str).toMatch('"Status":1')
            }
        })
    });
})
