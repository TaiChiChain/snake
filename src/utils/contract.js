const solc = require('solc')
const fs = require('fs')
const { log } = require('console')

class ContractUtils {
    constructor(contractDir, client, privateKeyString) {
        this.contractDir = contractDir
        this.ContractMap = new Map()
        this.client = client
        this.privateKeyString = privateKeyString
        this.accounts = this.client.eth.accounts.wallet.add(privateKeyString)
        this.account = this.accounts.get(0)?.address
    }

    compile(fileName, contractName) {
        // Read the Solidity source code from the file s ystem
        const contractPath = this.contractDir + fileName
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
        // Compile the Solidity code using solc
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

        this.ContractMap[contractName] =
            compiledCode.contracts['code'][contractName]
    }

    getByteCode(contractName) {
        if (!this.ContractMap[contractName]) {
            throw new Error(`no such contract: ${contractName}`)
        }

        return this.ContractMap[contractName].evm.bytecode.object
    }

    getAbi(contractName) {
        if (!this.ContractMap[contractName]) {
            throw new Error(`no such contract: ${contractName}`)
        }

        return this.ContractMap[contractName].abi
    }

    async estimateGas(contractName, ...params) {
        if (!this.ContractMap[contractName]) {
            throw new Error(`no such contract: ${contractName}`)
        }

        const contract = new this.client.eth.Contract(this.getAbi(contractName))
        const tx = contract.deploy({
            data: '0x' + this.getByteCode(contractName),
            arguments: params
        })
        const gas = await tx.estimateGas({
            from: this.account
        })
        return gas
    }

    async getGasPrice() {
        return await this.client.eth.getGasPrice()
    }

    async deploy(contractName, ...params) {
        if (!this.ContractMap[contractName]) {
            throw new Error(`no such contract: ${contractName}`)
        }

        const contract = new this.client.eth.Contract(this.getAbi(contractName))
        const tx = contract.deploy({
            data: '0x' + this.getByteCode(contractName),
            arguments: params
        })
        const gas = await tx.estimateGas(contractName, ...params)
        const gasPrice = await this.getGasPrice()
        const res = await tx
            .send({
                from: this.account,
                gas: gas.toString(),
                gasPrice: gasPrice
            })
            .catch(error => {
                throw new error(`deploy ${contractName} error: ${error}`)
            })
        return res.options.address
    }

    async call(contractName, address, method, ...params) {
        if (!this.ContractMap[contractName]) {
            throw new Error(`no such contract: ${contractName}`)
        }
        const abi = this.getAbi(contractName)
        let callFunc = null
        for (const func of abi) {
            if (func.name == method) {
                callFunc = func
                break
            }
        }
        if (!callFunc) {
            throw new Error(`no such method ${method} in contract's Abi`)
        }

        const contract = new this.client.eth.Contract(abi, address)
        const tx = contract.methods[method](...params)
        const isReadOnly =
            callFunc.stateMutability === 'view' ||
            callFunc.stateMutability === 'pure'

        if (isReadOnly) {
            return await tx.call({ from: this.account })
        } else {
            const gas = await tx.estimateGas({
                from: this.account
            })
            const gasPrice = await this.getGasPrice()
            const rawTransactionData = tx.encodeABI()
            const signedTx = await this.client.eth.accounts.signTransaction(
                {
                    from: this.account,
                    to: address,
                    data: rawTransactionData,
                    gas: gas,
                    gasPrice: gasPrice,
                },
                this.privateKeyString
            )
            return await this.client.eth.sendSignedTransaction(
                signedTx.rawTransaction
            )
        }
    }
}

module.exports = {
    ContractUtils
}
