// import * as dotenv from "dotenv";
import {describe, test} from '@jest/globals'
import {ethers} from '@axiomesh/axiom'
import {
    deploy_contract,
    newProvider,
    ST_URL,
    transferAXc,
    SIGNER_KEY,
    BUNDLER_URL,
    ST_PAYMASTER_URL
} from '../../utils/rpc'
import {
    ST_ACCOUNT_5,ST_ADMIN_4,ST_GUARDIAN
} from '../../utils/accounts_static'
import path from "path";
import {
    ST_SCRIPTS_DIR, ST_DATA_DIR, ST_CONTRACT_DIR,ST_ACCOUNT_FACTORY,ST_ENTRY_POINT,ST_PAYMASTER
} from '../../utils/contracts_static';
import {extractAddress, runShellScript, waitAsync} from "../../utils/util";

import fs from "fs";
import {AxiomWallet} from "axiomwallet/dist/cjs/src/axiomWallet";
import {
    createPublicClient,
    defineChain,
    parseUnits,
    http,
    PublicClient,
    createWalletClient,
    WalletClient,
    parseEther,
    getContract,
    zeroHash,
    formatGwei,
    formatEther,
    formatUnits, Hex,
} from "viem";
import {Address} from "abitype";
import { privateKeyToAccount } from "viem/accounts";
import {ERC20_ABI} from "axiomwallet/dist/cjs/test/abi";
import env from "hardhat";
import {generateSigner} from "axiomwallet/dist/cjs/src/utility";
import {Signer} from "ethers";

interface walletInstance {
    password: string,
    passwordSalt: string,
    encryptedKey: string,
    senderAddress: Address,
    accountSalt: string
}

