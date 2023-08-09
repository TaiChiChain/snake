import Web3 from 'web3'
import axios from 'axios'
import { ContractUtils } from '../utils/contract'
import {
    ST_CONTRACT_DIR,
    ST_PRIVATEKRY,
    ST_STORAGE_CONTRACT_NAME,
    ST_STORAGE_FILENAME
} from '../utils/contracts_static'
import { ethers } from "ethers";

export const url = 'http://172.16.13.132:8881'
export const client = new Web3(url)
//export const provider = new ethers.JsonRpcProvider(url)

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
        const result = await axios.post(url, body, {
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
    const utils: ContractUtils = new ContractUtils(
        ST_CONTRACT_DIR,
        client,
        ST_PRIVATEKRY
    )
    utils.compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME)
    try {
        const address = await utils.deploy(ST_STORAGE_CONTRACT_NAME)
        return address
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
    return await request('eth_newFilter', params)
}

export async function newBlockFilter() {
    return await request('eth_newBlockFilter')
}

export async function newPendingTransactionFilter() {
    return await request('eth_newPendingTransactionFilter')
}
