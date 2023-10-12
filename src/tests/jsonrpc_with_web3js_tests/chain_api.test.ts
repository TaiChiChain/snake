import {test, expect} from '@jest/globals'
import {newRpcClient} from '../../utils/rpc'
import Web3 from 'web3'

const client1 = new Web3('http://127.0.0.1:8545')

describe('test_getChainId', () => {
    test('get_chainId_normal', async () => {
        const client = newRpcClient()
        const chainId = await client.eth.getChainId()
        //console.log(chainId)
        expect(chainId).toBe(BigInt(1356))
    })
    test('get_chainId_abnormal', async () => {
        try {
            await client1.eth.getChainId()
        } catch (err) {
            //console.log(err)
            expect(String(err)).toMatch('connect ECONNREFUSED')
        }
    })
})

describe('test_getBlockNumber', () => {
    test('get_blockNumber_normal', async () => {
        const client = newRpcClient()
        const blocknum = await client.eth.getBlockNumber()
        console.log(blocknum)
        expect(blocknum).toBeGreaterThanOrEqual(0)
    })

    test('get_blockNumber_abnormal', async () => {
        try {
            await client1.eth.getBlockNumber()
        } catch (err) {
            //console.log(err)
            expect(String(err)).toMatch('connect ECONNREFUSED')
        }
    })
})

describe('test_getBalance', () => {
    test('get_balance_normal_1', async () => {
        const client = newRpcClient()
        const balance = await client.eth.getBalance(
            '0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8'
        )
        console.log(balance)
        expect(balance).toBeGreaterThanOrEqual(0.0)
    })

    test('get_balance_normal_2', async () => {
        const client = newRpcClient()
        const balance = await client.eth.getBalance(
            '0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8',
            'latest'
        )
        console.log(balance)
        expect(balance).toBeGreaterThanOrEqual(0.0)
    })

    test('get_balance_normal_3', async () => {
        const client = newRpcClient()
        const balance = await client.eth.getBalance(
            '0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff',
            'latest'
        )
        console.log(balance)
        expect(balance).toBe(BigInt(0))
        //toBeGreaterThanOrEqual(0.0)
    })

    test('get_balance_normal_4', async () => {
        const client = newRpcClient()
        const balance = await client.eth.getBalance(
            '0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff',
            'pending'
        )
        console.log(balance)
        expect(balance).toBe(BigInt(0))
    })

    test('get_balance_normal_5', async () => {
        const client = newRpcClient()
        const balance = await client.eth.getBalance(
            '0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff'
        )
        //console.log(balance)
        expect(balance).toBe(BigInt(0))
        //toBeGreaterThanOrEqual(0.0)
    })

    test('get_balance_abnormal_1', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBalance('0xC123456')
        } catch (err) {
            console.log(err)
            expect(String(err)).toMatch('Web3 validator found 1 error')
        }
    })

    test('get_balance_abnormal_2', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBalance('0xC123456', 'latest')
        } catch (err) {
            console.log(err)
            expect(String(err)).toMatch('Web3 validator found 1 error')
        }
    })

    test('get_balance_abnormal_3', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBalance(
                '0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8',
                '1'
            )
        } catch (err) {
            console.log(err)
            expect(String(err)).toMatch('invalid argument')
        }
    })
})

describe('test_getBlockByNumber', () => {
    test('getBlockByNumber_normal_1', async () => {
        const client = newRpcClient()
        const blocknum = await client.eth.getBlockNumber()
        const block_transactions = (await client.eth.getBlock(blocknum, true))
            .transactions
        console.log(block_transactions)
        expect(block_transactions).toMatchObject([{blockNumber: blocknum}])
    })

    test('getBlockByNumber_normal_2', async () => {
        const client = newRpcClient()
        const blocknum = await client.eth.getBlockNumber()
        const block = await client.eth.getBlock(blocknum, false)
        //console.log(block)
        expect(block).not.toBeNull()
        expect(block.transactions).not.toMatchObject([{blockNumber: blocknum}])
    })

    test('getBlockByNumber_normal_3', async () => {
        const client = newRpcClient()
        const blocknum = await client.eth.getBlockNumber()
        const block = await client.eth.getBlock(blocknum)
        //console.log(block)
        expect(block.transactions).not.toMatchObject([{blockNumber: blocknum}])
    })

    test('getBlockByNumber_normal_4', async () => {
        const client = newRpcClient()
        const block = await client.eth.getBlock(BigInt(1), true)
        //console.log(block)
        expect(block.number).toBe(BigInt(1))
    })

    test('getBlockByNumber_normal_5', async () => {
        const client = newRpcClient()
        const block = await client.eth.getBlock(BigInt(1), false)
        expect(block.number).toBe(BigInt(1))
    })

    test('getBlockByNumber_abnormal_1', async () => {
        const client = newRpcClient()
        const blocknum = await client.eth.getBlockNumber()
        try {
            await client.eth.getBlock(blocknum + BigInt(1), true)
        } catch (err) {
            expect(String(err)).toMatch('out of bounds')
        }
    })

    test('getBlockByNumber_abnormal_2', async () => {
        const client = newRpcClient()
        const blocknum = await client.eth.getBlockNumber()
        try {
            await client.eth.getBlock(blocknum + BigInt(2), false)
        } catch (err) {
            expect(String(err)).toMatch('out of bounds')
        }
    })

    test('getBlockByNumber_abnormal_3', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock(BigInt(0), true)
        } catch (err) {
            expect(String(err)).toMatch('out of bounds')
        }
    })
    test('getBlockByNumber_abnormal_4', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock(BigInt(-1), true)
        } catch (err) {
            expect(String(err)).toMatch('Web3ValidatorError')
        }
    })

    test('getBlockByNumber_abnormal_5', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock(BigInt('abc'), true)
        } catch (err) {
            expect(String(err)).toMatch('SyntaxError')
        }
    })

    test('getBlockByNumber_abnormal_6', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock(BigInt('1.1'), true)
        } catch (err) {
            expect(String(err)).toMatch('SyntaxError')
        }
    })
})

