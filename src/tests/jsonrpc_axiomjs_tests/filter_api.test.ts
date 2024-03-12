import {test, expect} from '@jest/globals'
import {request} from '../../utils/rpc'

describe('TestCases of Filter API', () => {
    describe('test create new filter', () => {
        let cases_of_create_newFilter: any[][] = []
        let cases_of_create_newFilter_counterexample: any[][] = []
        cases_of_create_newFilter = [
            //case0-2 : only fill fromBlock
            [[{fromBlock: '0x1'}], '0x'],
            [[{fromBlock: 'earliest'}], '0x'],
            [[{fromBlock: 'latest'}], '0x'],
            //case3-6 : fill fromBlock and toBlock
            [[{fromBlock: '0x1', toBlock: '0x10'}], '0x'],
            [[{fromBlock: '0x1', toBlock: 'pending'}], '0x'],
            [[{fromBlock: 'pending', toBlock: 'pending'}], '0x'],
            [[{fromBlock: 'earliest', toBlock: 'latest'}], '0x'],
            //case7-9 : Add address parameters
            [
                [
                    {
                        fromBlock: '0x1',
                        toBlock: '0x10',
                        address: '0x0000000000000000000000000000000000001001'
                    }
                ],
                '0x'
            ],
            //case10-12 : Add topics parameters
            [
                [
                    {
                        fromBlock: '0x1',
                        toBlock: 'pending',
                        topics: [
                            '0x2b570ce470e27ef2de4c22e8f2345f2426cea348f782b3d37fc6c6a2c2d3f0e3'
                        ]
                    }
                ],
                '0x'
            ],
            [
                [
                    {
                        fromBlock: '0x1',
                        toBlock: 'latest',
                        address: '0x0000000000000000000000000000000000001001',
                        topics: [
                            '0x2b570ce470e27ef2de4c22e8f2345f2426cea348f782b3d37fc6c6a2c2d3f0e3'
                        ]
                    }
                ],
                '0x'
            ]
        ]
        cases_of_create_newFilter_counterexample = [
            //This array maintenance counterexample is a case of some errors and exceptions
            //case1-4 : Verify only fill fromBlock and toBlock
            [[{fromBlock: '0x2', toBlock: '0x1'}], 'invalid from and to block'],
            [
                [{fromBlock: '0x1', toBlock: 'earliest'}],
                'invalid from and to block'
            ],
            //[[{fromBlock: 'latest', toBlock: 'pending'}],'invalid from and to block'],
            [
                [{fromBlock: 'latest', toBlock: 'earliest'}],
                'invalid from and to block'
            ]
        ]
        const len = cases_of_create_newFilter.length
        const len2 = cases_of_create_newFilter_counterexample.length

        test('eth_newFilter', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_create_newFilter[i]) {
                    var res = await request(
                        'eth_newFilter',
                        cases_of_create_newFilter[i][0]
                    )
                    //console.log('rpc post normal', i, '===', res)
                    expect(res.result).not.toBeNull()
                    expect(res.result).toMatch(cases_of_create_newFilter[i][1])
                }
            }
        })

        test('test eth_newFilter_counterexample', async () => {
            for (var i = 0; i < len2; i++) {
                if (cases_of_create_newFilter_counterexample[i]) {
                    var res = await request(
                        'eth_newFilter',
                        cases_of_create_newFilter_counterexample[i][0]
                    )
                    //console.log('rpc post abnormal', i, '===', res.error)
                    expect(res.error).not.toBeNull()
                    expect(JSON.stringify(res.error)).toMatch(
                        cases_of_create_newFilter_counterexample[i][1]
                    )
                }
            }
        })
    })

    describe('test create new block filter', () => {
        let cases_of_create_newBlockFilter: any[][] = []

        cases_of_create_newBlockFilter = [
            //case0-3 : only fill fromBlock
            [' ', '0x']
        ]
        const len = cases_of_create_newBlockFilter.length

        test('eth_newBlockFilter', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_create_newBlockFilter[i]) {
                    var res = await request('eth_newBlockFilter')
                    /*console.log(
                        'rpc post eth_newBlockFilter normal',
                        i,
                        '===',
                        res
                    ) */
                    expect(res.result).not.toBeNull()
                    expect(res.result).toMatch(
                        cases_of_create_newBlockFilter[i][1]
                    )
                }
            }
        })
    })

    describe('test create new pendingTransaction filter', () => {
        let cases_of_create_newPendingTransactionFilter: any[][] = []

        cases_of_create_newPendingTransactionFilter = [[' ', '0x']]
        const len = cases_of_create_newPendingTransactionFilter.length

        test('eth_newPendingTransactionFilter', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_create_newPendingTransactionFilter[i]) {
                    var res = await request('eth_newPendingTransactionFilter')
                    expect(res.result).not.toBeNull()
                    expect(res.result).toMatch(
                        cases_of_create_newPendingTransactionFilter[i][1]
                    )
                }
            }
        })
    })

    describe('test get filter logs', () => {
        let cases_of_get_logs: any[][] = []
        cases_of_get_logs = [
            //case0-2 : only fill fromBlock
            [
                [{fromBlock: '0x1'}],
                '0x0000000000000000000000000000000000001001'
            ],
            //[[{fromBlock: 'latest'}], '0x'],
            //case3-6 : fill fromBlock and toBlock
            [
                [{fromBlock: '0x1', toBlock: 'latest'}],
                '0x0000000000000000000000000000000000001001'
            ]
        ]

        const len = cases_of_get_logs.length

        test('eth_getLogs', async () => {
            for (var i = 0; i < len; i++) {
                if (cases_of_get_logs[i]) {
                    var res = await request(
                        'eth_getLogs',
                        cases_of_get_logs[i][0]
                    )
                    //console.log('res is', res)
                    expect(res.result).not.toBeNull()
                    // console.log(res.result)
                    expect(JSON.stringify(res.result)).toMatch(
                        cases_of_get_logs[i][1]
                    )
                }
            }
        })
    })

    describe('test uninstall filter', () => {
        test('eth_uninstallFilter', async () => {
            var res = await request('eth_newFilter', [
                {fromBlock: 'earliest', toBlock: 'latest'}
            ])
            var filterId = res.result
            res = await request('eth_uninstallFilter', [filterId])
            //console.log('post eth_uninstallFilter normal', res)
            expect(res.result).not.toBeNull()
            expect(String(res.result)).toMatch('true')

            // uninstall a nonexistent filter
            res = await request('eth_uninstallFilter', ['0x123'])
            //console.log('post eth_uninstallFilter abnormal', res)
            expect(String(res.result)).toMatch('false')
        })
    })

    describe('test get filter logs', () => {
        test('eth_getFilterLogs', async () => {
            var res = await request('eth_newFilter', [
                {
                    fromBlock: '0x1',
                    toBlock: 'latest',
                    address: '0x0000000000000000000000000000000000001001'
                }
            ])
            var filterId = res.result
            res = await request('eth_getFilterLogs', [filterId])
            //console.log('post eth_getFilterLogs normal', res)
            expect(res.result).not.toBeNull()
            expect(res.result[0]?.address).toMatch(
                '0x0000000000000000000000000000000000001001'
            )

            // get a nonexistent filter's logs
            res = await request('eth_getFilterLogs', ['0x123'])
            //console.log('post eth_getFilterLogs abnormal', res)
            expect(JSON.stringify(res.error)).toMatch('filter not found')
        })
    })

    describe('test get filter changes', () => {
        test('eth_getFilterChanges', async () => {
            var res = await request('eth_newFilter', [
                {
                    fromBlock: '0x1',
                    toBlock: 'latest',
                    address: '0x0000000000000000000000000000000000001001'
                }
            ])
            var filterId = res.result
            res = await request('eth_getFilterChanges', [filterId])
            //console.log('post eth_getFilterChanges normal', res)
            expect(res).not.toBeNull()

            // uninstall a nonexistent filter
            res = await request('eth_getFilterLogs', ['0x123'])
            //console.log('post eth_getFilterLogs abnormal', res)
            expect(JSON.stringify(res.error)).toMatch('filter not found')
        })
    })
})
