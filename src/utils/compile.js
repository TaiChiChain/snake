const solc = require('solc')
const fs = require('fs')
const contract = require('./contracts');
const { log } = require('console');


function compile(fileName, contractName) {
    // Read the Solidity source code from the file system
    const contractPath = contract.contractDir + fileName;
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
    for (let contract in compiledCode.contracts[contractName]) {
        // Get the bytecode from the compiled contract
        console.log(`Contract ${contract} Bytecode:\n`,
            compiledCode.contracts[contractName][contract].evm.bytecode.object);
        // Get the ABI from the compiled contract
        console.log(`Contract ${contract} ABI:\n`,
            compiledCode.contracts[contractName][contract].abi);
    }
    return compiledCode
}

module.exports = {
    compile,
}