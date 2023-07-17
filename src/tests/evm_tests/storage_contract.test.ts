import { test, expect, describe } from '@jest/globals';
import { compile } from '../../utils/compile';
import {
    ST_STORAGE_FILENAME,
    ST_STORAGE_CONTRACT_NAME,
} from '../../utils/contracts';
import { client, construtContractTx } from '../../utils/rpc';
import { Address, ContractAbi } from 'web3';

var contractAddress: Address | undefined
var abi: ContractAbi
var account: Address | undefined

describe('evm_testStorageContract', () => {
    const privateKeyString =
        '0xb6477143e17f889263044f6cf463dc37177ac4526c4c39a7a344198457024a2f';
    const accounts = client.eth.accounts.wallet.add(privateKeyString);
    account = accounts.get(0)?.address
    expect(account).not.toBeNull()
    const code = compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME);
    const bytecode =
        code.contracts[ST_STORAGE_CONTRACT_NAME]['EIP1153Skeleton'].evm.bytecode
            .object;
    abi = code.contracts[ST_STORAGE_CONTRACT_NAME]['EIP1153Skeleton'].abi;


    test('evm_testDeployStorageContract', async () => {
        const MyContract = new client.eth.Contract(abi);
        const myContract = MyContract.deploy({
            data: '0x' + bytecode,
        });
        const gas = await myContract.estimateGas({
            from: account,
        });
        console.log('estimated gas:', gas);
        // Deploy the contract to the Ganache network
        const tx = await myContract
            .send({
                from: account,
                gas: gas.toString(),
                gasPrice: '10000000000',
            })
            .on('error', (err) => console.log(err))
            .on('transactionHash', (hash) => {
                console.log('4.deploy contract transactionHash:', hash);
            })
            .on('receipt', function (receipt) {
                console.log('5.contract address:', receipt.contractAddress); // contains the new contract address
            });
        contractAddress = tx.options.address
        expect(contractAddress).not.toBeNull()
    });

    test('evm_testSetStorageContract', async () => {
        const MyContract = new client.eth.Contract(abi, contractAddress);
        // key = 123 value = 456
        const transactionObject = (MyContract.methods as any).store(
            '0x7b00000000000000000000000000000000000000000000000000000000000000',
            '0x1c80000000000000000000000000000000000000000000000000000000000000'
        );
        expect(contractAddress).not.toBeNull()
        expect(account).not.toBeNull()
        const serializedTx = await construtContractTx(transactionObject, account as string, privateKeyString, contractAddress as string);

        // 发送签名后的交易
        const receipt = await client.eth
            .sendSignedTransaction(serializedTx)
            .on('transactionHash', (txHash) => {
                console.log('Transaction hash:', txHash);
            })
            .on('receipt', (receipt) => {
                console.log('Transaction receipt:', receipt);
            })
        expect(receipt).not.toBeNull();
        //console.log('Transaction Hash: ' + receipt.transactionHash);
    });

    test('evm_testGetStorageContract', async () => {
        const MyContract = new client.eth.Contract(abi, '0xa5b030f40b64da20b6763139af6470fe7b5e7633');
        // key = 123 value = 456
        const receipt = await (MyContract.methods as any).retrieve(
            '0x7b00000000000000000000000000000000000000000000000000000000000000'
        ).call();
        console.log('Query Transaction receipt:', receipt);

        expect(receipt).not.toBeNull();
        expect(receipt).toBe('0x1c80000000000000000000000000000000000000000000000000000000000000');
    });

});

