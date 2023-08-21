import { test, expect } from '@jest/globals'
import { ethers } from '@axiomesh/axiom'
import { ST_URL } from '../../utils/rpc'

const provider = new ethers.JsonRpcProvider(ST_URL);

describe('test_getChainId', () => {
    const provider = new ethers.JsonRpcProvider(ST_URL);

    test('eth_getBlockByHash', async () => {
        const signer = await provider.getSigner();
        console.log(signer.address)
    })
})