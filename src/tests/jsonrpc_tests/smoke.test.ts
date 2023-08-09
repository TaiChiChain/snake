import { test, expect } from '@jest/globals'
import { request, deploy_storage_contract, client } from '../../utils/rpc'

//The first column of the cases element is the call input parameter
//The second column of the cases elements is the result expected to be returned

describe('test_getChainId', () => {
    var cases_of_getChainId: any[][] = []
    cases_of_getChainId = [
        //case1 : Verify the default chainId is 1356
        [" ", 1356],
    ];
    test('eth_chainId', async () => {
        const res = await request("eth_chainId")
        console.log('rpc post eth_chainId', res.result)
        expect(parseInt(res.result, 16)).toBe(cases_of_getChainId[0][1])
    })
})

describe('test_getBlockNumber', () => {
    var cases_of_getBlockNumber: any[][] = []
    cases_of_getBlockNumber = [
        //case1 : Verify the blocknumber must be greater than or equal to 1
        [" ", 1],
    ];
    test('eth_blockNumber', async () => {
        const res = await request("eth_blockNumber")
        console.log('rpc post eth_blockNumber', res.result)
        expect(parseInt(res.result, 16)).toBeGreaterThanOrEqual(cases_of_getBlockNumber[0][1])
    })
})

describe('test_getBalance', () => {
    var cases_of_getBalance: any[][] = []
    cases_of_getBalance = [
        //case1 : Verify the genesis admin latest balance is greater than or equal to 10000
        [["0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8", "latest"], 10000],
        //case2 : Verify the new account latest balance is greater than or equal to 0    
        [["0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff", "latest"], 0],
        //case3 : Verify the genesis admin pending balance is greater than or equal to 10000
        [["0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8", "pending"], 10000],
        //case2 : Verify the new account pending balance is greater than or equal to 0    
        [["0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff", "pending"], 0],
    ];
    const len = cases_of_getBalance.length
    test('eth_getBalance', async () => {
        for (var i = 0; i < len; i++) {
            if (cases_of_getBalance[i]) {
                var res = await request("eth_getBalance", cases_of_getBalance[i][0])
                console.log('rpc post eth_getBalance', res.result)
                expect(parseInt(res.result, 16)).toBeGreaterThanOrEqual(cases_of_getBalance[i][1])
            }
        }
    })
})

