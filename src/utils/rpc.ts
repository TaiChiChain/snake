import Web3, {Address, Transaction, TransactionReceipt} from 'web3'
import axios from 'axios'

export const ST_PRIVATEKRY =
    '0xb6477143e17f889263044f6cf463dc37177ac4526c4c39a7a344198457024a2f'
export const ST_ADDRESS = '0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013'
export const ST_URL = 'http://127.0.0.1:8881'

export function newRpcClient() {
    return new Web3(ST_URL)
}

interface ethRequest {
    id: number
    jsonrpc: string
    method: string
    params: any
}

export async function call(method: string, params?: any) {
    const request: ethRequest = {
        id: 1,
        jsonrpc: '2.0',
        method: method,
        params: params
    }

    const body = JSON.stringify(request)

    try {
        const result = await axios.post(ST_URL, body, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return result.data
    } catch (error: any) {
        throw new Error(error.message)
    }
}

declare type BlockTag = 'latest' | 'pending' | 'earliest'
declare type HexString = string

export interface FilterParams {
    fromBlock?: HexString | BlockTag
    toBlock?: HexString | BlockTag
    address?: HexString[]
    topics?: HexString[][]
}

export async function newFilter(params: FilterParams[]) {
    return await call('eth_newFilter', params)
}

export async function newBlockFilter() {
    return await call('eth_newBlockFilter')
}

export async function newPendingTransactionFilter() {
    return await call('eth_newPendingTransactionFilter')
}

export async function transfer(
    fromAddr: Address,
    toAddr: Address,
    amount: string,
    nonce: bigint,
    privateKey: string
): Promise<TransactionReceipt> {
    const client = newRpcClient()
    const gasPrice = await client.eth.getGasPrice()

    const transactionObject: Transaction = {
        from: fromAddr,
        to: toAddr,
        value: amount,
        gasPrice: gasPrice,
        gasLimit: 21000,
        nonce: nonce
    }
    const signedTransaction = await client.eth.accounts.signTransaction(
        transactionObject,
        privateKey
    )

    return client.eth.sendSignedTransaction(signedTransaction.rawTransaction)
}
