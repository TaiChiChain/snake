import Web3, {Address, Transaction, TransactionReceipt} from 'web3'
import * as fs from 'fs'
const solc = require('solc')
import {Wallet, ethers} from '@axiomesh/axiom'
import axios from 'axios'
import {ContractUtils} from '../utils/contract'
import {
    ST_CONTRACT_DIR,
    ST_STORAGE_CONTRACT_NAME,
    ST_STORAGE_FILENAME
} from '../utils/contracts_static'
import {ST_ADMIN_1} from '../utils/accounts_static'

export const ST_URL = process.env.ST_URL || 'http://127.0.0.1:8881'
export const WS_URL = process.env.WS_URL || 'ws://127.0.0.1:9991'
export const BUNDLER_URL ='http://127.0.0.1:4337'
export const ST_PAYMASTER_URL = 'http://127.0.0.1:10088'

export const SIGNER_KEY = '0xb6477143e17f889263044f6cf463dc37177ac4526c4c39a7a344198457024a2f'


export const provider = new ethers.JsonRpcProvider(ST_URL)

export function newRpcClient() {
    return new Web3(ST_URL)
}

export function newProvider() {
    return new ethers.JsonRpcProvider(ST_URL)
}
export function newWebSocketProvider() {
    return new ethers.WebSocketProvider(WS_URL)
}

export function newWallet(provider: ethers.Provider) {
    return new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
}

export function newContract(contractAddress: any, abi: any, wallet: any) {
    return new ethers.Contract(contractAddress, abi, wallet)
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

export function compile_contract(contractFile: string) {
    const contractPath = ST_CONTRACT_DIR + contractFile
    const sourceCode = fs.readFileSync(contractPath, 'utf8')
    // solc compiler config
    const input = {
        language: 'Solidity',
        sources: {
            ['code']: {
                content: sourceCode
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    }

    const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)))
    if (compiledCode['errors'] && compiledCode['errors'].length > 0) {
        const errs = []
        for (const info of compiledCode['errors']) {
            if (info.type.includes('Error')) {
                errs.push(info)
            }
        }
        if (errs.length > 0) {
            throw new Error(JSON.stringify(errs))
        }
    }
    return compiledCode
}

export async function deploy_contract(
    wallet: Wallet,
    contractPath: string
): Promise<string> {
    const bytecode = fs.readFileSync(
        ST_CONTRACT_DIR + contractPath + '.bin',
        'utf8'
    )
    const abi = fs.readFileSync(ST_CONTRACT_DIR + contractPath + '.abi', 'utf8')

    const instance = new ethers.ContractFactory(abi, bytecode, wallet)
    try {
        const deploy = await instance.deploy()
        const txReceipt = await deploy.deploymentTransaction()?.wait()
        const contractAddress = String(txReceipt?.contractAddress)
        //console.log('deploy contract successful with address:', contractAddress)
        return contractAddress
    } catch (e) {
        throw new Error('deploy contract failed, address is nil!')
    }
}

export async function transferAXM(
    wallet: Wallet,
    toAddr: Address,
    nonce: number,
    amount: string
): Promise<ethers.TransactionResponse> {
    //console.log('transfer AXM from', wallet.address, 'to', toAddr)
    // Create tx object
    const tx = {
        to: toAddr,
        nonce: nonce,
        value: ethers.parseEther(amount)
    }
    // Sign and send tx and wait for receipt
    const receipt = await wallet.sendTransaction(tx)
    await receipt.wait()
    //console.log('Transaction successful with hash:', receipt.hash)
    return receipt
}

export async function transferAXc(
    wallet: Wallet,
    toAddr: string,
    nonce: number,
    amount: string
): Promise<ethers.TransactionResponse> {
    //console.log('transfer AXM from', wallet.address, 'to', toAddr)
    // Create tx object
    const tx = {
        to: toAddr,
        nonce: nonce,
        value: ethers.parseEther(amount)
    }
    // Sign and send tx and wait for receipt
    const receipt = await wallet.sendTransaction(tx)
    await receipt.wait()
    //console.log('Transaction successful with hash:', receipt.hash)
    return receipt
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
        gasPrice:  gasPrice * BigInt(20),
        gasLimit: 21000,
        nonce: nonce
    }
    const signedTransaction = await client.eth.accounts.signTransaction(
        transactionObject,
        privateKey
    )
    return client.eth.sendSignedTransaction(signedTransaction.rawTransaction)
}

export async function deploy_storage_contract() {
    const client = newRpcClient()
    const utils: ContractUtils = new ContractUtils(
        ST_CONTRACT_DIR,
        client,
        ST_ADMIN_1.privateKey
    )
    utils.compile(ST_STORAGE_FILENAME, ST_STORAGE_CONTRACT_NAME)
    try {
        const address = await utils.deploy(ST_STORAGE_CONTRACT_NAME)
        return address
    } catch (e) {
        //console.log("err is:", error)
        throw new Error('deploy contract failed, address is nil!')
    }
}
