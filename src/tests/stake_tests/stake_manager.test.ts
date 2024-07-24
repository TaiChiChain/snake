import {test, expect, describe} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {
    ST_CONTRACT_DIR,
    ST_STAKE_MANAGER_ADDRESS
} from '../../utils/contracts_static'
import {newProvider} from '../../utils/rpc'
import {
    ST_ADMIN_1,
    ST_ADMIN_2,
    ST_ADMIN_3,
    ST_ADMIN_4,
    ST_ACCOUNT_5,
    ST_ACCOUNT_11,
    ST_ACCOUNT_1
} from '../../utils/accounts_static'
import {hexStringToString, stringToUint8Array} from '../../utils/util'
import fs from 'fs'
import {Uint256} from 'web3'
/*
interface poolInfo {
    id: bigint
    IsActive: boolean
    ActiveStake: string
    TotalLiquidStakingToken: any
    PendingActiveStake: Uint256
    PendingInactiveStake: Uint256
    PendingInactiveLiquidStakingTokenAmount: Uint256
    CommissionRate: Uint256
    NextEpochCommissionRate: Uint256
    LastEpochReward: Uint256
    LastEpochCommission: Uint256
    CumulativeReward: Uint256
    CumulativeCommission: Uint256
    OperatorLiquidStakingTokenID: Uint256
}
*/

describe('TestCases for stake manager', () => {
    const provider = newProvider()
    const abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'Stake/stake_manager.abi',
        'utf8'
    )
    describe('test add stake ', () => {
        const wallet = new ethers.Wallet(ST_ACCOUNT_5.privateKey, provider)
        const contract_stake = new ethers.Contract(
            ST_STAKE_MANAGER_ADDRESS,
            abi,
            wallet
        )
        let pool_id = 1
        test('normal add stake ', async () => {
            console.log('1. query stake_pool info before addStake')
            let before_pool_info = await contract_stake.getPoolInfo(pool_id)
            console.log('before:', before_pool_info)

            console.log('2. user5 add stake to exist stake_pool')
            let valueToStake = ethers.parseEther('100') // 将ETH 转换为 wei
            let tx = await contract_stake.addStake(
                pool_id,
                ST_ACCOUNT_5.address,
                valueToStake,
                {value: valueToStake}
            )
            await tx.wait()
            console.log('Transaction successful with hash:', tx.hash)

            console.log('3. query stake_pool info after addStake')
            let after_pool_info = await contract_stake.getPoolInfo(pool_id)
            console.log('after:', after_pool_info)

            expect(after_pool_info[4]).toEqual(
                before_pool_info[4] + BigInt(valueToStake)
            )
        })

        test('add stake with error value', async () => {
            console.log('1. query stake_pool info before addStake')
            let before_pool_info = await contract_stake.getPoolInfo(pool_id)
            console.log('before:', before_pool_info)

            console.log('2. user5 add stake to exist stake_pool')
            let valueToStake = ethers.parseEther('10') // 将ETH 转换为 wei
            try {
                await contract_stake.addStake(
                    pool_id,
                    ST_ACCOUNT_5.address,
                    valueToStake,
                    {value: valueToStake}
                )

                expect(true).toBe(false)
            } catch (error) {
                //console.log('error is:', error)
                expect(String(error)).toMatch('less than min stake')
            }

            console.log('3. query stake_pool info after addStake')
            let after_pool_info = await contract_stake.getPoolInfo(pool_id)
            console.log('after:', after_pool_info)

            expect(after_pool_info[4]).toEqual(before_pool_info[4])
        })
    })
})
