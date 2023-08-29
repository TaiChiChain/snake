import { test, expect } from '@jest/globals'
import { ethers } from '@axiomesh/axiom'
import { ST_URL, ST_ADDRESS, ST_PRIVATEKRY } from '../../utils/rpc'

const addressTo = '0xE55Db6E6743111F35F18af34E8331AB1E27214de';

describe('test_connect_axiom', () => {
    const provider = new ethers.JsonRpcProvider(ST_URL);
    const wallet = new ethers.Wallet(ST_PRIVATEKRY, provider);

    test('eth_getBlockNumber', async () => {
        const latestBlock = await provider.getBlockNumber();
        console.log("The latest block number is", latestBlock);
        expect(latestBlock).toBeGreaterThanOrEqual(BigInt(1))
    })

    test('transfer AXM', async () => {
        const balance = await provider.getBalance(ST_ADDRESS)
        console.log("This from address balance is", balance);
        //expect(balance).toBeGreaterThanOrEqual(BigInt(1))
        //wallet.signTransaction
        //const txCount = provider.getTransactionCount(ST_ADDRESS)
        //const gasPrice = provider.estimateGas()

        console.log("transfer AXM from", wallet.address, "to", addressTo)
        // Create tx object
        const tx = {
            to: addressTo,
            value: ethers.parseEther('1'),
        };
        // Sign and send tx - wait for receipt
        const createReceipt = await wallet.sendTransaction(tx);
        await createReceipt.wait();
        console.log("Transaction successful with hash:", createReceipt.hash);
    })
})