import { test, expect, describe } from '@jest/globals'
import {newWsClient,newRpcClient,ST_PRIVATEKRY} from '../utils/rpc'
import { ContractUtils } from '../utils/contract'
import {
  ST_CONTRACT_DIR,
  ST_EVM_CONTRACT_NAME,
  ST_EVM_FILENAME,
  ST_EVENTTEST_FILENAME,
  ST_EVENTTEST_CONTRACT_NAME
} from '../utils/contracts_static'


describe('subscribe', () => {
  const client = newRpcClient()
  const utils = new ContractUtils(ST_CONTRACT_DIR, client, ST_PRIVATEKRY)
  utils.compile(ST_EVM_FILENAME, ST_EVM_CONTRACT_NAME)
  utils.compile(ST_EVENTTEST_FILENAME, ST_EVENTTEST_CONTRACT_NAME)

  const abi=utils.getAbi(ST_EVENTTEST_CONTRACT_NAME)
  const eventAbiOne = abi.find(
      (item: { type: string; name: string }) => item.type === 'event' && item.name === 'TestOne'
  );
  const eventAbiTwo = abi.find(
    (item: { type: string; name: string }) => item.type === 'event' && item.name === 'TestTwo'
  );
  const eventAbiThree = abi.find(
    (item: { type: string; name: string }) => item.type === 'event' && item.name === 'TestThree'
  );
  const eventTopicOne = client.eth.abi.encodeEventSignature(eventAbiOne);
  const eventTopicTwo = client.eth.abi.encodeEventSignature(eventAbiTwo);
  const eventTopicThree = client.eth.abi.encodeEventSignature(eventAbiThree);
  

  test('subscribe newHeads', async () => {
      const ws = newWsClient()
      const subscription = await ws.eth.subscribe('newHeads')
      var blocknum = await client.eth.getBlockNumber()
      const num=blocknum
      console.log(blocknum)
      subscription.on('data', async (headers: any) => {
          console.log(headers)
          blocknum=blocknum+BigInt(1)
          console.log(blocknum)
          expect(headers.number).toBe(blocknum)
      })
      subscription.on('error', (error) => {
        console.error(`Error: ${error}`);
      });
      const address = await utils.deploy(ST_EVM_CONTRACT_NAME)
      expect(address).not.toBeNull()
      await waitAsync(1000 * 3)
      ws.currentProvider?.disconnect()
      expect(blocknum).toBe(num+BigInt(1))
      
  })

  test('unsubscribe newHeads',async() => {
    const ws = newWsClient()
    const subscription = await ws.eth.subscribe('newHeads')
    var blocknum = await client.eth.getBlockNumber()
    const num =blocknum
    console.log(blocknum)
    subscription.on('data', async (headers: any) => {
        console.log(headers)
        blocknum=blocknum+BigInt(1)
        console.log(blocknum)
        expect(headers.number).toBe(blocknum)
    })
    subscription.on('error', (error) => {
      console.error(`Error: ${error}`);
    });
    subscription.unsubscribe()
    const address = await utils.deploy(ST_EVM_CONTRACT_NAME)
    await waitAsync(1000 * 1)
    expect(num).toBe(blocknum)


  })


  test('subscribeByCorrectAddrAndTopic',async() => {
    const ws = newWsClient()

    const address = await utils.deploy(ST_EVENTTEST_CONTRACT_NAME)
    expect(address).not.toBeNull()
    var num =0 
    
    const mesHash = ws.utils.keccak256('message test one');
    const subscription = await ws.eth.subscribe('logs', {
      address:address, // 替换为你要订阅的智能合约的地址
      topics: [eventTopicOne] // 替换为你要订阅的主题数组
    });
    subscription.on('data', async (event: any) => {
      num++;
      console.log(event)
      const eventData = event.data; // 事件的数据字段
      const eventTopics = event.topics; // 事件的主题数组

      // 解码事件数据
      const decodedEvent = ws.eth.abi.decodeLog(
        eventAbiOne.inputs,
        eventData,
        eventTopics.slice(1) // 排除事件签名主题
      );

      console.log('Decoded event:', decodedEvent);
      expect(decodedEvent).not.toBeNull();
      expect(decodedEvent.mes).toBe('message test one')
    })
    const receipt = await utils.call(ST_EVENTTEST_CONTRACT_NAME,address,"testEventOne");
    console.log(receipt);
    await waitAsync(1000 * 1)
    subscription.unsubscribe()
    expect(num).toBe(1)

  })


  test('subscribeByErrorAddr',async() => {
    const ws = newWsClient()

    const address = await utils.deploy(ST_EVENTTEST_CONTRACT_NAME)
    expect(address).not.toBeNull()
    var num =0
    
    const subscription = await ws.eth.subscribe('logs', {
      address:'0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013', // 替换为你要订阅的智能合约的地址
      topics: [] // 替换为你要订阅的主题数组
    });

    subscription.on('data', async (event: any) => {
      num++
      console.log(event)
    })
    subscription.on('error', (error) => {
      console.error(`Error: ${error}`);
    });
    const receipt = await utils.call(ST_EVENTTEST_CONTRACT_NAME,address,"testEventOne");
    console.log(receipt);
    await waitAsync(1000 * 1)
    subscription.unsubscribe()
    expect(num).toBe(0)

  })


  test('subscribeByCorrectTopic',async() => {
    const ws = newWsClient()

    const address = await utils.deploy(ST_EVENTTEST_CONTRACT_NAME)
    expect(address).not.toBeNull()
    var num =0
    
    //不能传空字符串 只能不传address
    const subscription = await ws.eth.subscribe('logs', {
      topics: [eventTopicOne] // 替换为你要订阅的主题数组
    });
    subscription.on('data', async (event: any) => {
      num++
      console.log(event)
      const eventData = event.data; // 事件的数据字段
      const eventTopics = event.topics; // 事件的主题数组

      // 解码事件数据
      const decodedEvent = ws.eth.abi.decodeLog(
        eventAbiOne.inputs,
        eventData,
        eventTopics.slice(1) // 排除事件签名主题
      );

      console.log('Decoded event:', decodedEvent);
      expect(decodedEvent).not.toBeNull();
      expect(decodedEvent.mes).toBe('message test one')
    })
    subscription.on('error', (error) => {
      console.error(`Error: ${error}`);
    });
    const receipt = await utils.call(ST_EVENTTEST_CONTRACT_NAME,address,"testEventOne");
    console.log(receipt);
    await waitAsync(1000 * 1)
    subscription.unsubscribe()
    expect(num).toBe(1)
  })

  test('subscribeByErrorTopic',async() => {
    const ws = newWsClient()

    const address = await utils.deploy(ST_EVENTTEST_CONTRACT_NAME)
    expect(address).not.toBeNull()
    var num =0;
    
    const subscription = await ws.eth.subscribe('logs', {
      address:address, // 替换为你要订阅的智能合约的地址
      topics: ['0x2b570ce470e27ef2de4c22e8f2345f2426cea348f782b3d37fc6c6a2c2d3f0e1'] // 替换为你要订阅的主题数组
    });
    subscription.on('data', async (event: any) => {
      num++;
      console.log(event)
      const eventData = event.data; // 事件的数据字段
      const eventTopics = event.topics; // 事件的主题数组

      // 解码事件数据
      const decodedEvent = ws.eth.abi.decodeLog(
        eventAbiOne.inputs,
        eventData,
        eventTopics.slice(1) // 排除事件签名主题
      );

      console.log('Decoded event:', decodedEvent);
      expect(decodedEvent).not.toBeNull();
      expect(decodedEvent.mes).toBe('message test one')
    })
    subscription.on('error', (error) => {
      console.error(`Error: ${error}`);
    });
    const receipt = await utils.call(ST_EVENTTEST_CONTRACT_NAME,address,"testEventOne");
    console.log(receipt);
    await waitAsync(1000 * 3)
    subscription.unsubscribe()
    expect(num).toBe(0)


  })


  test('subscribeByCorrentAddr',async() => {
    const ws = newWsClient()
    var num=0;

    const address = await utils.deploy(ST_EVENTTEST_CONTRACT_NAME)
    expect(address).not.toBeNull()

    const subscription = await ws.eth.subscribe('logs', {
      address:address, // 替换为你要订阅的智能合约的地址
      topics: [] // 替换为你要订阅的主题数组
    });
    subscription.on('data', async (event: any) => {
      num++;
      console.log(event)
    })
    subscription.on('error', (error) => {
      console.error(`Error: ${error}`);
    });
    const receipt = await utils.call(ST_EVENTTEST_CONTRACT_NAME,address,"testAll");
    console.log(receipt);
    await waitAsync(1000 * 3)
    subscription.unsubscribe()
    expect(num).toBe(3)
  })

  test('unsubscribeByCorrentAddr',async() => {
    const ws = newWsClient()
    var num=0;

    const address = await utils.deploy(ST_EVENTTEST_CONTRACT_NAME)
    expect(address).not.toBeNull()
    
    const subscription = await ws.eth.subscribe('logs', {
      address:address, // 替换为你要订阅的智能合约的地址
      topics: [] // 替换为你要订阅的主题数组
    });
    subscription.on('data', async (event: any) => {
      num++;
      console.log(event)
    })
    subscription.on('error', (error) => {
      console.error(`Error: ${error}`);
    });
    subscription.unsubscribe()
    const receipt = await utils.call(ST_EVENTTEST_CONTRACT_NAME,address,"testAll");
    console.log(receipt);
    expect(num).toBe(0)


  })


  test('subscribe newPendingTransactions',async() => {
    const ws = newWsClient()
    var num = 0
    const subscription = await ws.eth.subscribe('newPendingTransactions')
    subscription.on('data', async (res: any) => {
      num++
      console.log(res)
    })
    subscription.on('error', (error) => {
      console.error(`Error: ${error}`);
    });
    const address = await utils.deploy(ST_EVENTTEST_CONTRACT_NAME)
    expect(address).not.toBeNull()
    await waitAsync(1000 * 3)
    subscription.unsubscribe()
    expect(num).toBe(1)

  })

  test('unsubscribe newPendingTransactions',async() => {
    const ws = newWsClient()
    const subscription = await ws.eth.subscribe('newPendingTransactions')
    var num = 0
    subscription.on('data', async (res: any) => {
      num++
      console.log(res)
    })
    subscription.on('error', (error) => {
      console.error(`Error: ${error}`);
    });
    await waitAsync(1000 * 3)
    subscription.unsubscribe()
    const address = await utils.deploy(ST_EVENTTEST_CONTRACT_NAME)
    expect(address).not.toBeNull()
    expect(num).toBe(0)

  })



})







async function waitAsync(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}