describe('test_getBlockByHash', () => {
    test('getBlockByHash_normal_1', async () => {
        const client = newRpcClient()
        const blocknum = await client.eth.getBlockNumber()
        const block_hash = (await client.eth.getBlock(blocknum, true)).hash
        const block = await client.eth.getBlock(block_hash, true)
        //console.log(block.hash)
        expect(String(block.hash)).toMatch(String(block_hash))
        expect(block.transactions).toMatchObject([{blockNumber: blocknum}])
    })

    test('getBlockByHash_normal_2', async () => {
        const client = newRpcClient()
        const blocknum = await client.eth.getBlockNumber()
        const block_hash = (await client.eth.getBlock(blocknum, false)).hash
        const block = await client.eth.getBlock(block_hash, false)
        //console.log(block.hash)
        expect(String(block.hash)).toMatch(String(block_hash))
        expect(block.transactions).not.toMatchObject([{blockNumber: blocknum}])
    })

    test('getBlockByHash_normal_3', async () => {
        const client = newRpcClient()
        const blocknum = await client.eth.getBlockNumber()
        const block_hash = (await client.eth.getBlock(blocknum, false)).hash
        const block = await client.eth.getBlock(block_hash, false)
        expect(block.transactions).not.toMatchObject([{blockNumber: blocknum}])
    })

    test('getBlockByHash_normal_4', async () => {
        const client = newRpcClient()
        const block_hash = (await client.eth.getBlock(BigInt(1), true)).hash
        const block = await client.eth.getBlock(block_hash, true)
        expect(block.number).toBe(BigInt(1))
    })

    test('getBlockByHash_normal_5', async () => {
        const client = newRpcClient()
        const block_hash = (await client.eth.getBlock(BigInt(1), true)).hash
        const block = await client.eth.getBlock(block_hash, true)
        expect(block.number).toBe(BigInt(1))
    })

    test('getBlockByHash_abnormal_1', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock(
                '0x12347E65E2Fe5B25E73F83FA2f183955C787C382B6F9c019333A979d12345678',
                true
            )
        } catch (err) {
            console.log(err)
            expect(String(err)).toMatch('not found in DB')
        }
    })

    test('getBlockByHash_abnormal_2', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock(
                '0x12347E65E2Fe5B25E73F83FA2f183955C787C382B6F9c019333A979d12345678',
                false
            )
        } catch (err) {
            expect(String(err)).toMatch('not found in DB')
        }
    })

    test('getBlockByHash_abnormal_3', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock('0x1234', true)
        } catch (err) {
            expect(String(err)).toMatch('not found in DB')
        }
    })
    test('getBlockByHash_abnormal_4', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock('0x1.1', true)
        } catch (err) {
            expect(String(err)).toMatch('Web3ValidatorError')
        }
    })

    test('getBlockByHash_abnormal_5', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock('abc', true)
        } catch (err) {
            expect(String(err)).toMatch('Web3ValidatorError')
        }
    })

    test('getBlockByHash_abnormal_6', async () => {
        const client = newRpcClient()
        try {
            await client.eth.getBlock(BigInt('0x-1'), true)
        } catch (err) {
            expect(String(err)).toMatch('SyntaxError')
        }
    })
})

describe('test_getCode', () => {
    test('getCode_normal_1', async () => {
        const client = newRpcClient()
        const code = await client.eth.getCode(
            '0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013'
        )
        //console.log(code)
        expect(code).toBeDefined()
    })

    test('geTCode_normal_2', async () => {
        const client = newRpcClient()
        const code = await client.eth.getCode(
            '0xE37a3020212448F63487f52A217c56B0e60A0620'
        )
        //console.log(code)
        expect(code).toBeDefined()
    })

    test('geTCode_normal_3', async () => {
        const client = newRpcClient()
        const code = await client.eth.getCode(
            '0x000000000000000000000000000000000000000a'
        )
        console.log(code)
        expect(code).toBeDefined()
    })
})

describe('test_getStorageAt', () => {
    test('getStorageAt_normal_1', async () => {
        const client = newRpcClient()
        const storage = await client.eth.getStorageAt(
            '0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013',
            '1'
        )
        //console.log(storage)
        expect(storage).toBeDefined()
    })

    test('getStorageAt_normal_2', async () => {
        const client = newRpcClient()
        const storage = await client.eth.getStorageAt(
            '0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013',
            '0'
        )
        //console.log(storage)
        expect(storage).toBeDefined()
    })
})
