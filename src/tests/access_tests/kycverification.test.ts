import {test, expect, describe} from '@jest/globals'
import {ethers, id} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_ACCESS_KYC_ADDRESS,
} from "../../utils/contracts_static";
import {provider} from "../../utils/rpc";
import {ST_ADMIN_1, ST_ACCOUNT_1, ST_ACCOUNT_2, ST_ADMIN_2, ST_ADMIN_3} from "../../utils/accounts_static";
import {hexStringToString, hexToString, stringToUint8Array} from "../../utils/util";
import fs from "fs";

describe('test case for kyc verification', () => {
    describe('test normal submit and remove', () => {
        const Verified = 1
        const Unverified = 0
        const expires = Math.floor(Date.now() / 1000 + 1000);
        const abi = fs.readFileSync(ST_CONTRACT_DIR + 'Access/KycVerification.abi', 'utf8')
        const extraSubmitArgs = {
            KycInfos: [
                {
                    User: "0x264e23168e80f15e9311F2B88b4D7abeAba47E54",
                    KycAddr: ST_ADMIN_1.address,
                    KycFlag: Verified,
                    Expires: expires,
                },
            ]
        }
        test ('test account1 cannot send raw transaction', async () => {
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider);
            let txDetails = {
                to: ST_ACCOUNT_1.address,
                value: ethers.parseEther('1000'),
                gasLimit: 21000,
            };
            let txResponse = await wallet.sendTransaction(txDetails);
            let receipt = await txResponse.wait();
            expect(receipt?.status).toBe(1)

            wallet = new ethers.Wallet("3331caf8f8638ae16403666e6d8a2f29bbf40a2f780ae5781134bac05c93e890", provider);
            txDetails = {
                to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                value: ethers.parseEther('100'),
                gasLimit: 21000,
            };

            try {
                txResponse = await wallet.sendTransaction(txDetails);
                receipt = await txResponse.wait();
                expect(receipt?.status).toBe(0)
            } catch (error) {
                console.log("error is", error)
            }
        })

        test('test set account1 kycinfo verified', async () => {
            let wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            let contract = new ethers.Contract(ST_ACCESS_KYC_ADDRESS, abi, wallet);
            let toByte = stringToUint8Array(JSON.stringify(extraSubmitArgs));
            const submit = await contract.Submit(
                toByte
            );
            await submit.wait()
            let tx = await provider.getTransactionReceipt(submit.hash)
            expect(tx?.status).toBe(1)
        })

        test ('test account1 can send saw transaction', async () => {
            const wallet = new ethers.Wallet("3331caf8f8638ae16403666e6d8a2f29bbf40a2f780ae5781134bac05c93e890", provider);
            const txDetails = {
                to: ST_ACCOUNT_2.address,
                value: ethers.parseEther('10'),
                gasLimit: 21000,
            };

            const txResponse = await wallet.sendTransaction(txDetails);
            const receipt = await txResponse.wait();
            expect(receipt?.status).toBe(1)
        })

    });
})