describe('test_getBlockByNumber', () => {
    var cases_of_getBlock_with_transactions: any[][] = []
    var cases_of_getBlock_without_transactions: any[][] = []
    cases_of_getBlock_with_transactions = [
        //case1 : Verify the recipet of getBlock_with_transactions include txs
        [["latest", true], [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
        //case2 : Verify the recipet of getBlock_with_transactions include txs   
        [["pending", true], [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
    ];
    cases_of_getBlock_without_transactions = [
        //case1 : Verify the recipet of getBlock_with_transactions include txs
        [["latest", false], [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
        //case2 : Verify the recipet of getBlock_with_transactions include txs    
        [["pending", false], [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
        //case3 : Verify the recipet of getBlock_without_transactions not include txs   
        [["earliest", false], [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],

    ];
    const len = [cases_of_getBlock_with_transactions.length, cases_of_getBlock_without_transactions.length]

    it('prepare transaction data first', async () => {
        const address = await deploy_storage_contract()
        console.log('Deploy contract address is : ', address)
        expect(address).not.toBeNull()
    });
    test('eth_getBlockByNumber_with_transactions', async () => {
        for (var i = 0; i < len[0]; i++) {
            if (cases_of_getBlock_with_transactions[i]) {
                var res = await request("eth_getBlockByNumber", cases_of_getBlock_with_transactions[i][0])
                //console.log('rpc post eth_getBlockByNumber', res.result)
                expect(res.result.transactions).toMatchObject(cases_of_getBlock_with_transactions[i][1])
            }
        }
    })

    test('eth_getBlockByNumber_without_transactions', async () => {
        for (var i = 0; i < len[1]; i++) {
            if (cases_of_getBlock_without_transactions[i]) {
                var res = await request("eth_getBlockByNumber", cases_of_getBlock_without_transactions[i][0])
                //console.log('rpc post eth_getBlockByNumber', res.result)
                expect(res.result.transactions).not.toMatchObject(cases_of_getBlock_without_transactions[i][1])
            }
        }
    })
})

describe('test_getBlockByHash', () => {
    var cases_of_getBlock_with_transactions: any[][] = []
    var cases_of_getBlock_without_transactions: any[][] = []
    cases_of_getBlock_with_transactions = [
        //case1 : Verify the recipet of getBlock_with_transactions include txs
        ["latest", [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
        //case2 : Verify the recipet of getBlock_with_transactions include txs   
        ["pending", [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
    ];
    cases_of_getBlock_without_transactions = [
        //case1 : Verify the recipet of getBlock_without_transactions not include txs
        ["latest", [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
        //case2 : Verify the recipet of getBlock_without_transactions not include txs
        ["pending", [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
        //case3 : Verify the recipet of getBlock_without_transactions not include txs
        ["earliest", [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
        //case4 : Verify the recipet of getBlock_without_transactions not include txs   
        [1, [{ from: '0xc7f999b83af6df9e67d0a37ee7e900bf38b3d013' }]],
    ];
    const len = [cases_of_getBlock_with_transactions.length, cases_of_getBlock_without_transactions.length]

    it('prepare transaction data first', async () => {
        const address = await deploy_storage_contract()
        console.log('Deploy contract address is : ', address)
        expect(address).not.toBeNull()
    });
    test('eth_getBlockByHash_with_transactions', async () => {
        for (var i = 0; i < len[0]; i++) {
            if (cases_of_getBlock_with_transactions[i]) {
                const block_hash = (await client.eth.getBlock(cases_of_getBlock_with_transactions[i][0], true)).hash
                var res = await request("eth_getBlockByHash", [block_hash, true])
                console.log('rpc post eth_getBlockByHash === index: ', i, res.result)
                expect(res.result.transactions).toMatchObject(cases_of_getBlock_with_transactions[i][1])
            }
        }
    })
    test('eth_getBlockByHash_without_transactions', async () => {
        for (var i = 0; i < len[1]; i++) {
            if (cases_of_getBlock_without_transactions[i]) {
                const block_hash = (await client.eth.getBlock(cases_of_getBlock_without_transactions[i][0], false)).hash
                var res = await request("eth_getBlockByHash", [block_hash, false])
                console.log('rpc post eth_getBlockByHash === index: ', i, res.result)
                expect(res.result.transactions).not.toMatchObject(cases_of_getBlock_without_transactions[i][1])
            }
        }
    })
})

describe('test_getCode', () => {
    var cases_of_getCode: any[][] = []
    cases_of_getCode = [
        //case1 : Verify the genesis admin latest code
        [["0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013", "latest"], "0"],
        //case2 : Verify the new account latest code   
        [["0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff", "latest"], "0"],
        //case3 : Verify the genesis admin pending code
        [["0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013", "pending"], "0"],
        //case4 : Verify the genesis admin earliest code    
        [["0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013", "earliest"], "0"],
    ];

    const len = cases_of_getCode.length
    test('eth_getCode', async () => {
        for (var i = 0; i < len; i++) {
            if (cases_of_getCode[i]) {
                var res = await request("eth_getCode", cases_of_getCode[i][0])
                console.log('rpc post eth_getCode === index: ', i, res.result)
                expect(String(res.result)).toMatch(cases_of_getCode[i][1])
            }
        }
    })
    test('eth_getCode_of_contract', async () => {
        //deploy sample contract first
        const address = await deploy_storage_contract()
        console.log('Deploy contract address is : ', address)
        expect(address).not.toBeNull()
        var res = await request("eth_getCode", [address, "latest"])
        console.log('rpc post eth_getCode of contract ', res.result)
        expect(String(res.result)).toMatch("0x6080604052")
    })
})

describe('test_getStorageAt', () => {
    var cases_of_getStorageAt: any[][] = []
    cases_of_getStorageAt = [
        //case1 : Verify the genesis admin latest code
        [["0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013", "latest"], "0"],
        //case2 : Verify the new account latest code   
        [["0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff", "latest"], "0"],
        //case3 : Verify the genesis admin pending code
        [["0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013", "pending"], "0"],
        //case4 : Verify the genesis admin earliest code    
        [["0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013", "earliest"], "0"],
    ];

    const len = cases_of_getStorageAt.length
    test('eth_getStorageAt', async () => {
        for (var i = 0; i < len; i++) {
            if (cases_of_getStorageAt[i]) {
                var res = await request("eth_getStorageAt", cases_of_getStorageAt[i][0])
                console.log('rpc post eth_getStorageAt === index: ', i, res.result)
                expect(String(res.result)).toMatch(cases_of_getStorageAt[i][1])
            }
        }
    })
    test('eth_getStorageAt_of_contract', async () => {
        //deploy sample contract first
        const address = await deploy_storage_contract()
        console.log('Deploy contract address is : ', address)
        expect(address).not.toBeNull()
        var res = await request("eth_getStorageAt", [address, "latest"])
        console.log('rpc post eth_getStorageAt of contract ', res.result)
        //expect(String(res.result)).toMatch("0x6080604052")
    })
})
