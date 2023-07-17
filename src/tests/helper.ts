import Web3 from 'web3'
import { compile } from '../utils/compile';
import { ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME } from '../utils/contracts';

const url = "http://172.16.13.132:8881"
export const client = new Web3(url)

compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME)

export async function construtContractTx(transactionObject: any, account: any, privateKeyString: any, contractAddress: any) {

    const gas = await transactionObject.estimateGas({
        from: account,
    });

    const rawTransactionData = transactionObject.encodeABI();
    const signedTx = await client.eth.accounts.signTransaction(
        {
            from: account,
            to: contractAddress,
            data: rawTransactionData,
            gas: gas.toString(),
            gasPrice: '10000000000',
        },
        privateKeyString
    );
    const serializedTx = signedTx.rawTransaction;
    console.log('serializedTx :', serializedTx);
    return serializedTx
}
