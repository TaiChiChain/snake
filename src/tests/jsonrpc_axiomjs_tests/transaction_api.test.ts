import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {
    newProvider,
    newWallet,
    request,
    transferAXM,
    ST_ADDRESS
} from '../../utils/rpc'

describe('TestCases of Transaction API', () => {
    const provider = newProvider()
    const wallet = newWallet(provider)

    beforeAll(async () => {
        console.log('Prepare some transactions first')
        for (var i = 0; i < 1; i++) {
            let wallet_random = ethers.Wallet.createRandom()
            let addressTo = await wallet_random.getAddress()
            let nonce = await provider.getTransactionCount(ST_ADDRESS)
            await transferAXM(wallet, addressTo, nonce, '0.1')
            nonce = nonce + 1
        }
    })

    describe('test GetTransactionCount', () => {
        let cases_of_getTransactionCount: any[][] = []
        let cases_of_getTransactionCount_counterexample: any[][] = []
        cases_of_getTransactionCount = [
            //case list
            [[ST_ADDRESS, 'earliest'], 1],
            [[ST_ADDRESS, 'pending'], 1],
            [[ST_ADDRESS, 'latest'], 1],
            [[ST_ADDRESS], 1],
            [[ST_ADDRESS, '0x2'], 1],
            [['0x320Bdc9DB071aD9B8A9aC6eE71D7C3CAc3217E2d', 'latest'], 0],
            [['0x320Bdc9DB071aD9B8A9aC6eE71D7C3CAc3217E2d'], 0]
        ]

        cases_of_getTransactionCount_counterexample = [
            //case list
            [['earliest'], 'invalid argument'],
            [['pending'], 'invalid argument'],
            [['latest'], 'invalid argument'],
            [[], 'missing value'],
            [['0x1234', 'latest'], 'invalid argument']
        ]
        const len = cases_of_getTransactionCount.length
        const len2 = cases_of_getTransactionCount_counterexample.length
        test('eth_getTransactionCount', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_getTransactionCount[i]) {
                    var res = await request(
                        'eth_getTransactionCount',
                        cases_of_getTransactionCount[i][0]
                    )
                    console.log('rpc post normal', i, '===', res)
                    expect(BigInt(res.result)).toBeGreaterThanOrEqual(
                        cases_of_getTransactionCount[i][1]
                    )
                }
            }
        })

        test('eth_getTransactionCount_abnormal', async () => {
            for (var i = 0; i < len2; i++) {
                if (cases_of_getTransactionCount_counterexample[i]) {
                    var res = await request(
                        'eth_getTransactionCount',
                        cases_of_getTransactionCount_counterexample[i][0]
                    )
                    //console.log('rpc post abnormal', i, '===', res)
                    expect(JSON.stringify(res.error)).toMatch(
                        cases_of_getTransactionCount_counterexample[i][1]
                    )
                }
            }
        })
    })

    describe('test GetBlockTransactionCountByNumber', () => {
        let cases_of_getBlockTransactionCount_byNumber: any[][] = []
        cases_of_getBlockTransactionCount_byNumber = [
            //case list
            [['earliest'], 0],
            [['pending'], 0],
            [['latest'], 1],
            [['0x1'], 0],
            [['0x2'], 1]
        ]
        const len = cases_of_getBlockTransactionCount_byNumber.length
        test('eth_getBlockTransactionCountByNumber', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_getBlockTransactionCount_byNumber[i]) {
                    var res = await request(
                        'eth_getBlockTransactionCountByNumber',
                        cases_of_getBlockTransactionCount_byNumber[i][0]
                    )
                    //console.log('rpc post normal', i, '===', res)
                    expect(BigInt(res.result)).toBeGreaterThanOrEqual(
                        cases_of_getBlockTransactionCount_byNumber[i][1]
                    )
                }
            }
        })

        test('eth_getBlockTransactionCountByNumber_abnormal', async () => {
            var res = await request('eth_getBlockTransactionCountByNumber')
            expect(JSON.stringify(res.error)).toMatch(
                'missing value for required argument 0'
            )
        })
    })

    describe('test GetBlockTransactionCountByHash', () => {
        test('eth_getBlockTransactionCountByHash', async () => {
            const provider = newProvider()
            let cases_of_getBlockTransactionCount_byHash: any[][] = []
            let block_earliest = await provider.getBlock('earliest', false)
            let block_pending = await provider.getBlock('pending', false)
            let block_latest = await provider.getBlock('latest', false)
            cases_of_getBlockTransactionCount_byHash = [
                //case list
                [[block_earliest?.hash], 0],
                [[block_pending?.hash], 1],
                [[block_latest?.hash], 1]
            ]
            let len = cases_of_getBlockTransactionCount_byHash.length

            for (var i = 0; i < len; i++) {
                if (cases_of_getBlockTransactionCount_byHash[i]) {
                    var res = await request(
                        'eth_getBlockTransactionCountByHash',
                        cases_of_getBlockTransactionCount_byHash[i][0]
                    )
                    //console.log('rpc post normal', i, '===', res)
                    expect(BigInt(res.result)).toBeGreaterThanOrEqual(
                        cases_of_getBlockTransactionCount_byHash[i][1]
                    )
                }
            }
        })

        test('eth_getBlockTransactionCountByHash_abnormal', async () => {
            var res = await request('eth_getBlockTransactionCountByHash')
            expect(JSON.stringify(res.error)).toMatch(
                'missing value for required argument 0'
            )
        })

        test('eth_getBlockTransactionCountByHash_errHash', async () => {
            var res = await request('eth_getBlockTransactionCountByHash', [
                '0x123456'
            ])
            expect(JSON.stringify(res.error)).toMatch('invalid argument')
        })
    })

    describe('test GetTransactionByBlockNumberAndIndex', () => {
        let cases_of_getTx_ByBlockNumberAndIndex: any[][] = []
        let cases_of_getTx_ByBlockNumberAndIndex_counter: any[][] = []
        cases_of_getTx_ByBlockNumberAndIndex = [
            //case list
            [['pending', '0x0'], 1],
            [['latest', '0x0'], 1],
            [['0x2', '0x0'], 1],
            [['0x2', '0x1'], 1]
        ]

        cases_of_getTx_ByBlockNumberAndIndex_counter = [
            //case list
            [['earliest', '0x0'], 'index beyond block transactions'],
            [['earliest', '0x1'], 'index beyond block transactions'],
            [['earliest'], 'missing value'],
            [['pending'], 'invalid argument'],
            [['latest'], 'invalid argument'],
            [[], 'missing value'],
            ['0xF4240', 'out of bounds']
        ]
        const len = cases_of_getTx_ByBlockNumberAndIndex.length
        const len2 = cases_of_getTx_ByBlockNumberAndIndex_counter.length
        test('eth_getTransactionByBlockNumberAndIndex', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_getTx_ByBlockNumberAndIndex[i]) {
                    var res = await request(
                        'eth_getTransactionByBlockNumberAndIndex',
                        cases_of_getTx_ByBlockNumberAndIndex[i][0]
                    )
                    console.log('rpc post normal', i, '===', res)
                    expect(BigInt(res.result)).toBeGreaterThanOrEqual(
                        cases_of_getTx_ByBlockNumberAndIndex[i][1]
                    )
                }
            }
        })

        test('eth_getTransactionByBlockNumberAndIndex_abnormal', async () => {
            for (var i = 0; i < len2; i++) {
                if (cases_of_getTx_ByBlockNumberAndIndex_counter[i]) {
                    var res = await request(
                        'eth_getTransactionCount',
                        cases_of_getTx_ByBlockNumberAndIndex_counter[i][0]
                    )
                    console.log('rpc post abnormal', i, '===', res)
                    expect(JSON.stringify(res.error)).toMatch(
                        cases_of_getTx_ByBlockNumberAndIndex_counter[i][1]
                    )
                }
            }
        })
    })
})
