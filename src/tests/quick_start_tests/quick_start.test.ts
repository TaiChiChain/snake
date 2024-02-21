import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {newProvider, request, compile_contract} from '../../utils/rpc'
import {
    ST_CONTRACT_DIR,
    ST_GOVERNANCE_CONTRACT_ADDRESS,
    PROPOSAL_TYPE_NODE_UPGRADE
} from '../../utils/contracts_static'
import {waitAsync, stringToUint8Array} from '../../utils/util'
import {
    ST_ACCOUNT_1,
    ST_ACCOUNT_2,
    ST_ACCOUNT_3,
    ST_ACCOUNT_4,
    ST_ADMIN_1
} from '../../utils/accounts_static'
import * as fs from 'fs'
import {getBlockNumber} from 'web3/lib/commonjs/eth.exports'

describe('test_connect_axiom', () => {
    const provider = newProvider()
    test('eth_getBlockNumber', async () => {
        const latestBlock = await provider.getBlockNumber()
        console.log('The latest block number is', latestBlock)
        expect(latestBlock).toBeGreaterThanOrEqual(BigInt(1))
    })

    test('transfer AXM', async () => {
        const wallet = new ethers.Wallet(ST_ACCOUNT_1.privateKey, provider)
        const balance = await provider.getBalance(ST_ACCOUNT_1.address)
        console.log('This from address balance is', balance)
        expect(balance).toBeGreaterThanOrEqual(BigInt(1))

        const wallet_random = ethers.Wallet.createRandom()
        const addressTo = await wallet_random.getAddress()
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
        for (let i = 0; i < 2; i++) {
            const wallet = new ethers.Wallet(ST_ACCOUNT_2.privateKey, provider)
            const bytecode = fs.readFileSync(
                ST_CONTRACT_DIR + 'ERC20/ERC20.bin',
                'utf8'
            )
            const abi = fs.readFileSync(
                ST_CONTRACT_DIR + 'ERC20/ERC20.abi',
                'utf8'
            )

            const erc20_instance = new ethers.ContractFactory(
                abi,
                bytecode,
                wallet
            )
            console.log(`Attempting to deploy from account: ${wallet.address}`)
            const contract = await erc20_instance.deploy()
            const txReceipt = await contract.deploymentTransaction()?.wait()
            const contractAddress = String(txReceipt?.contractAddress)
            console.log(
                'deploy erc20 contract successful with address :',
                contractAddress
            )

            const erc20_contract = new ethers.Contract(
                contractAddress,
                abi,
                wallet
            )
            console.log('Mint 1000000000 TAXM at :', ST_ACCOUNT_2.address)
            const createReceipt = await erc20_contract.mint(1000000000000)
            await createReceipt.wait()
            console.log('Tx successful with hash:', createReceipt.hash)
        }
    })

    test('deploy and invoke ERC721 contract', async () => {
        const wallet = new ethers.Wallet(ST_ACCOUNT_3.privateKey, provider)
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
        console.log('Mint NFT at :', ST_ACCOUNT_3.address)
        const createReceipt = await erc721_contract.mintNFT(
            ST_ACCOUNT_3.address,
            '123456'
        )
        await createReceipt.wait()
        console.log('Tx successful with hash:', createReceipt.hash)
    })

    test('deploy and invoke ERC1155 contract', async () => {
        const wallet = new ethers.Wallet(ST_ACCOUNT_4.privateKey, provider)
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
        console.log('Mint some NFT at :', ST_ACCOUNT_4.address)
        const createReceipt = await erc1155_contract.mintToken(1, 10)
        await createReceipt.wait()
        console.log('Tx successful with hash:', createReceipt.hash)
    })

    test('compile evm contract', async () => {
        const compiledCode = compile_contract('evm.sol')
        //console.log('compiledCode:', compiledCode)
        expect(JSON.stringify(compiledCode)).toMatch('code')
        const bytecode =
            compiledCode.contracts['code']['EVM'].evm.bytecode.object

        const abi = compiledCode.contracts['code']['EVM'].abi
        //console.log('contractBytecode:', bytecode)
        //console.log('contractAbi:', abi)
        expect(bytecode).not.toBeNull
        expect(abi).not.toBeNull
    })

    test('send EIP1559 tx', async () => {
        const wallet = new ethers.Wallet(ST_ACCOUNT_4.privateKey, provider)
        const beforeBalance = await provider.getBalance(ST_ADMIN_1.address)
        //console.log('beforeBalance:', beforeBalance)
        const feeData = await provider.getFeeData()
        console.log('feeData:', feeData)
        const gasPrice = feeData.gasPrice
        expect(gasPrice).not.toBeNull()
        const nonce = await provider.getTransactionCount(wallet.address)
        // Create tx object
        const tx = {
            chainId: '1356',
            nonce: nonce,
            to: '0xE55Db6E6743111F35F18af34E8331AB1E27214de',
            type: 2, // 2代表eip1559交易
            //gasPrice: feeData.gasPrice,
            maxFeePerGas: feeData.maxFeePerGas,
            //maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            maxPriorityFeePerGas: 1,
            gasLimit: 21000,
            value: ethers.parseEther('1.0')
        }
        // Signtx - wait for receipt
        const singnedTx = await wallet.signTransaction(tx)
        var res = await request('eth_sendRawTransaction', [singnedTx])
        console.log(res)
        await waitAsync(3000)
        const afterBalance = await provider.getBalance(ST_ADMIN_1.address)
        console.log('Balance difference:', afterBalance - beforeBalance)
        if (gasPrice !== null) {
            expect(afterBalance - beforeBalance).toEqual(
                gasPrice * BigInt(21000)
            )
        }
    })

    test('send Legacy tx', async () => {
        const wallet = new ethers.Wallet(ST_ACCOUNT_4.privateKey, provider)
        const beforeBalance = await provider.getBalance(ST_ADMIN_1.address)
        //console.log('beforeBalance:', beforeBalance)
        const feeData = await provider.getFeeData()
        console.log('feeData:', feeData)
        const gasPrice = feeData.gasPrice
        expect(gasPrice).not.toBeNull()
        const nonce = await provider.getTransactionCount(wallet.address)
        // Create tx object
        const tx = {
            chainId: '1356',
            nonce: nonce,
            to: '0xE55Db6E6743111F35F18af34E8331AB1E27214de',
            type: 1,
            gasPrice: gasPrice,
            gasLimit: 21000,
            value: ethers.parseEther('1.0')
        }
        // Signtx - wait for receipt
        const singnedTx = await wallet.signTransaction(tx)
        var res = await request('eth_sendRawTransaction', [singnedTx])
        console.log(res)
        await waitAsync(3000)
        const afterBalance = await provider.getBalance(ST_ADMIN_1.address)
        console.log('Balance:', afterBalance - beforeBalance)
        if (gasPrice !== null) {
            expect(afterBalance - beforeBalance).toEqual(
                gasPrice * BigInt(21000)
            )
        }
    })

    test('debug_traceTransaction', async () => {
        console.log('Prepare some transactions first')
        const wallet = new ethers.Wallet(ST_ADMIN_1.privateKey, provider)

        const abi = fs.readFileSync(
            ST_CONTRACT_DIR + 'Governance/governance.abi',
            'utf8'
        )
        const contract = new ethers.Contract(
            ST_GOVERNANCE_CONTRACT_ADDRESS,
            abi,
            wallet
        )
        let upgradeExtraArgs = {
            DownloadUrls: [
                'https://github.com/axiomesh/axiom-ledger/archive/refs/tags/v0.0.1.tar.gz',
                'https://github.com/axiomesh/axiom-ledger/archive/refs/tags/v0.0.2.tar.gz'
            ],
            CheckHash:
                'ed15d72d6d437db61a00abc6fa20c3d34f33a9221b8dc770df5ae32149b369bb'
        }
        let upgradeArgs = stringToUint8Array(JSON.stringify(upgradeExtraArgs))
        //console.log('Mint 1000000000 TAXM at :', ST_ACCOUNT_5.address)
        const propose = await contract.propose(
            PROPOSAL_TYPE_NODE_UPGRADE,
            'test upgrade node',
            'test upgrade node',
            1000000,
            upgradeArgs
        )
        await propose.wait()
        const txHash = propose.hash
        //console.log('Tx successful with hash:', txHash)

        const res = await request('debug_traceTransaction', [
            txHash,
            {
                tracer: 'prestateTracer'
            }
        ])
        console.log('rpc post normal', '===', JSON.stringify(res.result))
        expect(res.result).not.toBeNull
        //expect(JSON.stringify(res.result)).toMatch('code')

        const res1 = await request('debug_traceTransaction', [
            txHash,
            {
                tracer: 'callTracer'
            }
        ])
        console.log('rpc post normal', '===', JSON.stringify(res1.result))
        expect(res1.result).not.toBeNull
        //expect(JSON.stringify(res1.result)).toMatch('CALL')
    })
})

