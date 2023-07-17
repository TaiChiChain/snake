import { test, expect } from '@jest/globals';
import { compile } from '../../utils/compile';
//import { construtContractTx } from '../../utils/construtContractTx';
import {
    ST_STORAGE_FILENAME,
    ST_STORAGE_CONTRACT_NAME,
} from '../../utils/contracts';
import { client, construtContractTx } from '../helper';

var contractAddress: any = global;
var abi: any = global;
var account: any = global;

describe('eth_testStorageContract', () => {
    const privateKeyString =
        '0xb6477143e17f889263044f6cf463dc37177ac4526c4c39a7a344198457024a2f';
    const accounts = client.eth.accounts.wallet.add(privateKeyString);
    account = accounts.get(0)?.address
    const code = compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME);
    //console.log('1.compile:', code);
    const bytecode =
        code.contracts[ST_STORAGE_CONTRACT_NAME]['EIP1153Skeleton'].evm.bytecode
            .object;
    abi = code.contracts[ST_STORAGE_CONTRACT_NAME]['EIP1153Skeleton'].abi;


    test('eth_testDeployStorageContract', async () => {

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
        expect(contractAddress).not.toBeNull();
        //return tx.options.address
    });

    test('eth_testSetStorageContract', async () => {

        const MyContract = new client.eth.Contract(abi, contractAddress);
        //console.log('6.contract address:', contractAddress);
        // key = 123 value = 456
        const transactionObject = (MyContract.methods as any).store(
            '0x7b00000000000000000000000000000000000000000000000000000000000000',
            '0x1c80000000000000000000000000000000000000000000000000000000000000'
        );

        const serializedTx = await construtContractTx(transactionObject, account, privateKeyString, contractAddress);

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

    test('eth_testGetStorageContract', async () => {

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

