import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {ST_URL, ST_ADDRESS, ST_PRIVATEKRY} from '../../utils/rpc'
import {ST_CONTRACT_DIR} from '../../utils/contracts_static'
import * as fs from 'fs'

describe('test_connect_axiom', () => {
    const addressTo = '0xE55Db6E6743111F35F18af34E8331AB1E27214de'
    const provider = new ethers.JsonRpcProvider(ST_URL)
    const wallet = new ethers.Wallet(ST_PRIVATEKRY, provider)
    //const wallet2 = new (ethers.Wallet as any).createRandom()

    test('eth_getBlockNumber', async () => {
        const latestBlock = await provider.getBlockNumber()
        console.log('The latest block number is', latestBlock)
        expect(latestBlock).toBeGreaterThanOrEqual(BigInt(1))
    })

    test('transfer AXM', async () => {
        const balance = await provider.getBalance(ST_ADDRESS)
        console.log('This from address balance is', balance)
        expect(balance).toBeGreaterThanOrEqual(BigInt(1))

        console.log('transfer AXM from', wallet.address, 'to', addressTo)
        // Create tx object
        const tx = {
            to: addressTo,
            value: ethers.parseEther('1')
        }
        // Sign and send tx - wait for receipt
        const createReceipt = await wallet.sendTransaction(tx)
        await createReceipt.wait()
        console.log('Transaction successful with hash:', createReceipt.hash)
    })

    test('deploy and invoke ERC20 contract', async () => {
        const bytecode = fs.readFileSync(
            ST_CONTRACT_DIR + 'ERC20/ERC20.bin',
            'utf8'
        )
        const abi = fs.readFileSync(ST_CONTRACT_DIR + 'ERC20/ERC20.abi', 'utf8')

        const erc20_instance = new ethers.ContractFactory(abi, bytecode, wallet)
        console.log(`Attempting to deploy from account: ${wallet.address}`)
        const contract = await erc20_instance.deploy()
        const txReceipt = await contract.deploymentTransaction()?.wait()
        const contractAddress = String(txReceipt?.contractAddress)
        console.log(
            'deploy erc20 contract successful with address :',
            contractAddress
        )

        const erc20_contract = new ethers.Contract(contractAddress, abi, wallet)
        console.log('Mint 1000000000 TAXM at :', ST_ADDRESS)
        const createReceipt = await erc20_contract.mint(1000000000000)
        await createReceipt.wait()
        console.log('Tx successful with hash:', createReceipt.hash)
    })

    test('deploy and invoke ERC721 contract', async () => {
        const bytecode = fs.readFileSync(
            ST_CONTRACT_DIR + 'ERC721/ERC721.bin',
            'utf8'
        )
        const abi = fs.readFileSync(
            ST_CONTRACT_DIR + 'ERC721/ERC721.abi',
            'utf8'
        )

        const erc721_instance = new ethers.ContractFactory(
            abi,
            bytecode,
            wallet
        )
        console.log(
            'Attempting to deploy erc721 from account: ',
            wallet.address
        )
        const contract = await erc721_instance.deploy('testJJ', 'JJ')
        const txReceipt = await contract.deploymentTransaction()?.wait()
        const contractAddress = String(txReceipt?.contractAddress)
        console.log(
            'deploy erc721 contract successful with address :',
            contractAddress
        )

        const erc721_contract = new ethers.Contract(
            contractAddress,
            abi,
            wallet
        )
        console.log('Mint NFT at :', ST_ADDRESS)
        const createReceipt = await erc721_contract.mintNFT(
            ST_ADDRESS,
            '123456'
        )
        await createReceipt.wait()
        console.log('Tx successful with hash:', createReceipt.hash)
    })

    test('deploy and invoke ERC1155 contract', async () => {
        const bytecode = fs.readFileSync(
            ST_CONTRACT_DIR + 'ERC1155/ERC1155.bin',
            'utf8'
        )
        const abi = fs.readFileSync(
            ST_CONTRACT_DIR + 'ERC1155/ERC1155.abi',
            'utf8'
        )

        const erc1155_instance = new ethers.ContractFactory(
            abi,
            bytecode,
            wallet
        )
        console.log(
            'Attempting to deploy ERC1155 from account: ',
            wallet.address
        )
        const contract = await erc1155_instance.deploy(
            'KK',
            'https://axiom.example/api/item/'
        )
        const txReceipt = await contract.deploymentTransaction()?.wait()
        const contractAddress = String(txReceipt?.contractAddress)
        console.log(
            'deploy ERC1155 contract successful with address :',
            contractAddress
        )

        const erc1155_contract = new ethers.Contract(
            contractAddress,
            abi,
            wallet
        )
        console.log('Mint some NFT at :', ST_ADDRESS)
        const createReceipt = await erc1155_contract.mintToken(1, 10)
        await createReceipt.wait()
        console.log('Tx successful with hash:', createReceipt.hash)
    })
})
