import { test, expect } from '@jest/globals'
import { client } from './helper'
import { compile } from '../utils/compile';
import {
    ST_STORAGE_FILENAME,
    ST_STORAGE_CONTRACT_NAME,
  } from '../utils/contracts';
import { contract } from 'web3/lib/commonjs/eth.exports';


  test('eth_transfer',async()=>{

    const privateKeyString =
    '0xb6477143e17f889263044f6cf463dc37177ac4526c4c39a7a344198457024a2f';
    const account = client.eth.accounts.wallet.add(privateKeyString);
    const balance = await client.eth.getBalance("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
    console.log(balance)

     //test GetTransactionCount
    const nonce =await client.eth.getTransactionCount("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
    console.log(nonce)

    const signedTx = await client.eth.accounts.signTransaction(
      {
        from: account.get(0)?.address,
        to: "0x5435364189534da6102CEcFdA5aEB2fE59cdF3F7",
        value:"1000000000",
        gas: "21000",
        gasPrice: '50000',
        nonce:BigInt(nonce),
      },
      privateKeyString
    );


    const serializedTx = signedTx.rawTransaction;
    // // 发送签名后的交易
    const receipt = await client.eth
      .sendSignedTransaction(serializedTx)
      .on('transactionHash', (txHash) => {
        console.log('Transaction hash:', txHash);
      })
      .on('receipt', (receipt) => {
        console.log('Transaction receipt:', receipt);
      })
      .on('error', (error) => {
        console.error('Transaction error:', error);
      });
    console.log('Transaction Hash: ' + receipt.transactionHash);


    const balance2 = await client.eth.getBalance("0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013")
    console.log(balance2)



     //test getTxByHash
     const txByHash =await client.eth.getTransaction(receipt.transactionHash)
     console.log(txByHash)
     expect(txByHash.blockNumber).toBe(receipt.blockNumber);
 
     //test GetBlockTransactionCountByNumber
     const blockTxNum = await client.eth.getBlockTransactionCount(receipt.blockNumber)
     console.log(blockTxNum)
     expect(blockTxNum).toBe(BigInt(1));

     const blockTxNumNew = await client.eth.getBlockTransactionCount()
     console.log(blockTxNumNew)
     expect(blockTxNumNew).toBe(BigInt(1));

     const blockTxNumByBlockHash = await client.eth.getBlockTransactionCount(receipt.blockHash.toLocaleString())
     console.log(blockTxNumByBlockHash)
     expect(blockTxNumByBlockHash).toBe(BigInt(1));
     
     //test GetTransactionByBlockNumberAndIndex
     const txByBlockNumAndIndex = await client.eth.getTransactionFromBlock(receipt.blockNumber,0)
     console.log(txByBlockNumAndIndex)
     expect(txByBlockNumAndIndex?.hash).toBe(receipt.transactionHash)

     //test GetTransactionByBlockHashAndIndex
     const txByBlockHashAndIndex = await client.eth.getTransactionFromBlock(receipt.blockHash.toLocaleString(),0)
     console.log(txByBlockHashAndIndex)
     expect(txByBlockHashAndIndex?.hash).toBe(receipt.transactionHash)

     //test GetTransactionReceipt
     const txReceipt = await client.eth.getTransactionReceipt(receipt.transactionHash)
     console.log(txReceipt)
     expect(txReceipt.blockNumber).toBe(receipt.blockNumber);

  })


  test('eth_testStorageContract', async () => {
    const privateKeyString =
      '0xb6477143e17f889263044f6cf463dc37177ac4526c4c39a7a344198457024a2f';
    const account = client.eth.accounts.wallet.add(privateKeyString);
    const code = compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME);
    console.log(code);
    const bytecode =
      code.contracts[ST_STORAGE_CONTRACT_NAME]['EIP1153Skeleton'].evm.bytecode
        .object;
    console.log(bytecode);
    const abi = code.contracts[ST_STORAGE_CONTRACT_NAME]['EIP1153Skeleton'].abi;
    console.log(abi);
    const MyContract = new client.eth.Contract(abi);
    const myContract = MyContract.deploy({
      data: '0x' + bytecode,
      // arguments: [1],
    });
    // const providersAccounts = await client.eth.getAccounts();
    // const defaultAccount = providersAccounts[0];
    const gas = await myContract.estimateGas({
      from: account.get(0)?.address,
    });
    console.log('estimated gas:', gas);
    //Deploy the contract to the Ganache network
    const tx = await myContract
      .send({
        from: account.get(0)?.address,
        gas: gas.toString(),
        gasPrice: '10000000000',
      })
      .on('error', (err) => console.log(err))
      .on('transactionHash', (hash) => {
        console.log(hash);
      })
      .on('receipt', function (receipt) {
        console.log(receipt.contractAddress); // contains the new contract address
      });
    console.log(tx.options.address);
  
    const newContract = new client.eth.Contract(abi, tx.options.address);
    const transactionObject = (newContract.methods as any).store(
      '0x4570000000000000000000000000000000000000000000000000000000000000',
      '0x4570000000000000000000000000000000000000000000000000000000000001'
    );
    const gas1 = await transactionObject.estimateGas({
      from: account.get(0)?.address,
    });
    transactionObject.gas = gas1.toString();
    const rawTransactionData = transactionObject.encodeABI();
    const signedTx = await client.eth.accounts.signTransaction(
      {
        from: account.get(0)?.address,
        to: tx.options.address,
        data: rawTransactionData,
        gas: gas1.toString(),
        gasPrice: '10000000000',
      },
      privateKeyString
    );
  
    const serializedTx = signedTx.rawTransaction;
    // // 发送签名后的交易
    const receipt = await client.eth
      .sendSignedTransaction(serializedTx)
      .on('transactionHash', (txHash) => {
        console.log('Transaction hash:', txHash);
      })
      .on('receipt', (receipt) => {
        console.log('Transaction receipt:', receipt);
      })
      .on('error', (error) => {
        console.error('Transaction error:', error);
      });
    console.log('Transaction Hash: ' + receipt.transactionHash);

    
    const key ='0x4570000000000000000000000000000000000000000000000000000000000000'
    const value ='0x4570000000000000000000000000000000000000000000000000000000000001'
    const callData =(newContract.methods as any).retrieve(key).encodeABI()
    const txObject = {
      to: tx.options.address?tx.options.address: '',
      data: callData
    };

    const callRes=await client.eth.call(txObject)
    console.log(callRes)
    expect(callRes).toBe(value);

    
    






    

    

    
  });


