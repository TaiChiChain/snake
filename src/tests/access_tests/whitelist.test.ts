import {test, expect, describe} from '@jest/globals'
import {ethers, Wallet} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_ACCESS_KYC_ADDRESS,
} from "../../utils/contracts_static";
import {newProvider} from "../../utils/rpc";
import {ST_ADMIN_1} from "../../utils/accounts_static";
import {hexToString, stringToUint8Array} from "../../utils/util";
import fs from "fs";

describe('TestCases for kyc verification', () => {
    const provider = newProvider()
    const Verified = 1
    describe('test normal submit and remove', () => {
        const randomWallet = Wallet.createRandom(provider);
        const Verified = 1
        // const Unverified = 0
        const expires = Math.floor(Date.now() / 1000 + 1000);
        const abi = fs.readFileSync(ST_CONTRACT_DIR + 'Access/WhiteList.abi', 'utf8')
        test ('test user1 cannot send raw transaction', async () => {
            const wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider);
            let txDetails = {
                to: randomWallet.address,
                value: ethers.parseEther('1000'),
                gasLimit: 21000
            }
            let txResponse = await wallet.sendTransaction(txDetails)
            let receipt = await txResponse.wait()
            expect(receipt?.status).toBe(1)

            txDetails = {
                to: ST_ADMIN_1.address,
                value: ethers.parseEther('100'),
                gasLimit: 21000
            }

            try {
                txResponse = await randomWallet.sendTransaction(txDetails);
                receipt = await txResponse.wait();
                expect(receipt?.status).toBe(1)
            } catch (error) {
                expect(true)
            }
        })

        test('test set user1 kycinfo verified', async () => {
            const wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            const contract = new ethers.Contract(ST_ACCESS_KYC_ADDRESS, abi, wallet);
            const extraSubmitArgs = {
                Addresses: [
                    randomWallet.address
                ]
            }
            const toByte = stringToUint8Array(JSON.stringify(extraSubmitArgs));
            const submit = await contract.Submit(
                toByte
            );
            await submit.wait()
            const tx = await provider.getTransactionReceipt(submit.hash)
            expect(tx?.status).toBe(1)
        })

        test ('test user1 can send saw transaction', async () => {
            const txDetails = {
                to: ST_ADMIN_1.address,
                value: ethers.parseEther('10'),
                gasLimit: 21000
            }

            const txResponse = await randomWallet.sendTransaction(txDetails);
            const receipt = await txResponse.wait();
            expect(receipt?.status).toBe(1)
        })
    })

    describe('test case for query', () => {
        const abi = fs.readFileSync(ST_CONTRACT_DIR + 'Access/WhiteList.abi', 'utf8')
        test ('test query WhiteListProvider', async () => {
            const wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
            const contract = new ethers.Contract(ST_ACCESS_KYC_ADDRESS, abi, wallet);
            const extraQueryWhiteListProviderArgs = {
                WhiteListProviderAddr: wallet.address
            }
            const toByte = stringToUint8Array(JSON.stringify(extraQueryWhiteListProviderArgs));
            const submit = await contract.QueryWhiteListProvider(
                toByte
            );
            await submit.wait()
            const tx = await provider.getTransactionReceipt(submit.hash)
            let s = hexToString(tx?.logs[0].data);
            console.log(s)
            // get KycAddr from s which is a json string like {"KycAddr":"0x..."}
            let obj = JSON.parse(s);
            expect(obj.WhiteListProviderAddr).toBe(wallet.address)
        })

        const SuperUser = 1
        test ('test query auth info', async () => {
            const contract = new ethers.Contract(ST_ACCESS_KYC_ADDRESS, abi, new ethers.Wallet(ST_ADMIN_1.privateKey, provider));
            const extraQueryAuthInfoArgs = {
                User: ST_ADMIN_1.address
            }
            const submit = await contract.QueryAuthInfo(
                stringToUint8Array(JSON.stringify(extraQueryAuthInfoArgs))
            );
            await submit.wait()
            const tx = await provider.getTransactionReceipt(submit.hash)
            let s = hexToString(tx?.logs[0].data);
            console.log(s)
            // get KycAddr from s which is a json string like {"KycAddr":"0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013"}
            let obj = JSON.parse(s);
            expect(obj.User).toBe(ST_ADMIN_1.address)
            expect(obj.Role).toBe(SuperUser)
        })
    });

})
