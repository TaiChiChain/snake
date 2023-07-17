import { test, expect } from '@jest/globals';
import { client } from '../../utils/rpc';


test('eth_getBlockByHash', async () => {
  const blockNumber = await client.eth.getBlockNumber();
  let block = await client.eth.getBlock(blockNumber);
  expect(block.number).toBe(blockNumber);

  const blockHash = block.hash;
  block = await client.eth.getBlock(blockHash);
  expect(block.number).toBe(blockNumber);
});

test('eth_getBlockByNumber', async () => {

  const blockNumber = await client.eth.getBlockNumber();
  const block = await client.eth.getBlock(blockNumber);
  // console.log(block.transactions[0]);
  expect(block.number).toBe(blockNumber);
});