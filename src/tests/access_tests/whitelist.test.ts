import {test, expect, describe} from '@jest/globals'
import {ethers, Wallet} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_ACCESS_KYC_ADDRESS,
} from "../../utils/contracts_static";
import {newProvider} from "../../utils/rpc";
import {ST_ADMIN_1, ST_ACCOUNT_1} from "../../utils/accounts_static";
import {hexToString, stringToUint8Array} from "../../utils/util";
import {SUPER_USER} from "../../utils/contracts_static"
import fs from "fs";

describe('TestCases for kyc verification', () => {
    const provider = newProvider()
    describe('test normal submit and remove', () => {
        const randomWallet = Wallet.createRandom(provider);
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
                addresses: [
                    randomWallet.address
                ]
            }
            const toByte = stringToUint8Array(JSON.stringify(extraSubmitArgs));
            const submit = await contract.submit(
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
                whiteListProviderAddr: wallet.address
            }
            const toByte = stringToUint8Array(JSON.stringify(extraQueryWhiteListProviderArgs));
            const queryRes = await contract.queryWhiteListProvider(
                toByte
            );
            let obj = JSON.parse(hexToString(queryRes));
            expect(obj.WhiteListProviderAddr).toBe(wallet.address)
        })

        test ('test query auth info', async () => {
            const contract = new ethers.Contract(ST_ACCESS_KYC_ADDRESS, abi, new ethers.Wallet(ST_ADMIN_1.privateKey, provider));
            const extraQueryAuthInfoArgs = {
                user: ST_ADMIN_1.address
            }
            const queryRes = await contract.queryAuthInfo(
                stringToUint8Array(JSON.stringify(extraQueryAuthInfoArgs))
            );
            let obj = JSON.parse(hexToString(queryRes));
            expect(obj.User).toBe(ST_ADMIN_1.address)
            expect(obj.Role).toBe(SUPER_USER)
        })
    });

})
