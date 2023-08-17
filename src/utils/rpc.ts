import Web3, { Address, Transaction, TransactionReceipt } from 'web3'
import axios from 'axios'
import { ContractUtils } from '../utils/contract'
import {
    ST_CONTRACT_DIR,
    ST_STORAGE_CONTRACT_NAME,
    ST_STORAGE_FILENAME
} from '../utils/contracts_static'

export const ST_PRIVATEKRY =
    '0xb6477143e17f889263044f6cf463dc37177ac4526c4c39a7a344198457024a2f'
export const ST_ADDRESS = '0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013'
export const ST_URL = 'http://127.0.0.1:8881'
//export const ST_URL = 'http://10.2.67.130:8881'

export function newRpcClient() {
    return new Web3(ST_URL)
}

interface ethRequest {
    id: number
    jsonrpc: string
    method: string
    params: any
}

export async function request(method: string, params?: any) {
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

export async function deploy_storage_contract() {
    const client = newRpcClient()
    const utils: ContractUtils = new ContractUtils(
        ST_CONTRACT_DIR,
        client,
        ST_PRIVATEKRY
    )
    utils.compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME)
    try {
        const address = await utils.deploy(ST_STORAGE_CONTRACT_NAME)
        return address
    } catch (e) {
        //console.log("err is:", error)
        throw new Error("deploy contract failed, address is nil!")
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
    return await request('eth_newFilter', params)
}

export async function newBlockFilter() {
    return await request('eth_newBlockFilter')
}

export async function newPendingTransactionFilter() {
    return await request('eth_newPendingTransactionFilter')
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
