import {test, expect} from '@jest/globals'
import * as fs from 'fs'
import {ethers} from '@axiomesh/axiom'
import {ST_ACCOUNT_5} from '../../utils/accounts_static'
import {ST_CONTRACT_DIR} from '../../utils/contracts_static'
import {
    deploy_contract,
    newProvider,
    request,
    transferAXM
} from '../../utils/rpc'
import {hexStringToString, waitAsync} from '../../utils/util'

describe('TestCases of Historical Status API', () => {
    const provider = newProvider()
    const wallet = new ethers.Wallet(ST_ACCOUNT_5.privateKey, provider)

    describe('test Debug_TraceTransaction', () => {
        test('debug_traceTransaction', async () => {
            console.log('Prepare some transactions first')
            var ccAddress = await deploy_contract(wallet, 'ERC20/ERC20')

            const abi = fs.readFileSync(
                ST_CONTRACT_DIR + 'ERC20/ERC20.abi',
                'utf8'
            )
            const erc20_contract = new ethers.Contract(ccAddress, abi, wallet)
            //console.log('Mint 1000000000 TAXM at :', ST_ACCOUNT_5.address)
            const createReceipt = await erc20_contract.mint(1000000000000)
            await createReceipt.wait()
            const txHash = createReceipt.hash
            //console.log('Tx successful with hash:', txHash)

            const res = await request('debug_traceTransaction', [
                txHash,
                {
                    tracer: 'prestateTracer'
                }
            ])
            //console.log('rpc post normal', '===', JSON.stringify(res.result))
            expect(res.result).not.toBeNull
            expect(JSON.stringify(res.result)).toMatch('code')

            const res1 = await request('debug_traceTransaction', [
                txHash,
                {
                    tracer: 'callTracer'
                }
            ])
            //console.log('rpc post normal', '===', JSON.stringify(res1.result))
            expect(res1.result).not.toBeNull
            expect(JSON.stringify(res1.result)).toMatch('CALL')

            const res2 = await request('debug_traceTransaction', [
                '0x9d76ccabab9251a978885ad8e2a7eee51a700f8ca2d07b3b9a5e84f24c881234',
                {
                    tracer: 'prestateTracer'
                }
            ])
            // console.log('rpc post abnormal', '===', res2)
            expect(res2.result).toBeNull

            const res3 = await request('debug_traceTransaction', [
                '0x9d76ccabab9251a978885ad8e2a7eee51a700f8ca2d07b3b9a5e84f24c881234',
                {
                    tracer: 'callTracer'
                }
            ])
            //console.log('rpc post abnormal', '===', res3)
            expect(res3.result).toBeNull

            try {
                await request('debug_traceTransaction', [
                    '0x1234',
                    {
                        tracer: 'prestateTracer'
                    }
                ])
            } catch (error) {
                expect(JSON.stringify(error)).toMatch('invalid argument')
            }

            try {
                await request('debug_traceTransaction', [
                    '0x1234',
                    {
                        tracer: 'callTracer'
                    }
                ])
            } catch (error) {
                expect(JSON.stringify(error)).toMatch('invalid argument')
            }
        })
    })

    describe('test getBalance', () => {
        beforeAll(async () => {
            console.log('Prepare some transactions first')
            for (var i = 0; i < 2; i++) {
                let wallet_random = ethers.Wallet.createRandom()
                let addressTo = await wallet_random.getAddress()
                let nonce = await provider.getTransactionCount(
                    ST_ACCOUNT_5.address
                )
                await transferAXM(wallet, addressTo, nonce, '0.1')
                nonce = nonce + 1
            }
        })
        test('eth_getBalance with http', async () => {
            let res_earliest = await request('eth_getBalance', [
                ST_ACCOUNT_5.address,
                'earliest'
            ])
            expect(parseInt(res_earliest.result, 16)).toEqual(1e27)

            let res_latest = await request('eth_getBalance', [
                ST_ACCOUNT_5.address,
                'latest'
            ])
            expect(parseInt(res_latest.result, 16)).toBeLessThan(1e27)

            let res_specify = await request('eth_getBalance', [
                ST_ACCOUNT_5.address,
                '0x2'
            ])
            expect(parseInt(res_specify.result, 16)).toBeLessThan(1e27)
            expect(parseInt(res_specify.result, 16)).toBeGreaterThanOrEqual(
                parseInt(res_latest.result, 16)
            )
        })

        test('eth_getBalance with axiom.js', async () => {
            //let res_earliest = await provider.getBalance(
            //    ST_ACCOUNT_5.address,
            //    'earliest'
            //)
            //expect(res_earliest).toEqual(1e27)

            let res_latest = await provider.getBalance(
                ST_ACCOUNT_5.address,
                'latest'
            )
            expect(res_latest).toBeLessThan(1e27)

            let res_pending = await provider.getBalance(
                ST_ACCOUNT_5.address,
                'pending'
            )
            expect(res_pending).toBeLessThan(1e27)

            const wallet_random = ethers.Wallet.createRandom()
            const address = await wallet_random.getAddress()
            res_latest = await provider.getBalance(address, 'latest')
            expect(res_latest).toBe(BigInt(0))
            res_latest = await provider.getBalance(address, 'pending')
            expect(res_latest).toBe(BigInt(0))
        })
    })

    describe('test GetTransactionCount', () => {
        test('eth_getTransactionCount', async () => {
            let res_earliest = await request('eth_getTransactionCount', [
                ST_ACCOUNT_5.address,
                'earliest'
            ])
            //console.log('res_earliest:', '===', res_earliest)
            expect(parseInt(res_earliest.result, 16)).toEqual(0)

            let res_latest = await request('eth_getTransactionCount', [
                ST_ACCOUNT_5.address,
                'latest'
            ])
            let nonce = await provider.getTransactionCount(ST_ACCOUNT_5.address)
            //console.log('res_latest:', '===', res_latest)
            expect(parseInt(res_latest.result, 16)).toEqual(nonce)

            let res_specify = await request('eth_getTransactionCount', [
                ST_ACCOUNT_5.address,
                '0x2'
            ])
            //console.log('res_specify:', '===', res_specify)
            expect(parseInt(res_specify.result, 16)).toBeLessThan(2)
        })

        test('eth_getTransactionCount with error params', async () => {
            let res_specify = await request('eth_getTransactionCount', [
                ST_ACCOUNT_5.address,
                '0x554c'
            ])
            expect(JSON.stringify(res_specify)).toMatch('not found in DB')

            res_specify = await request('eth_getTransactionCount', [
                ST_ACCOUNT_5.address,
                '0x0'
            ])
            expect(JSON.stringify(res_specify)).toMatch('out of bounds')

            res_specify = await request('eth_getTransactionCount', [
                ST_ACCOUNT_5.address,
                '1'
            ])
            expect(JSON.stringify(res_specify)).toMatch('invalid argument')
        })
    })

    describe('test eth_call', () => {
        test('invoke method with eth_call and eth_sendRawTransaction', async () => {
            let ccAddress = await deploy_contract(wallet, 'Storage/storage')
            const abi = fs.readFileSync(
                ST_CONTRACT_DIR + 'Storage/storage.abi',
                'utf8'
            )
            const storage_contract = new ethers.Contract(
                ccAddress,
                abi,
                provider
            )
            let encodedParams = storage_contract.interface.encodeFunctionData(
                'retrieve',
                [
                    '0x7b00000000000000000000000000000000000000000000000000000000000000'
                ]
            )
            let res = await request('eth_call', [
                {to: ccAddress, data: encodedParams},
                'latest'
            ])
            expect(JSON.stringify(res.result)).toMatch(
                '0x0000000000000000000000000000000000000000000000000000000000000000'
            )

            let encodedParams_set =
                storage_contract.interface.encodeFunctionData('store', [
                    '0x7b00000000000000000000000000000000000000000000000000000000000000',
                    '0x1c90000000000000000000000000000000000000000000000000000000000000'
                ])
            const tx = {
                to: ccAddress,
                data: encodedParams_set,
                nonce: await provider.getTransactionCount(ST_ACCOUNT_5.address),
                chainId: '0x54c',
                gasPrice: 10000000000000,
                gasLimit: 200000
            }
            const singnedTx = await wallet.signTransaction(tx)
            res = await request('eth_sendRawTransaction', [singnedTx])
            expect(res.result).not.toBeNull()
            //sleep 3s
            await waitAsync(3000)
            res = await request('eth_call', [
                {to: ccAddress, data: encodedParams},
                'latest'
            ])
            expect(JSON.stringify(res.result)).toMatch(
                '0x1c90000000000000000000000000000000000000000000000000000000000000'
            )

            let blockNum = await provider.getBlockNumber()
            let block = (blockNum - 1).toString(16)

            res = await request('eth_call', [
                {to: ccAddress, data: encodedParams},
                '0x' + block
            ])
            //console.log('res is :', res)
            expect(JSON.stringify(res.result)).toMatch(
                '0x0000000000000000000000000000000000000000000000000000000000000000'
            )

            res = await request('eth_call', [
                {to: ccAddress, data: encodedParams},
                'earliest'
            ])
            expect(JSON.stringify(res.result)).toMatch('0x')
        })
    })

    describe('test eth_estimateGas', () => {
        test('invoke contract with eth_estimateGas', async () => {
            var ccAddress = await deploy_contract(wallet, 'Storage/storage')
            expect(ccAddress).not.toBeNull()
            const abi = fs.readFileSync(
                ST_CONTRACT_DIR + 'Storage/storage.abi',
                'utf8'
            )
            const storage_contract = new ethers.Contract(
                ccAddress,
                abi,
                provider
            )
            let encodedParams = storage_contract.interface.encodeFunctionData(
                'retrieve',
                [
                    '0x7b00000000000000000000000000000000000000000000000000000000000000'
                ]
            )

            let encodedParams_set =
                storage_contract.interface.encodeFunctionData('store', [
                    '0x7b00000000000000000000000000000000000000000000000000000000000000',
                    '0x1c90000000000000000000000000000000000000000000000000000000000000'
                ])

            let res = await request('eth_estimateGas', [
                {to: ccAddress, data: encodedParams},
                'earliest'
            ])
            //console.log('earliest res is: ', res)
            expect(res.result).toMatch('0x52d4')

            res = await request('eth_estimateGas', [
                {to: ccAddress, data: encodedParams},
                'latest'
            ])
            //console.log('latest res is: ', res)
            expect(res.result).toMatch('0x5dc6')

            res = await request('eth_estimateGas', [
                {to: ccAddress, data: encodedParams_set},
                'earliest'
            ])
            //console.log('latest set res is: ', res)
            expect(res.result).toMatch('0x5360')

            res = await request('eth_estimateGas', [
                {to: ccAddress, data: encodedParams_set},
                'latest'
            ])
            //console.log('latest set res is: ', res)
            expect(res.result).toMatch('0xac3d')

            let blockNum = await provider.getBlockNumber()
            let block = (blockNum - 2).toString(16)

            res = await request('eth_estimateGas', [
                {to: ccAddress, data: encodedParams},
                '0x' + block
            ])
            expect(res.result).toMatch('0x52d4')
        })

        test('tranfer with eth_estimateGas', async () => {
            let res = await request('eth_estimateGas', [
                {
                    from: ST_ACCOUNT_5.address,
                    to: '0xE55Db6E6743111F35F18af34E8331AB1E27214de',
                    value: '0x100'
                },
                'earliest'
            ])
            expect(res.result).toMatch('0x5208')

            res = await request('eth_estimateGas', [
                {
                    from: ST_ACCOUNT_5.address,
                    to: '0xE55Db6E6743111F35F18af34E8331AB1E27214de',
                    value: '0x100'
                },
                'latest'
            ])
            // 0x5208 is 21000
            expect(res.result).toMatch('0x5208')
        })
    })

    describe('test eth_getCode', () => {
        test('getCode of EOA account', async () => {
            let res = await request('eth_getCode', [
                ST_ACCOUNT_5.address,
                'earliest'
            ])

            //console.log('res is: ', res)
            expect(JSON.stringify(res.result)).toMatch('0x')

            res = await request('eth_getCode', [ST_ACCOUNT_5.address, 'latest'])

            //console.log('res is: ', res)
            expect(JSON.stringify(res.result)).toMatch('0x')
        })

        test('getStorageAt of contract address', async () => {
            let ccAddress = await deploy_contract(wallet, 'Storage/storage')
            expect(ccAddress).not.toBeNull()

            let res = await request('eth_getCode', [ccAddress, 'latest'])
            expect(JSON.stringify(res.result)).toMatch('0x60806040')

            res = await request('eth_getCode', [ccAddress, 'earliest'])
            expect(JSON.stringify(res.result)).not.toMatch('0x60806040')

            let blockNum = await provider.getBlockNumber()
            let block = (blockNum - 1).toString(16)
            res = await request('eth_getCode', [ccAddress, '0x' + block])
            //console.log('res is: ', res)
            expect(JSON.stringify(res.result)).not.toMatch('0x60806040')
        })
    })

    describe('test eth_getStorageAt', () => {
        test('getStorageAt with EOA account', async () => {
            let res = await request('eth_getStorageAt', [
                ST_ACCOUNT_5.address,
                '0x0',
                'earliest'
            ])

            //console.log('res is: ', res)
            expect(JSON.stringify(res.result)).toMatch('0x')

            res = await request('eth_getStorageAt', [
                ST_ACCOUNT_5.address,
                '0x0',
                'latest'
            ])

            //console.log('res is: ', res)
            expect(JSON.stringify(res.result)).toMatch('0x')
        })

        test('getStorageAt with contract address', async () => {
            let ccAddress = await deploy_contract(wallet, 'Storage/storage')
            //console.log(ccAddress)
            const abi = fs.readFileSync(
                ST_CONTRACT_DIR + 'Storage/storage.abi',
                'utf8'
            )
            const storage_contract = new ethers.Contract(
                ccAddress,
                abi,
                provider
            )

            let encodedParams = storage_contract.interface.encodeFunctionData(
                'retrieve',
                [
                    '0x7b00000000000000000000000000000000000000000000000000000000000000'
                ]
            )

            let encodedParams_set =
                storage_contract.interface.encodeFunctionData('store', [
                    '0x7b00000000000000000000000000000000000000000000000000000000000000',
                    '0x1c90000000000000000000000000000000000000000000000000000000000000'
                ])
            const tx = {
                to: ccAddress,
                data: encodedParams_set,
                nonce: await provider.getTransactionCount(ST_ACCOUNT_5.address),
                chainId: '0x54c',
                gasPrice: 10000000000000,
                gasLimit: 200000
            }
            const singnedTx = await wallet.signTransaction(tx)
            let res = await request('eth_sendRawTransaction', [singnedTx])
            //console.log('res is :', res)
            expect(res.result).not.toBeNull()
            //sleep 3s
            await waitAsync(3000)

            res = await request('eth_call', [
                {to: ccAddress, data: encodedParams},
                'latest'
            ])
            expect(JSON.stringify(res.result)).toMatch(
                '0x1c90000000000000000000000000000000000000000000000000000000000000'
            )

            res = await request('eth_getStorageAt', [
                ccAddress,
                '0x7b00000000000000000000000000000000000000000000000000000000000000',
                'latest'
            ])
            expect(JSON.stringify(res.result)).toMatch('0x')
        })
    })
})
