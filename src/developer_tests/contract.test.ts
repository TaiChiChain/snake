import { test } from '@jest/globals'
import { client} from '../utils/rpc'
import { compile } from '../utils/compile';
import { ST_STORAGE_CONTRACT_NAME, ST_STORAGE_FILENAME } from '../utils/contracts';

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
    // Deploy the contract to the Ganache network
    await myContract
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
  });