const axios = require('axios');
const FormData = require('form-data');
process.env.ACCOUNT_FACTORY=ST_ACCOUNT_FACTORY
process.env.GUARDIAN=ST_GUARDIAN
process.env.PAYMASTER_URL=ST_PAYMASTER_URL
process.env.BUNDLER_URL=BUNDLER_URL
process.env.ENTRY_POINT=ST_ENTRY_POINT
process.env.PAYMASTER=ST_PAYMASTER
process.env.RPC_URL=ST_URL
let addressList: walletInstance[]=[]
const provider = newProvider()
const requestCount=500;
describe('AxiomWallet: transfer with password', () => {



    test.only('deploy', async () => {
        await envDeploy()
    });
    test.only('generate account and min axc', async () => {
        await genSmartAccount(requestCount)
    });


    test.only('calculate TPS - AXC transfer', async () => {
        let result:any = [];
        result = await extractEncryptedKeysAndAddresses("account.txt")
        // console.log(result.length)
        const promises: any[] = [];
        const startTime = performance.now();
        console.log(startTime)
        for (let i = 0; i < requestCount; i++) {
            // console.log(i)
            const promise = transferAXC(result[i].encryptedKey,result[i].senderAddress)
            promises.push(promise)
        }
        await Promise.all(promises);
        const endTime = performance.now();
        console.log(endTime)
        const elapsedTime = endTime - startTime;
        console.log(elapsedTime)
        const tps = requestCount / (elapsedTime / 1000);

        console.log(`TPS: ${tps}`);
    });

    test.only('mint weth', async () => {
        let viemPublicClient: PublicClient;
        let viemWalletClient: WalletClient;
        const eoa = privateKeyToAccount(SIGNER_KEY as Address);
        await envSetFromEnvConfFile("env_conf.txt")
        // @ts-ignore
        let axiomesh = defineChain({
            id: 1356,
            name: "Axiomesh",
            nativeCurrency: {
                decimals: 18,
                name: "AXC",
                symbol: "AXC",
            },
            rpcUrls: {
                default: {
                    http: [ST_URL],
                },
            },
        });

        viemWalletClient = createWalletClient({
            account: eoa,
            chain: axiomesh,
            transport: http(ST_URL),
        });
        viemPublicClient = createPublicClient({
            chain: axiomesh,
            transport: http(ST_URL),
        });

        // @ts-ignore
        const weth = await getContract({
            address: process.env.WETH as Address,
            abi: ERC20_ABI,
            client: viemWalletClient,
        });
        let result:any = [];
        result = await extractEncryptedKeysAndAddresses("account.txt")

        for (let i = 0; i < requestCount; i++) {
            // console.log(i)
            const wallat = await AxiomWallet.fromEncryptedKey("12345","12345",result[i].encryptedKey,result[i].senderAddress)
            const erc20FundingTransaction_weth = await viemWalletClient.writeContract({
                address: process.env.WETH as Address,
                abi: ERC20_ABI,
                functionName: "mint",
                args: [await wallat.getAddress(), parseUnits("100", await weth.read.decimals())],
                chain: axiomesh,
                account: eoa,
            });
            await getReceiptInRange(viemPublicClient, erc20FundingTransaction_weth, {
                maxRange: 1500,
                timeout: 600_000,
                pollingInterval: 20_000,
                retryCount: 10
            })
        }

    });

    test.only('calculate TPS - AXC transfer with passkey', async () => {
        let result:any = [];
        result = await extractEncryptedKeysAndAddresses("account.txt")

        await envSetFromEnvConfFile("env_conf.txt")

        const passwordlessWalltes:any = [];

        for  (let i = 0; i < requestCount; i++) {
            const passwordlessWallet = await deployPasskey(result[i].encryptedKey,result[i].senderAddress)
            // console.log(passwordlessWallet)
            passwordlessWalltes.push(passwordlessWallet)
        }
        console.log(passwordlessWalltes.length)
        const promises: any[] = [];
        const startTime = performance.now();
        console.log(startTime)
        for (let i = 0; i < requestCount; i++) {
            // console.log(i)
            const promise = transferAXCWithPasskey(passwordlessWalltes[i])
            promises.push(promise)
        }
        await Promise.all(promises);
        const endTime = performance.now();
        console.log(endTime)
        const elapsedTime = endTime - startTime;
        console.log(elapsedTime)
        const tps = requestCount / (elapsedTime / 1000);

        console.log(`TPS: ${tps}`);
    });

    test.only('calculate TPS - WETH transfer', async () => {
        let result:any = [];
        result = await extractEncryptedKeysAndAddresses("account.txt")
        // console.log(result.length)
        await envSetFromEnvConfFile("env_conf.txt")

        const promises: any[] = [];
        const startTime = performance.now();
        console.log(startTime)
        for (let i = 0; i < requestCount; i++) {
            const promise = transferWeth(result[i].encryptedKey,result[i].senderAddress)
            promises.push(promise)
        }
        await Promise.all(promises);
        const endTime = performance.now();
        console.log(endTime)
        const elapsedTime = endTime - startTime;
        console.log(elapsedTime)
        const tps = requestCount / (elapsedTime / 1000);

        console.log(`TPS: ${tps}`);
    });
})


