import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {ST_ADMIN_4} from '../../utils/accounts_static'
import {provider, request, transferAXM} from '../../utils/rpc'

//The first column of the cases element is the call input parameter
//The second column of the cases elements is the result expected to be returned

describe('TestCases of Transaction API', () => {
    const wallet = new ethers.Wallet(ST_ADMIN_4.privateKey, provider)

    beforeAll(async () => {
        console.log('Prepare some transactions first')
        for (var i = 0; i < 1; i++) {
            let wallet_random = ethers.Wallet.createRandom()
            let addressTo = await wallet_random.getAddress()
            let nonce = await provider.getTransactionCount(ST_ADMIN_4.address)
            await transferAXM(wallet, addressTo, nonce, '0.1')
            nonce = nonce + 1
        }
    })

    describe('test GetTransactionCount', () => {
        let cases_of_getTransactionCount: any[][] = []
        let cases_of_getTransactionCount_counter: any[][] = []
        cases_of_getTransactionCount = [
            //case list
            [[ST_ADMIN_4.address, 'earliest'], 1],
            [[ST_ADMIN_4.address, 'pending'], 1],
            [[ST_ADMIN_4.address, 'latest'], 1],
            [[ST_ADMIN_4.address], 1],
            [[ST_ADMIN_4.address, '0x2'], 1],
            [['0x320Bdc9DB071aD9B8A9aC6eE71D7C3CAc3217E2d', 'latest'], 0],
            [['0x320Bdc9DB071aD9B8A9aC6eE71D7C3CAc3217E2d'], 0]
        ]

        cases_of_getTransactionCount_counter = [
            //case list
            [['earliest'], 'invalid argument'],
            [['pending'], 'invalid argument'],
            [['latest'], 'invalid argument'],
            [[], 'missing value'],
            [['0x1234', 'latest'], 'invalid argument']
        ]
        const len = cases_of_getTransactionCount.length
        const len2 = cases_of_getTransactionCount_counter.length
        test('eth_getTransactionCount', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_getTransactionCount[i]) {
                    var res = await request(
                        'eth_getTransactionCount',
                        cases_of_getTransactionCount[i][0]
                    )
                    //console.log('rpc post normal', i, '===', res)
                    expect(BigInt(res.result)).toBeGreaterThanOrEqual(
                        cases_of_getTransactionCount[i][1]
                    )
                }
            }
        })

        test('eth_getTransactionCount with error params', async () => {
            for (var i = 0; i < len2; i++) {
                if (cases_of_getTransactionCount_counter[i]) {
                    var res = await request(
                        'eth_getTransactionCount',
                        cases_of_getTransactionCount_counter[i][0]
                    )
                    //console.log('rpc post abnormal', i, '===', res)
                    expect(JSON.stringify(res.error)).toMatch(
                        cases_of_getTransactionCount_counter[i][1]
                    )
                }
            }
        })
    })

    describe('test GetBlockTransactionCountByNumber', () => {
        let cases_of_getBlockTransactionCount_byNumber: any[][] = []
        let cases_of_getBlockTransactionCount_byNumber_counter: any[][] = []
        cases_of_getBlockTransactionCount_byNumber = [
            //case list
            [['earliest'], 0],
            [['pending'], 0],
            [['latest'], 0],
            [['0x1'], 0],
            [['0x2'], 0]
        ]
        cases_of_getBlockTransactionCount_byNumber_counter = [
            //case list
            [[], 'missing value'],
            [['late'], 'invalid argument'],
            [['0xF4240'], 'null']
        ]

        const len = cases_of_getBlockTransactionCount_byNumber.length
        const len2 = cases_of_getBlockTransactionCount_byNumber_counter.length
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

        test('eth_getBlockTransactionCountByNumber with error params', async () => {
            for (var i = 0; i < len2; i++) {
                if (cases_of_getBlockTransactionCount_byNumber_counter[i]) {
                    var res = await request(
                        'eth_getBlockTransactionCountByNumber',
                        cases_of_getBlockTransactionCount_byNumber_counter[i][0]
                    )
                    expect(JSON.stringify(res)).toMatch(
                        cases_of_getBlockTransactionCount_byNumber_counter[i][1]
                    )
                }
            }
        })
    })

    describe('test GetBlockTransactionCountByHash', () => {
        test('eth_getBlockTransactionCountByHash', async () => {
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

        test('eth_getBlockTransactionCountByHash with error params', async () => {
            var res = await request('eth_getBlockTransactionCountByHash')
            expect(JSON.stringify(res.error)).toMatch(
                'missing value for required argument 0'
            )

            var res1_1 = await request('eth_getBlockTransactionCountByHash', [
                '0x123456'
            ])
            expect(JSON.stringify(res1_1.error)).toMatch('invalid argument')

            var res1_2 = await request('eth_getBlockTransactionCountByHash', [
                '0xfB041b3D98d317C209d9782e97E873B24f42c3D0C93B24feDA94f6A244e71234'
            ])
            expect(JSON.stringify(res1_2.result)).toMatch('null')
        })
    })

    describe('test GetTransactionByBlockNumberAndIndex', () => {
        let cases_of_getTx_ByBlockNumberAndIndex: any[][] = []
        let cases_of_getTx_ByBlockNumberAndIndex_counter: any[][] = []
        cases_of_getTx_ByBlockNumberAndIndex = [
            //case list
            [['pending', '0x0'], '0x54c'],
            [['latest', '0x0'], '0x54c'],
            [['0x2', '0x0'], '0x2']
        ]

        cases_of_getTx_ByBlockNumberAndIndex_counter = [
            //case list
            [['earliest', '0x0'], 'index beyond block'],
            [['earliest', '0x1'], 'index beyond block'],
            [['earliest'], 'missing value'],
            [['pending'], 'missing value'],
            [['latest'], 'missing value'],
            [[], 'missing value'],
            [['0xF4240', '0x0'], 'out of bounds']
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
                    //console.log('rpc post normal', i, '===', res)
                    expect(JSON.stringify(res.result)).toMatch(
                        cases_of_getTx_ByBlockNumberAndIndex[i][1]
                    )
                }
            }
        })

        test('eth_getTransactionByBlockNumberAndIndex_abnormal', async () => {
            for (var i = 0; i < len2; i++) {
                if (cases_of_getTx_ByBlockNumberAndIndex_counter[i]) {
                    var res = await request(
                        'eth_getTransactionByBlockNumberAndIndex',
                        cases_of_getTx_ByBlockNumberAndIndex_counter[i][0]
                    )
                    //console.log('rpc post abnormal', i, '===', res)
                    expect(JSON.stringify(res.error)).toMatch(
                        cases_of_getTx_ByBlockNumberAndIndex_counter[i][1]
                    )
                }
            }
        })
    })

    describe('test GetTransactionByBlockHashAndIndex', () => {
        test('eth_getTransactionByBlockHashAndIndex_pendingBlock', async () => {
            const pendingBlock = await provider.getBlock('pending', false)
            const pendingBlockHash = pendingBlock?.hash
            var res1 = await request('eth_getTransactionByBlockHashAndIndex', [
                pendingBlockHash,
                '0x0'
            ])
            expect(JSON.stringify(res1.result)).toMatch('0x54c')
            var res1_1 = await request(
                'eth_getTransactionByBlockHashAndIndex',
                [pendingBlockHash]
            )
            expect(JSON.stringify(res1_1.error)).toMatch('missing value')
        })

        test('eth_getTransactionByBlockHashAndIndex_latestBlock', async () => {
            const latestBlock = await provider.getBlock('latest', false)
            const latestBlockHash = latestBlock?.hash
            var res2 = await request('eth_getTransactionByBlockHashAndIndex', [
                latestBlockHash,
                '0x0'
            ])
            expect(JSON.stringify(res2.result)).toMatch('0x54c')

            var res2_1 = await request(
                'eth_getTransactionByBlockHashAndIndex',
                [latestBlockHash]
            )
            expect(JSON.stringify(res2_1.error)).toMatch('missing value')
        })

        test('eth_getTransactionByBlockHashAndIndex_earliestBlock', async () => {
            const earliestBlock = await provider.getBlock('earliest', false)
            const earliestBlockHash = earliestBlock?.hash
            var res3 = await request('eth_getTransactionByBlockHashAndIndex', [
                earliestBlockHash,
                '0x0'
            ])
            expect(JSON.stringify(res3.error)).toMatch('index beyond block')

            var res3_1 = await request(
                'eth_getTransactionByBlockHashAndIndex',
                [earliestBlockHash, '0x1']
            )
            expect(JSON.stringify(res3_1.error)).toMatch('index beyond block')

            var res3_2 = await request(
                'eth_getTransactionByBlockHashAndIndex',
                [earliestBlockHash]
            )
            expect(JSON.stringify(res3_2.error)).toMatch('missing value')
        })

        test('eth_getTransactionByBlockHashAndIndex with error params', async () => {
            var res4 = await request(
                'eth_getTransactionByBlockHashAndIndex',
                []
            )
            expect(JSON.stringify(res4.error)).toMatch('missing value')

            var res4_1 = await request(
                'eth_getTransactionByBlockHashAndIndex',
                [
                    '0xF5Abf88ecA668507FbF7D65Ef76bebCB30fb4354943682D8a0E97C9dA2275a11',
                    '0x0'
                ]
            )
            expect(JSON.stringify(res4_1.error)).toMatch('not found in DB')

            var res4_2 = await request(
                'eth_getTransactionByBlockHashAndIndex',
                [
                    '0xF5Abf88ecA668507FbF7D65Ef76bebCB30fb4354943682D8a0E97C9dA2275a11'
                ]
            )
            expect(JSON.stringify(res4_2.error)).toMatch('missing value')

            var res4_3 = await request(
                'eth_getTransactionByBlockHashAndIndex',
                ['0x123456']
            )
            expect(JSON.stringify(res4_3.error)).toMatch('invalid argument')
        })
    })

    describe('test GetTransactionByHash', () => {
        test('eth_getTransactionByHash', async () => {
            let wallet_random = ethers.Wallet.createRandom()
            let addressTo = await wallet_random.getAddress()
            let nonce = await provider.getTransactionCount(ST_ADMIN_4.address)
            const response = await transferAXM(wallet, addressTo, nonce, '0.1')
            var res1 = await provider.getTransaction(response.hash)
            expect(res1?.from).toBe(ST_ADMIN_4.address)

            // try http-post
            var res1_1 = await request('eth_getTransactionByHash', [
                response.hash
            ])

            expect(JSON.stringify(res1_1?.result.from)).toMatch(
                ST_ADMIN_4.address.toLowerCase()
            )

            var res1_2 = await request('eth_getTransactionByHash', [
                '0x04307b5f0882c6665a847b87bba2ea65e002dc7e0fcc62dfba49c4c7b7f11234'
            ])
            expect(JSON.stringify(res1_2?.result)).toMatch('null')
        })

        test('eth_getTransactionByHash with error params', async () => {
            var res2 = await request('eth_getTransactionByHash', ['0x123456'])
            expect(JSON.stringify(res2?.error)).toMatch('invalid argument')

            var res2_1 = await request('eth_getTransactionByHash', [])
            expect(JSON.stringify(res2_1?.error)).toMatch('missing value')

            var res2_2 = await request('eth_getTransactionByHash')
            expect(JSON.stringify(res2_2?.error)).toMatch('missing value')
        })
    })

    describe('test GetTransactionReceipt', () => {
        test('eth_getTransactionReceipt', async () => {
            let wallet_random = ethers.Wallet.createRandom()
            let addressTo = await wallet_random.getAddress()
            let nonce = await provider.getTransactionCount(ST_ADMIN_4.address)
            const response = await transferAXM(wallet, addressTo, nonce, '0.1')
            var res1 = await provider.getTransactionReceipt(response.hash)
            expect(res1?.from).toBe(ST_ADMIN_4.address)

            // try http-post
            var res1_1 = await request('eth_getTransactionReceipt', [
                response.hash
            ])
            expect(JSON.stringify(res1_1?.result.from)).toMatch(
                ST_ADMIN_4.address.toLowerCase()
            )

            var res1_2 = await request('eth_getTransactionReceipt', [
                '0x04307b5f0882c6665a847b87bba2ea65e002dc7e0fcc62dfba49c4c7b7f11234'
            ])
            expect(JSON.stringify(res1_2?.result)).toMatch('null')
        })

        test('eth_getTransactionReceipt with error params', async () => {
            var res2 = await request('eth_getTransactionReceipt', ['0x123456'])
            expect(JSON.stringify(res2?.error)).toMatch('invalid argument')

            var res2_1 = await request('eth_getTransactionReceipt', [])
            expect(JSON.stringify(res2_1?.error)).toMatch('missing value')

            var res2_2 = await request('eth_getTransactionReceipt')
            expect(JSON.stringify(res2_2?.error)).toMatch('missing value')
        })
    })
})
