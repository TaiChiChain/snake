import Web3 from 'web3'
import axios from 'axios'
import { ethers } from "ethers";

export const url = 'http://127.0.0.1:8881'
// export const url = 'http://127.0.0.1:8545'
export const client = new Web3(url)
export const provider = new ethers.JsonRpcProvider(url)

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