async function envDeploy() {
    const wallet = new ethers.Wallet(ST_ACCOUNT_5.privateKey, provider)
    let wETHAddress: string;
    let wUSDTAddress: string;
    let wUSDCAddress: string;
    let token: string;
    let priceFeedsAddress: string;
    let appkey: string;
    //部署bundler
    console.log('Deploy bundler')
    const deployBundlerScript = path.join(
        ST_SCRIPTS_DIR,
        'deploy_bundler.sh'
    )
    await runShellScript(deployBundlerScript, "")

    //给bundler账户转钱
    const address = path.join(
        ST_DATA_DIR,
        'fetch-wallet.log'
    )
    const bundle_account = await extractAddress(address)
    let nonce = await provider.getTransactionCount(ST_ACCOUNT_5.address)
    console.log(nonce)
    if (typeof bundle_account === "string") {
        await transferAXc(wallet, bundle_account, nonce, '1000')
    }

    //给VerifyingPaymaster的合约地址转钱
    nonce = await provider.getTransactionCount(ST_ACCOUNT_5.address)
    console.log(nonce)
    await transferAXc(wallet, "0x000000000000000000000000000000000000100a", nonce, '1000')

    //TokenPaymaster的合约地址转钱
    nonce = await provider.getTransactionCount(ST_ACCOUNT_5.address)
    console.log(nonce)
    await transferAXc(wallet, "0x000000000000000000000000000000000000100b", nonce, '1000')

    //部署paymaster
    console.log('Deploy paymaster')
    const deployPaymasterScript = path.join(
        ST_SCRIPTS_DIR,
        'deploy_paymaster.sh'
    )
    await runShellScript(deployPaymasterScript, "")

    //部署wETH合约
    console.log('Deploy wETH')
    wETHAddress = await deploy_contract(wallet, 'WETH/wETH')
    console.log(wETHAddress)
    process.env.WETH = wETHAddress

    //部署wUSDT合约
    console.log('Deploy wUSDT')
    wUSDTAddress = await deploy_contract(wallet, 'WUSDT/wUSDT')
    console.log(wUSDTAddress)
    process.env.WUSDT = wUSDTAddress

    //部署wUSDC合约
    console.log('Deploy wUSDC')
    wUSDCAddress = await deploy_contract(wallet, 'WUSDC/wUSDC')
    console.log(wUSDCAddress)
    process.env.WUSDC = wUSDCAddress

    //登录paymaster
    const data = new FormData();
    data.append('username', 'admin');
    data.append('password', 'admin');

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:10088/v1/api/user/login',
        headers: {
            ...data.getHeaders()
        },
        data: data
    };

    const response = await axios.request(config)
    const jsonData = JSON.stringify(response.data)
    console.log(jsonData);
    const parsedData = JSON.parse(jsonData);
    token = parsedData.token;
    console.log(token)

    //更新密码
    const update_data = new FormData();
    update_data.append('password', 'admin888');
    const config_update = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:10088/v1/api/user/update',
        headers: {
            'Authorization': 'paymaster ' + token,
            ...update_data.getHeaders()
        },
        data: update_data
    };

    const response_update = await axios.request(config_update)
    const jsonData_update = JSON.stringify(response_update.data)
    console.log(JSON.stringify(jsonData_update));

    //创建appkey
    const create_data = new FormData();
    const config_create = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:10088/v1/api/user/appkey/create',
        headers: {
            'Authorization': 'paymaster ' + token,
            ...create_data.getHeaders()
        },
        data: create_data
    };
    const response_create = await axios.request(config_create)
    const jsonData_create = JSON.stringify(response_create.data)
    console.log(jsonData_create)
    const parsedData_appkey = JSON.parse(jsonData_create)
    appkey = parsedData_appkey.appkey
    console.log(appkey)
    process.env.PAYMASTER_APPKEY = appkey

    //部署喂价合约
    console.log('Deploy priceFeeds')
    priceFeedsAddress = await deploy_contract(wallet, 'PriceFeeds/priceFeeds')
    console.log(priceFeedsAddress)

    //喂价
    console.log("update price")
    const priceFeeds_abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'PriceFeeds/priceFeeds.abi',
        'utf8'
    )

    const priceTuples: [number, number, number, string, string, string, string, string][] = [
        [768828323, 100000000, 1712888970, "mixed", "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "AXC", "wUSDC", process.env.WUSDC],
        [769453846, 100000000, 1712888970, "okx", "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "AXC", "wUSDT", process.env.WUSDT],
        [2711634138923, 100000000, 1712888970, "mixed", "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "AXC", "wETH", process.env.WETH]
    ]
    const priceFeeds_contract = new ethers.Contract(priceFeedsAddress, priceFeeds_abi, wallet)
    //console.log('Mint 1000000000 TAXM at :', ST_ACCOUNT_5.address)
    const updatePricesReceipt = await priceFeeds_contract.updatePrices(priceTuples)
    await updatePricesReceipt.wait()
    console.log(updatePricesReceipt)

    //查询价格信息
    console.log("query price info")
    const addressTuple: [string, string, string] = [process.env.WUSDC, process.env.WUSDT, process.env.WETH]
    const priceInfoReceipt = await priceFeeds_contract.getTickerInfos(addressTuple)
    console.log(priceInfoReceipt)

    //添加喂价预言机
    console.log("Token paymaster")
    const tokenPaymaster_abi = fs.readFileSync(
        ST_CONTRACT_DIR + 'TokenPaymaster/tokenPaymaster.abi',
        'utf8'
    )
    const wallet_tokenpaymaster = new ethers.Wallet(ST_ADMIN_4.privateKey, provider)
    const tokenPaymaster_contract = new ethers.Contract("0x000000000000000000000000000000000000100b", tokenPaymaster_abi, wallet_tokenpaymaster)
    console.log("Token paymaster ========> wUSDC")
    const addTokenReceipt_wUSDC = await tokenPaymaster_contract.addToken(process.env.WUSDC, priceFeedsAddress)
    await addTokenReceipt_wUSDC.wait()
    console.log(addTokenReceipt_wUSDC)

    console.log("Token paymaster ========> wUSDT")
    const addTokenReceipt_wUSDT = await tokenPaymaster_contract.addToken(process.env.WUSDT, priceFeedsAddress)
    await addTokenReceipt_wUSDT.wait()
    console.log(addTokenReceipt_wUSDT)

    console.log("Token paymaster ========> wETH")
    const addTokenReceipt_wETH = await tokenPaymaster_contract.addToken(process.env.WETH, priceFeedsAddress)
    await addTokenReceipt_wETH.wait()
    console.log(addTokenReceipt_wETH)
    // addressList = await genSmartAccount(requestCount)

    const env_data = 'WETH='+process.env.WETH+'\nWUSDT='+process.env.WUSDT+'\nWUSDC='+process.env.WUSDC+'\nPAYMASTER_APPKEY='+process.env.PAYMASTER_APPKEY;
    const filename = 'env_conf.txt';

    fs.writeFile(filename, env_data, (err) => {
        if (err) throw err;
        console.log('数据写入成功！');
    });
    // return addressList
}

async function genSmartAccount(requestCount: number) {
    let axiomWallet: AxiomWallet;
    let viemWalletClient: WalletClient;
    let viemPublicClient: PublicClient;
    let walletAddress: Address;
    await envSetFromEnvConfFile("env_conf.txt")
    const eoa = privateKeyToAccount(SIGNER_KEY as Address);
    // @ts-ignore
    let axiomesh = defineChain({
        id: 1356,
        name: "Axiomesh",
        nativeCurrency: {
            decimals: 18,
            name: "AXC",
            symbol: "AXC",
        },
        rpcUrls: {
            default: {
                http: [ST_URL],
            },
        },
    });
    viemWalletClient = createWalletClient({
        account: eoa,
        chain: axiomesh,
        transport: http(ST_URL),
    });
    viemPublicClient = createPublicClient({
        chain: axiomesh,
        transport: http(ST_URL),
    });
    for (let i = 0; i < requestCount; i++) {
        //准备账户
        console.log("ready account")
        axiomWallet = await AxiomWallet.fromPassword("12345", "12345", "0");
        walletAddress = await axiomWallet.getAddress();
        console.log(walletAddress)
        const encryptedkey = await axiomWallet.getEncryptedPrivateKey()

        if (encryptedkey !== null) {
            addressList.push({
                password: '12345',
                passwordSalt: '12345',
                accountSalt: '0',
                encryptedKey: encryptedkey,
                senderAddress: walletAddress
            })
        }
        const axcFundingTransaction = await viemWalletClient.sendTransaction({
            account: eoa,
            chain: axiomesh,
            to: walletAddress,
            value: parseEther("100"),
        });

        await getReceiptInRange(viemPublicClient, axcFundingTransaction, {
            maxRange: 1500,
            timeout: 600_000,
            pollingInterval: 20_000,
            retryCount: 10
        })
        const hash = await axiomWallet.deployWalletAccout();
        if (hash && hash?.length > 0) console.log("Wallet deployment succeed");
        const data = "{encryptedKey:" + encryptedkey +","+"senderAddress:" + walletAddress +"}\n"
        // 文件路径
        const filename = 'account.txt';

        // 追加数据
        fs.appendFile(filename, data, (err) => {
            if (err) throw err;
            console.log('数据追加成功！');
        });


    }

    return addressList
}

// async function mintErc20(address: string, walletAddress: string){
//     // let axiomWallet: AxiomWallet;
//     let viemWalletClient: WalletClient;
//     let viemPublicClient: PublicClient;
//     const eoa = privateKeyToAccount(SIGNER_KEY as Address);
//     // @ts-ignore
//     let axiomesh = defineChain({
//         id: 1356,
//         name: "Axiomesh",
//         nativeCurrency: {
//             decimals: 18,
//             name: "AXC",
//             symbol: "AXC",
//         },
//         rpcUrls: {
//             default: {
//                 http: [ST_URL],
//             },
//         },
//     });
//
//     // eslint-disable-next-line prefer-const
//     viemWalletClient = createWalletClient({
//         account: eoa,
//         chain: axiomesh,
//         transport: http(ST_URL),
//     });
//
//     // eslint-disable-next-line prefer-const
//     viemPublicClient = createPublicClient({
//         chain: axiomesh,
//         transport: http(ST_URL),
//     });
//
//     // @ts-ignore
//     const weth = await getContract({
//         address: address as Address,
//         abi: ERC20_ABI,
//         client: viemWalletClient,
//     });
//     const erc20FundingTransaction_weth = await viemWalletClient.writeContract({
//         address: address as Address,
//         abi: ERC20_ABI,
//         functionName: "mint",
//         args: [walletAddress, parseUnits("100", await weth.read.decimals())],
//         chain: axiomesh,
//         account: eoa,
//     });
//     // await waitForTransactionReceipt(viemPublicClient, {
//     //     hash: erc20FundingTransaction_weth
//     // });
//
//     await getReceiptInRange(viemPublicClient, erc20FundingTransaction_weth, {
//         maxRange: 1500,
//         timeout: 600_000,
//         pollingInterval: 20_000,
//         retryCount: 10
//     })
// }

async function genSmartAccountUseConf(requestCount: number) {
    let axiomWallet: AxiomWallet;
    let viemWalletClient: WalletClient;
    let viemPublicClient: PublicClient;
    let walletAddress: Address;
    await envSetFromEnvConfFile("env_conf.txt")
    const eoa = privateKeyToAccount(SIGNER_KEY as Address);
    // @ts-ignore
    let axiomesh = defineChain({
        id: 1356,
        name: "Axiomesh",
        nativeCurrency: {
            decimals: 18,
            name: "AXC",
            symbol: "AXC",
        },
        rpcUrls: {
            default: {
                http: [ST_URL],
            },
        },
    });
    for (let i = 0; i < requestCount; i++) {
        //准备账户
        console.log("ready account")
        viemWalletClient = createWalletClient({
            account: eoa,
            chain: axiomesh,
            transport: http(ST_URL),
        });
        viemPublicClient = createPublicClient({
            chain: axiomesh,
            transport: http(ST_URL),
        });
        axiomWallet = await AxiomWallet.fromPassword("12345", "12345", "0");
        walletAddress = await axiomWallet.getAddress();
        console.log(walletAddress)
        const encryptedkey = await axiomWallet.getEncryptedPrivateKey()

        if (encryptedkey !== null) {
            addressList.push({
                password: '12345',
                passwordSalt: '12345',
                accountSalt: '0',
                encryptedKey: encryptedkey,
                senderAddress: walletAddress
            })
        }
        const axcFundingTransaction = await viemWalletClient.sendTransaction({
            account: eoa,
            chain: axiomesh,
            to: walletAddress,
            value: parseEther("100"),
        });

        await getReceiptInRange(viemPublicClient, axcFundingTransaction, {
            maxRange: 1500,
            timeout: 600_000,
            pollingInterval: 20_000,
            retryCount: 10
        })

        // @ts-ignore
        const weth = await getContract({
            address: process.env.WETH as Address,
            abi: ERC20_ABI,
            client: viemWalletClient,
        });
        const erc20FundingTransaction_weth = await viemWalletClient.writeContract({
            address: process.env.WETH as Address,
            abi: ERC20_ABI,
            functionName: "mint",
            args: [walletAddress, parseUnits("100", await weth.read.decimals())],
            chain: axiomesh,
            account: eoa,
        });
        // await waitForTransactionReceipt(viemPublicClient, {
        //     hash: erc20FundingTransaction_weth
        // });

        await getReceiptInRange(viemPublicClient, erc20FundingTransaction_weth, {
            maxRange: 1500,
            timeout: 600_000,
            pollingInterval: 20_000,
            retryCount: 10
        })
        const hash = await axiomWallet.deployWalletAccout();
        if (hash && hash?.length > 0) console.log("Wallet deployment succeed");


        // @ts-ignore
        const wusdc = await getContract({
            address: process.env.WUSDC as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });

        const erc20FundingTransaction_wusdc = await viemWalletClient.writeContract({
            address: process.env.WUSDC as Address,
            abi: ERC20_ABI,
            functionName: "mint",
            args: [walletAddress, parseUnits("100", await wusdc.read.decimals())],
            chain: axiomesh,
            account: eoa,
        });
        // await waitForTransactionReceipt(viemPublicClient, {
        //     hash: erc20FundingTransaction_wusdc
        // });

        await getReceiptInRange(viemPublicClient, erc20FundingTransaction_wusdc, {
            maxRange: 1500,
            timeout: 600_000,
            pollingInterval: 20_000,
            retryCount: 10
        })

        // @ts-ignore
        const wusdt = await getContract({
            address: process.env.WUSDT as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });

        const erc20FundingTransaction_wusdt = await viemWalletClient.writeContract({
            address: process.env.WUSDT as Address,
            abi: ERC20_ABI,
            functionName: "mint",
            args: [walletAddress, parseUnits("100", await wusdt.read.decimals())],
            chain: axiomesh,
            account: eoa,
        });
        // await waitForTransactionReceipt(viemPublicClient, {
        //     hash: erc20FundingTransaction_wusdt
        // });

        await getReceiptInRange(viemPublicClient, erc20FundingTransaction_wusdt
            , {
                maxRange: 1500,
                timeout: 600_000,
                pollingInterval: 20_000,
                retryCount: 3
            })
        const data = "{encryptedKey:" + encryptedkey +","+"senderAddress:" + walletAddress +"}\n"
        // 文件路径
        const filename = 'account.txt';

        // 追加数据
        fs.appendFile(filename, data, (err) => {
            if (err) throw err;
            console.log('数据追加成功！');
        });


    }

    return addressList
}
async function extractEncryptedKeysAndAddresses(filePath:string) {
    try{
        const data = await fs.readFileSync(filePath, 'utf8');
        const lines = data?.split('\n');
        const result:any = [];

        // 遍历每一行并提取 encryptedKey 和 senderAddress
        lines.forEach(line => {
            const match = line.match(/{encryptedKey:(.*?),senderAddress:(.*?)}/);
            if (match) {
                const encryptedKey = match[1].trim();
                const senderAddress = match[2].trim();
                // console.log(encryptedKey)
                // console.log(senderAddress)

                // 将提取的内容推入结果数组
                result.push({ encryptedKey, senderAddress });
            }
        });
        // console.log(result.length)
        return result
    } catch (e) {
        console.log(e)
    }
}

async function getReceiptInRange(
    client: PublicClient,
    hash: Hex,
    {
        maxRange = 1500,
        timeout = 30_000,
        pollingInterval = 1_000,
        retryCount = 10
    } = {}
) {
    const startTime = Date.now()
    const startBlock = await client.getBlockNumber()
    let attempts = 0

    while (attempts < retryCount) {
        try {
            const currentBlock = await client.getBlockNumber()

            // 检查区块范围
            if (currentBlock - startBlock > maxRange) {
                throw new Error(`Block range exceeded: ${currentBlock - startBlock}`)
            }

            // 检查超时
            if (Date.now() - startTime > timeout) {
                throw new Error('Operation timed out')
            }

            const receipt = await client.getTransactionReceipt({ hash })
            if (receipt) return receipt

            await new Promise(r => setTimeout(r, pollingInterval))
        } catch (error) {
            attempts++
            if (attempts === retryCount) throw error
            // console.warn(`Attempt ${attempts}/${retryCount} failed:`, error)
            await new Promise(r => setTimeout(r, pollingInterval))
        }
    }

    throw new Error('Failed to get receipt')
}

async function transferAXC(encryptedKey:string,senderAddress:string){

    const wallat = await AxiomWallet.fromEncryptedKey("12345","12345",encryptedKey,<`0x${string}`>senderAddress)
    // let nonce = await wallat.axiomAccount.getNonce()
    const txhash = await wallat.transfer(
        "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
        parseEther("1")
    );

    return txhash
}



async function deployPasskey(encryptedKey:string,senderAddress:string){
    let sessionKey: Signer;
    let viemPublicClient: PublicClient;
    let passwordlessWallet:any

    // @ts-ignore
    let axiomesh = defineChain({
        id: 1356,
        name: "Axiomesh",
        nativeCurrency: {
            decimals: 18,
            name: "AXC",
            symbol: "AXC",
        },
        rpcUrls: {
            default: {
                http: [ST_URL],
            },
        },
    });

    viemPublicClient = createPublicClient({
        chain: axiomesh,
        transport: http(ST_URL),
    });
    // @ts-ignore
    const weth = await getContract({
        address: process.env.WETH as Address,
        abi: ERC20_ABI,
        client: viemPublicClient,
    });
    const wallat = await AxiomWallet.fromEncryptedKey("12345","12345",encryptedKey,<`0x${string}`>senderAddress)
    sessionKey = generateSigner();
    try {
        let currentDate = new Date();
        currentDate.setHours(23, 59, 59, 999);
        const validAfter = Math.round(Date.now() / 1000);
        const validUntil = currentDate.getTime();
        const receipt = await wallat.transfer(
            "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            parseUnits("0.0001", await weth.read.decimals()),
            {
                passwordless: {
                    signer: (await sessionKey.getAddress()) as Address,
                    spendingLimit: parseEther("50"),
                    validAfter: BigInt(validAfter),
                    validUntil: BigInt(validUntil),
                },
            }
        );
        if (receipt!.length > 0)
            console.log("Wallet with session key deploy succeed");
    } catch (error) {
        console.log(`deploy wallet or set session failed: ${error}`);
    }


    const address = await wallat.getAddress()
    passwordlessWallet = await AxiomWallet.fromSessionKey(
        sessionKey,
        address
    );
    return passwordlessWallet
}

async function transferAXCWithPasskey(passwordlessWallet:any){
    const transactionHash = await passwordlessWallet.transfer(
        "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
        parseEther("1")
    );

    return transactionHash
}

async function envSetFromEnvConfFile(filePath:string) {
    try{
        const data = await fs.readFileSync(filePath, 'utf8');
        const lines = data?.split('\n');
        // 遍历每一行，设置环境变量
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key] = value;
            }
        });
        // 验证是否设置成功
        console.log('WETH:',process.env.WETH );
        console.log('WUSDT:', process.env.WUSDT);
        console.log('WUSDC:', process.env.WUSDC);
        console.log('PAYMASTER_APPKEY:', process.env.PAYMASTER_APPKEY);
    } catch (e) {
        console.log(e)
    }
}

