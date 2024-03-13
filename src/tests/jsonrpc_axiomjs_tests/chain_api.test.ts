import {test, expect} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import * as fs from 'fs'
import {
    newProvider,
    request,
    transferAXM,
    deploy_contract
} from '../../utils/rpc'
import {stringToUint8Array} from '../../utils/util'
import {ST_CONTRACT_DIR} from '../../utils/contracts_static'
import {ST_ACCOUNT_3} from '../../utils/accounts_static'

//The first column of the cases element is the call input parameter
//The second column of the cases elements is the result expected to be returned

describe('TestCases of BlockChain API', () => {
    const provider = newProvider()
    const wallet = new ethers.Wallet(ST_ACCOUNT_3.privateKey, provider)
    beforeAll(async () => {
        console.log('Prepare some transactions first')
        for (var i = 0; i < 1; i++) {
            let wallet_random = ethers.Wallet.createRandom()
            let addressTo = await wallet_random.getAddress()
            let nonce = await provider.getTransactionCount(ST_ACCOUNT_3.address)
            await transferAXM(wallet, addressTo, nonce, '0.1')
            nonce = nonce + 1
        }
    })

    describe('test getChainId', () => {
        var cases_of_getChainId: any[][] = []
        cases_of_getChainId = [
            //case1 : Verify the default chainId is 1356
            [' ', '0x54c']
        ]
        test('eth_chainId', async () => {
            const res = await request('eth_chainId')
            expect(JSON.stringify(res.result)).toMatch(
                cases_of_getChainId[0][1]
            )
        })
    })

    describe('test getBlockNumber', () => {
        var cases_of_getBlockNumber: any[][] = []
        cases_of_getBlockNumber = [
            //case1 : Verify the blocknumber must be greater than or equal to 1
            [' ', 1]
        ]
        test('eth_blockNumber', async () => {
            const res = await request('eth_blockNumber')
            //console.log('rpc post eth_blockNumber', res.result)
            expect(parseInt(res.result, 16)).toBeGreaterThanOrEqual(
                cases_of_getBlockNumber[0][1]
            )
        })

        test('eth_blockNumber with axiom.js', async () => {
            const res = await provider.getBlockNumber()
            expect(res).toBeGreaterThanOrEqual(1)
        })
    })

    describe('test getBalance', () => {
        var cases_of_getBalance: any[][] = []
        cases_of_getBalance = [
            //case1 : Verify the genesis admin latest balance is greater than or equal to 10000
            [['0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8', 'latest'], 10000],
            //case2 : Verify the new account latest balance is greater than or equal to 0
            [['0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff', 'latest'], 0],
            //case3 : Verify the genesis admin pending balance is greater than or equal to 10000
            [['0xc0Ff2e0b3189132D815b8eb325bE17285AC898f8', 'pending'], 10000],
            //case2 : Verify the new account pending balance is greater than or equal to 0
            [['0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff', 'pending'], 0]
        ]
        const len = cases_of_getBalance.length
        test('eth_getBalance', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_getBalance[i]) {
                    var res = await request(
                        'eth_getBalance',
                        cases_of_getBalance[i][0]
                    )
                    //console.log('rpc post eth_getBalance', res.result)
                    expect(parseInt(res.result, 16)).toBeGreaterThanOrEqual(
                        cases_of_getBalance[i][1]
                    )
                }
            }
        })

        test('eth_getBalance with axiom.js', async () => {
            const res1 = await provider.getBalance(ST_ACCOUNT_3.address)
            expect(res1).toBeGreaterThanOrEqual(1)

            let wallet_random = ethers.Wallet.createRandom()
            let address = await wallet_random.getAddress()
            const res2 = await provider.getBalance(address)
            expect(res2).toBe(BigInt(0))
        })
    })

    describe('test_getBlockByNumber', () => {
        var cases_of_getBlock_with_transactions: any[][] = []
        var cases_of_getBlock_without_transactions: any[][] = []
        cases_of_getBlock_with_transactions = [
            //case1 : Verify the recipet of getBlock_with_transactions include txs
            ['latest', 'transactionIndex'],
            //case2 : Verify the recipet of getBlock_with_transactions include txs
            ['pending', 'transactionIndex']
        ]
        cases_of_getBlock_without_transactions = [
            //case1 : Verify the recipet of getBlock_with_transactions include txs
            ['latest', 'transactionIndex'],
            //case2 : Verify the recipet of getBlock_with_transactions include txs
            ['pending', 'transactionIndex'],
            //case3 : Verify the recipet of getBlock_without_transactions not include txs
            ['earliest', 'transactionIndex']
        ]
        const len = [
            cases_of_getBlock_with_transactions.length,
            cases_of_getBlock_without_transactions.length
        ]

        test('eth_getBlockByNumber_with_transactions', async () => {
            for (var i = 0; i < len[0]; i++) {
                if (cases_of_getBlock_with_transactions[i]) {
                    var res = await request('eth_getBlockByNumber', [
                        cases_of_getBlock_with_transactions[i][0],
                        true
                    ])
                    //console.log('rpc post eth_getBlockByNumber', res.result)
                    expect(JSON.stringify(res.result)).toMatch(
                        cases_of_getBlock_with_transactions[i][1]
                    )
                }
            }
        })

        test('eth_getBlockByNumber_without_transactions', async () => {
            for (var i = 0; i < len[1]; i++) {
                if (cases_of_getBlock_without_transactions[i]) {
                    var res = await request('eth_getBlockByNumber', [
                        cases_of_getBlock_without_transactions[i][0],
                        false
                    ])
                    //console.log('rpc post eth_getBlockByNumber', res.result)
                    expect(JSON.stringify(res.result)).not.toMatch(
                        cases_of_getBlock_without_transactions[i][1]
                    )
                }
            }
        })
    })

    describe('test_getBlockByHash', () => {
        var cases_of_getBlock_with_transactions: any[][] = []
        var cases_of_getBlock_without_transactions: any[][] = []
        cases_of_getBlock_with_transactions = [
            //case1 : Verify the recipet of getBlock_with_transactions include txs
            ['latest', 'transactionIndex'],
            //case2 : Verify the recipet of getBlock_with_transactions include txs
            ['pending', 'transactionIndex']
        ]
        cases_of_getBlock_without_transactions = [
            //case1 : Verify the recipet of getBlock_without_transactions not include txs
            ['latest', 'transactionIndex'],
            //case2 : Verify the recipet of getBlock_without_transactions not include txs
            ['pending', 'transactionIndex'],
            //case3 : Verify the recipet of getBlock_without_transactions not include txs
            ['earliest', 'transactionIndex'],
            //case4 : Verify the recipet of getBlock_without_transactions not include txs
            [1, 'transactionIndex']
        ]
        const len = [
            cases_of_getBlock_with_transactions.length,
            cases_of_getBlock_without_transactions.length
        ]

        test('eth_getBlockByHash_with_transactions', async () => {
            for (var i = 0; i < len[0]; i++) {
                if (cases_of_getBlock_with_transactions[i]) {
                    const block_hash = (
                        await provider.getBlock(
                            cases_of_getBlock_with_transactions[i][0],
                            true
                        )
                    )?.hash
                    var res = await request('eth_getBlockByHash', [
                        block_hash,
                        true
                    ])

                    expect(JSON.stringify(res.result.transactions)).toMatch(
                        cases_of_getBlock_with_transactions[i][1]
                    )
                }
            }
        })
        test('eth_getBlockByHash_without_transactions', async () => {
            for (var i = 0; i < len[1]; i++) {
                if (cases_of_getBlock_without_transactions[i]) {
                    const block_hash = (
                        await provider.getBlock(
                            cases_of_getBlock_without_transactions[i][0],
                            false
                        )
                    )?.hash
                    var res = await request('eth_getBlockByHash', [
                        block_hash,
                        false
                    ])
                    expect(JSON.stringify(res.result.transactions)).not.toMatch(
                        cases_of_getBlock_without_transactions[i][1]
                    )
                }
            }
        })
    })

    describe('test_getCode', () => {
        var cases_of_getCode: any[][] = []
        cases_of_getCode = [
            //case1 : Verify the genesis admin latest code
            [[ST_ACCOUNT_3.address, 'latest'], '0'],
            //case2 : Verify the new account latest code
            [['0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff', 'latest'], '0'],
            //case3 : Verify the genesis admin pending code
            [[ST_ACCOUNT_3.address, 'pending'], '0'],
            //case4 : Verify the genesis admin earliest code
            [[ST_ACCOUNT_3.address, 'earliest'], '0']
        ]

        const len = cases_of_getCode.length
        test('eth_getCode', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_getCode[i]) {
                    var res = await request(
                        'eth_getCode',
                        cases_of_getCode[i][0]
                    )
                    //console.log('rpc post eth_getCode === index: ', i, res.result)
                    expect(String(res.result)).toMatch(cases_of_getCode[i][1])
                }
            }
        })
        test('eth_getCode of contract', async () => {
            //deploy sample contract first
            const address = await deploy_contract(wallet, 'Storage/storage')
            //console.log('Deploy contract address is : ', address)
            expect(address).not.toBeNull()
            var res = await request('eth_getCode', [address, 'latest'])
            //console.log('rpc post eth_getCode of contract ', res.result)
            expect(String(res.result)).toMatch('0x6080604052')
        })

        test('eth_getCode with axiom.js', async () => {
            //deploy sample contract first
            const address = await deploy_contract(wallet, 'Storage/storage')
            //console.log('Deploy contract address is : ', address)
            expect(address).not.toBeNull()
            var res1 = await provider.getCode(address)
            expect(res1).toMatch('0x6080604052')

            var res1 = await provider.getCode(address, 'latest')
            expect(res1).toMatch('0x6080604052')
            try {
                var res2 = await provider.getCode(address, 'aaa')
                expect(res2).toMatch('0x6080604052')
            } catch (error) {
                //console.log(error)
                expect(String(error)).toMatch('invalid blockTag')
            }
        })
    })

    describe('test_getStorageAt', () => {
        var cases_of_getStorageAt: any[][] = []
        cases_of_getStorageAt = [
            //case1 : Verify the genesis admin latest code
            [
                [
                    ST_ACCOUNT_3.address,
                    '0x7b00000000000000000000000000000000000000000000000000000000000000',
                    'latest'
                ],
                '0x'
            ],
            //case2 : Verify the new account latest code
            [
                [
                    '0xC60ba75739b3492189d80c71AD0AEbc0c57695Ff',
                    '0x7b00000000000000000000000000000000000000000000000000000000000000',
                    'latest'
                ],
                '0x'
            ],
            //case3 : Verify the genesis admin pending code
            [
                [
                    ST_ACCOUNT_3.address,
                    '0x7b00000000000000000000000000000000000000000000000000000000000000',
                    'pending'
                ],
                '0x'
            ],
            //case4 : Verify the genesis admin earliest code
            [
                [
                    ST_ACCOUNT_3.address,
                    '0x7b00000000000000000000000000000000000000000000000000000000000000',
                    'earliest'
                ],
                '0x'
            ]
        ]

        const len = cases_of_getStorageAt.length
        test('eth_getStorageAt', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_getStorageAt[i]) {
                    var res = await request(
                        'eth_getStorageAt',
                        cases_of_getStorageAt[i][0]
                    )
                    //console.log('rpc post eth_getStorageAt === index: ', i, res.result)
                    expect(String(res.result)).toMatch(
                        cases_of_getStorageAt[i][1]
                    )
                }
            }
        })

        test('eth_getStorageAt of contract', async () => {
            //deploy sample contract first
            const contractAddress = await deploy_contract(
                wallet,
                'Storage/storage'
            )
            expect(contractAddress).not.toBeNull()

            // invoke storage contract to store data
            const abi = fs.readFileSync(
                ST_CONTRACT_DIR + 'Storage/storage.abi',
                'utf8'
            )
            const storage_contract = new ethers.Contract(
                contractAddress,
                abi,
                wallet
            )
            const receipt = await storage_contract.store(
                '0x7b00000000000000000000000000000000000000000000000000000000000000',
                '0x1c80000000000000000000000000000000000000000000000000000000000000'
            )
            await receipt.wait()

            const key =
                '0x7b00000000000000000000000000000000000000000000000000000000000000'
            const hashedKey = ethers.keccak256(key)
            const index = '0x0'
            const slotIndex = ethers.keccak256(
                stringToUint8Array(hashedKey + index)
            )
            //let newKey =  Web3.utils.sha3(key + index, {"encoding":"hex"})
            //Web3.utils.sha3
            var res = await request('eth_getStorageAt', [
                contractAddress,
                slotIndex,
                'latest'
            ])
            //console.log('rpc post eth_getStorageAt of contract ', res)
            expect(String(res.result)).toMatch('0x')
        })
    })

    describe('test get gasPrice info', () => {
        test('get_gasPrice', async () => {
            let res = await request('eth_gasPrice')
            //console.log(res)
            expect(BigInt(res.result)).toBeGreaterThanOrEqual(
                BigInt(1000000000000)
            )
            expect(BigInt(res.result)).toBeLessThanOrEqual(
                BigInt(10000000000000)
            )
        })
    })
    //eth_feeHistory not support now
    describe('test get feeHistory info', () => {
        test('eth_feeHistory', async () => {
            try {
                await request('eth_feeHistory', [1, 1, []])
            } catch (err) {
                // console.log(err)
                expect(err).toHaveProperty(
                    'message',
                    'Returned error: unsupported interface'
                )
            }
        })
    })

    describe('test get blockchain sync info  ', () => {
        const provider = newProvider()
        test('eth_syncing', async () => {
            const blocknum = await provider.getBlockNumber()
            var res = await request('eth_syncing')
            //console.log(res)
            expect(BigInt(res.result.currentBlock)).toBeLessThanOrEqual(
                BigInt(res.result.highestBlock)
            )
            expect(res.result.startingBlock).toBe('1')
        })
    })
})

describe('test block info contains coinbase address ', () => {
    const provider = newProvider()
    test('eth_getBlock_latest', async () => {
        const latestBlock = await provider.getBlock('latest', true)
        //console.log('The latest block coinbase info is: ', latestBlock?.miner)
        expect(latestBlock?.miner).not.toBeNull
    })

    test('eth_getBlock_earliest', async () => {
        const earliestBlock = await provider.getBlock('earliest', true)
        //console.log('The earliest block coinbase info is: ',earliestBlock?.miner)
        expect(earliestBlock?.miner).not.toBeNull
        expect(earliestBlock?.miner).toBe(
            '0x0000000000000000000000000000000000000000'
        )
    })
})
