const solc = require('solc')
const fs = require('fs')
const contract = require('./contracts')


function compile(fileName, contractName) {
    // Read the Solidity source code from the file system
    const contractPath = contract.contractDir + fileName
    const sourceCode = fs.readFileSync(contractPath, 'utf8');
    // solc compiler config
    const input = {
        language: 'Solidity',
        sources: {
            [contractName]: {
                content: sourceCode,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };
    // Compile the Solidity code using solc
    const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));
    // Get the bytecode from the compiled contract
    const bytecode = compiledCode.contracts[contractName][contractName].evm.bytecode.object;
    console.log('Contract Bytecode:\n', bytecode);
    // Get the ABI from the compiled contract
    const abi = compiledCode.contracts[contractName][contractName].abi;
    console.log('Contract ABI:\n', abi);
    return compiledCode
}

module.exports = {
    compile,
}