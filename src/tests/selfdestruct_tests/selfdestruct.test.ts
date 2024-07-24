import {test, expect} from '@jest/globals'
import {
    ethers,
    Wallet,
    Contract,
    ContractFactory,
    HDNodeWallet,
    BaseWallet
} from '@axiomesh/axiom'
import {newProvider} from '../../utils/rpc'
import {ST_CONTRACT_DIR} from '../../utils/contracts_static'
import {ST_ADMIN_1} from '../../utils/accounts_static'
import * as fs from 'fs'

describe('test selfdestruct', () => {
    let provider: ethers.Provider
    let wallet: Wallet
    let abi: string
    let bytecode: string
    let factory: ContractFactory
    let contract: Contract
    let contractOfSuicide: Contract
    let contractAddress: string
    let rWallet: BaseWallet

    beforeAll(async () => {
        provider = newProvider()
        wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
        abi = fs.readFileSync(
            `${ST_CONTRACT_DIR}Selfdestruct/TestSelfDestruct.abi`,
            'utf8'
        )
        bytecode = fs.readFileSync(
            `${ST_CONTRACT_DIR}Selfdestruct/TestSelfDestruct.bin`,
            'utf8'
        )

        // Deploying contract
        factory = new ethers.ContractFactory(abi, bytecode, wallet)
        contract = (await factory.deploy()) as Contract
        const txReceipt = await contract.deploymentTransaction()?.wait()
        contractAddress = String(txReceipt?.contractAddress)
        console.log(
            'deploy TestSelfDestruct contract successful with address :',
            contractAddress
        )
        console.log('Contract deployed at:', contractAddress)
        contractOfSuicide = new ethers.Contract(contractAddress, abi, wallet)
    })

    test('contract should be active before destruction', async () => {
        const activeStatus = await contractOfSuicide.checkActive()
        expect(activeStatus).toBe('Contract is active')
    })

    test('contract should receive ETH and self-destruct', async () => {
        const tx = {to: contractAddress, value: ethers.parseEther('1')}
        // Sending axm to the contract
        const createReceipt = await wallet.sendTransaction(tx)
        await createReceipt.wait()

        // Prepare for selfdestruct
        rWallet = ethers.Wallet.createRandom(provider)
        const destroyReceipt = await contractOfSuicide.destroyContract(
            rWallet.address
        )
        await destroyReceipt.wait()

        // Checking if the contract code is removed
        const code = await provider.getCode(contractAddress)
        expect(code).not.toBe('0x')
    })

    test('random wallet should receive ETH after selfdestruct', async () => {
        const balance = await provider.getBalance(rWallet.address)
        console.log('account address is :', rWallet.address)
        expect(balance.toString()).toBe(ethers.parseEther('1').toString())
    })
})

describe('test selfdestruct on creation', () => {
    let provider: ethers.Provider
    let wallet: Wallet
    let abi: string
    let bytecode: string
    let factory: ContractFactory
    let contract: Contract
    let contractAddress: string

    test('test selfdestruct on creation and code will be 0x', async () => {
        provider = newProvider()
        wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)
        abi = fs.readFileSync(
            `${ST_CONTRACT_DIR}Selfdestruct/TestSelfDestructOnCreation.abi`,
            'utf8'
        )
        bytecode = fs.readFileSync(
            `${ST_CONTRACT_DIR}Selfdestruct/TestSelfDestructOnCreation.bin`,
            'utf8'
        )

        // Deploying contract, and at the same time, it will selfdestruct
        factory = new ethers.ContractFactory(abi, bytecode, wallet)
        contract = (await factory.deploy(wallet.address)) as Contract
        const txReceipt = await contract.deploymentTransaction()?.wait()
        contractAddress = String(txReceipt?.contractAddress)
        console.log(
            'deploy TestSelfDestructOnCreation contract successful with address :',
            contractAddress
        )
        // Checking if the contract code is removed
        try {
            await provider.getCode(contractAddress)
            expect(true).toBe(false)
        } catch (error: any) {
            expect(error.message).toMatch('method handler crashed')
        }
    })
})