describe('test get filter logs', () => {
    const provider = newProvider()
    test('getLogs with reasonable block range', async () => {
        let blockNo = await provider.getBlockNumber()
        console.log('blockNumber:', blockNo)
        var toBlock = '0x1'
        if (blockNo < 2000) {
            toBlock = '0x' + blockNo.toString(16)
        } else {
            toBlock = '0x7D0' // 2000
        }
        console.log('toBlock:', toBlock)
        var res = await request('eth_getLogs', [
            {fromBlock: '0x1', toBlock: toBlock}
        ])
        let event = res.result[0]
        expect(event).not.toBeNull()
        console.log(event)
        expect(event.address).toMatch(
            '0x0000000000000000000000000000000000001001'
        )
    })
    test('getLogs with unreasonable block range', async () => {
        var toBlock = '0x7D1' // 2001
        console.log('toBlock:', toBlock)
        var res = await request('eth_getLogs', [
            {fromBlock: '0x1', toBlock: toBlock}
        ])
        console.log(res)
        expect(res.error).not.toBeNull()
        expect(res.error.message).toMatch(
            'query block range needs to be less than or equal to 2000'
        )
    })

    test('getLogs with unreasonable block range', async () => {
        var toBlock = '0x7D3' // 2003
        var fromBlock = '0x3' // 3
        console.log('toBlock:', toBlock)
        var res = await request('eth_getLogs', [
            {fromBlock: fromBlock, toBlock: toBlock}
        ])
        console.log(res)
        expect(res.error).not.toBeNull()
        expect(res.error.message).toMatch(
            'query block range needs to be less than or equal to 2000'
        )
    })
})