async function transferWeth(encryptedKey:string,senderAddress:string){
    let viemPublicClient: PublicClient;

    // @ts-ignore
    let axiomesh = defineChain({
        id: 1356,
        name: "Axiomesh",
        nativeCurrency: {
            decimals: 18,
            name: "AXC",
            symbol: "AXC",
        },
        rpcUrls: {
            default: {
                http: [ST_URL],
            },
        },
    });

    viemPublicClient = createPublicClient({
        chain: axiomesh,
        transport: http(ST_URL),
    });


    const wallat = await AxiomWallet.fromEncryptedKey("12345","12345",encryptedKey,<`0x${string}`>senderAddress)


    // @ts-ignore
    const weth = await getContract({
        address: process.env.WETH as Address,
        abi: ERC20_ABI,
        client: viemPublicClient,
    });
    const transactionHash = await wallat.transferErc20(
        weth.address,
        "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
        parseUnits("1", await weth.read.decimals())
    );

    return transactionHash
}

// // 使用示例
// try {
//     const receipt = await getReceiptInRange(client, hash, {
//         maxRange: 1500,
//         timeout: 60_000,
//         pollingInterval: 2_000,
//         retryCount: 3
//     })
//     console.log('Receipt:', receipt)
// } catch (error) {
//     console.error('Failed to get receipt:', error)
// }