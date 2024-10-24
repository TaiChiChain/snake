// import * as dotenv from "dotenv";
import {describe, expect, test} from '@jest/globals'
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
import {extractAddress, runShellScript} from "../../utils/util";

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
    formatUnits,
} from "viem";
import {Address} from "abitype";
import { privateKeyToAccount } from "viem/accounts";
import {ERC20_ABI} from "axiomwallet/dist/cjs/test/abi";
import { waitForTransactionReceipt } from "viem/actions";

const axios = require('axios');
const FormData = require('form-data');
process.env.ACCOUNT_FACTORY=ST_ACCOUNT_FACTORY
process.env.GUARDIAN=ST_GUARDIAN
process.env.PAYMASTER_URL=ST_PAYMASTER_URL
process.env.BUNDLER_URL=BUNDLER_URL
process.env.ENTRY_POINT=ST_ENTRY_POINT
process.env.PAYMASTER=ST_PAYMASTER
process.env.RPC_URL=ST_URL
describe('AxiomWallet: transfer with password', () => {
    const provider = newProvider()
    const wallet = new ethers.Wallet(ST_ACCOUNT_5.privateKey, provider)
    let wETHAddress: string;
    let wUSDTAddress: string;
    let wUSDCAddress: string;
    let token: string;
    let priceFeedsAddress: string;
    let appkey: string
    let axiomWallet: AxiomWallet;
    let viemWalletClient: WalletClient;
    let viemPublicClient: PublicClient;
    let walletAddress: Address;
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


    beforeAll(async () => {
        // console.log(process.env.PAYMASTER_URL)

        //部署bundler
        console.log('Deploy bundler')
        const deployBundlerScript = path.join(
            ST_SCRIPTS_DIR,
            'deploy_bundler.sh'
        )
        await runShellScript(deployBundlerScript,"")

        //给bundler账户转钱
        const address = path.join(
            ST_DATA_DIR,
            'fetch-wallet.log'
        )
        const bundle_account = await extractAddress(address)
        let nonce = await provider.getTransactionCount(ST_ACCOUNT_5.address)
        console.log(nonce)
        if (typeof bundle_account === "string"){
            await transferAXc(wallet,  bundle_account, nonce, '1000')
        }

        //给VerifyingPaymaster的合约地址转钱
        nonce = await provider.getTransactionCount(ST_ACCOUNT_5.address)
        console.log(nonce)
        await transferAXc(wallet,  "0x000000000000000000000000000000000000100a", nonce, '1000')

        //TokenPaymaster的合约地址转钱
        nonce = await provider.getTransactionCount(ST_ACCOUNT_5.address)
        console.log(nonce)
        await transferAXc(wallet,  "0x000000000000000000000000000000000000100b", nonce, '1000')

        //部署paymaster
        console.log('Deploy paymaster')
        const deployPaymasterScript = path.join(
            ST_SCRIPTS_DIR,
            'deploy_paymaster.sh'
        )
        await runShellScript(deployPaymasterScript,"")

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
            data : data
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
                'Authorization': 'paymaster '+ token,
                ...update_data.getHeaders()
            },
            data : update_data
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
                'Authorization': 'paymaster '+ token,
                ...create_data.getHeaders()
            },
            data:create_data
        };
        const response_create = await axios.request(config_create)
        const jsonData_create = JSON.stringify(response_create.data)
        console.log(jsonData_create)
        const parsedData_appkey = JSON.parse(jsonData_create)
        appkey = parsedData_appkey.appkey
        console.log(appkey)
        process.env.PAYMASTER_APPKEY= appkey

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

        const priceTuples:[number,number,number,string,string,string,string,string][]=[
            [768828323,100000000,1712888970,"mixed","0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65","AXC","wUSDC",process.env.WUSDC],
            [769453846,100000000,1712888970,"okx","0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65","AXC","wUSDT",process.env.WUSDT],
            [2711634138923,100000000,1712888970,"mixed","0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65","AXC","wETH",process.env.WETH]
        ]
        const priceFeeds_contract = new ethers.Contract(priceFeedsAddress, priceFeeds_abi, wallet)
        //console.log('Mint 1000000000 TAXM at :', ST_ACCOUNT_5.address)
        const updatePricesReceipt = await priceFeeds_contract.updatePrices(priceTuples)
        await updatePricesReceipt.wait()
        console.log(updatePricesReceipt)


        //查询价格信息
        console.log("query price info")
        const addressTuple:[string,string,string] = [process.env.WUSDC,process.env.WUSDT,process.env.WETH]
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
        const addTokenReceipt_wUSDC = await tokenPaymaster_contract.addToken(process.env.WUSDC,priceFeedsAddress)
        await addTokenReceipt_wUSDC.wait()
        console.log(addTokenReceipt_wUSDC)

        console.log("Token paymaster ========> wUSDT")
        const addTokenReceipt_wUSDT = await tokenPaymaster_contract.addToken(process.env.WUSDT,priceFeedsAddress)
        await addTokenReceipt_wUSDT.wait()
        console.log(addTokenReceipt_wUSDT)

        console.log("Token paymaster ========> wETH")
        const addTokenReceipt_wETH = await tokenPaymaster_contract.addToken(process.env.WETH,priceFeedsAddress)
        await addTokenReceipt_wETH.wait()
        console.log(addTokenReceipt_wETH)

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


        axiomWallet = await AxiomWallet.fromPassword("12345", "12345", "0", ST_URL, BUNDLER_URL);
        walletAddress = await axiomWallet.getAddress();

        const axcFundingTransaction = await viemWalletClient.sendTransaction({
            account: eoa,
            chain: axiomesh,
            to: walletAddress,
            value: parseEther("100"),
        });
        await waitForTransactionReceipt(viemPublicClient, {
            hash: axcFundingTransaction,
        });

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
        await waitForTransactionReceipt(viemPublicClient, {
            hash: erc20FundingTransaction_weth,
        });
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
        await waitForTransactionReceipt(viemPublicClient, {
            hash: erc20FundingTransaction_wusdc,
        });

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
        await waitForTransactionReceipt(viemPublicClient, {
            hash: erc20FundingTransaction_wusdt,
        });

    })

    test.only("funding wallet with 100 AXC and 100 WETH", async () => {
        const axcBalance = await viemPublicClient.getBalance({
            address: walletAddress,
        });
        expect(axcBalance).toEqual(parseEther("100"));

        // @ts-ignore
        const weth = await getContract({
            address: process.env.WETH as Address,
            abi: ERC20_ABI,
            client: viemWalletClient,
        });

        const wethBalance = await weth.read.balanceOf([walletAddress]);
        expect(wethBalance).toEqual(parseUnits("100", await weth.read.decimals()));

        // @ts-ignore
        const wusdc = await getContract({
            address: process.env.WUSDC as Address,
            abi: ERC20_ABI,
            client: viemWalletClient,
        });

        const wusdcBalance = await wusdc.read.balanceOf([walletAddress]);
        expect(wusdcBalance).toEqual(parseUnits("100", await wusdc.read.decimals()));

        // @ts-ignore
        const wusdt = await getContract({
            address: process.env.WUSDT as Address,
            abi: ERC20_ABI,
            client: viemWalletClient,
        });

        const wusdtBalance = await wusdt.read.balanceOf([walletAddress]);
        expect(wusdtBalance).toEqual(parseUnits("100", await wusdt.read.decimals()));
    });

    test("estimate gas of AXC transfer", async () => {
        const gasEstimated = await axiomWallet.estimateTransfer(
            "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            parseEther("1")
        );
        console.log(
            `AXC transfer gas estimated: ${formatGwei(
                gasEstimated!
            )} Gwei ${formatEther(gasEstimated!)} AXC`
        );
        expect(gasEstimated).not.toEqual(BigInt(0));
    });

    test("transfer AXC", async () => {
        const axcBalanceBefore = await viemPublicClient.getBalance({
            address: walletAddress,
        });
        console.log(axcBalanceBefore)

        const transactionHash = await axiomWallet.transfer(
            "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            parseEther("1")
        );
        const axcBalanceAfter = await viemPublicClient.getBalance({
            address: walletAddress,
        });
        console.log(axcBalanceAfter)
        expect(transactionHash).not.toEqual(zeroHash);
        expect(axcBalanceBefore).toBeGreaterThan(axcBalanceAfter + parseEther("1"));

        // const receipt = await waitForTransactionReceipt(viemPublicClient,{hash:transactionHash as "0x${string}"})
        //
        // // const receipt_data = JSON.parse(receipt)
        // const gasUsed = receipt.gasUsed
        // console.log(gasUsed)
        // const gasPrice = receipt.effectiveGasPrice
        // console.log(gasPrice)
        // const gas = gasPrice * gasUsed
        // console.log(gas)
        // expect(axcBalanceBefore).toEqual(axcBalanceAfter + parseEther("1") + gas);

    });

    test.only("Can estimate gas of batch AXC transfer", async () => {
        const gasEstimated = await axiomWallet.estimateTransfer(
            [
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            ],
            [parseEther("1"), parseEther("1")]
        );
        console.log(
            `Batched AXC transfer gas estimated: ${formatGwei(
                gasEstimated!
            )} Gwei ${formatEther(gasEstimated!)} AXC`
        );
        expect(gasEstimated).not.toEqual(BigInt(0));
    });

    test.only("Can transfer AXC in batches", async () => {
        const axcBalanceBefore = await viemPublicClient.getBalance({
            address: walletAddress,
        });
        const transactionHash = await axiomWallet.transfer(
            [
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            ],
            [parseEther("1"), parseEther("1")]
        );
        const axcBalanceAfter = await viemPublicClient.getBalance({
            address: walletAddress,
        });
        expect(transactionHash).not.toEqual(zeroHash);
        expect(axcBalanceBefore).toBeGreaterThan(axcBalanceAfter + parseEther("2"));
    });

    test.only("Can estimate gas of erc20-WETH transfer", async () => {
        // @ts-ignore
        const weth = await getContract({
            address: process.env.WETH as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const gasEstimated = await axiomWallet.estimateErc20Transfer(
            weth.address,
            "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            parseUnits("1", await weth.read.decimals())
        );
        console.log(
            `Erc-20 transfer gas estimated: ${formatGwei(
                gasEstimated!
            )} Gwei ${formatEther(gasEstimated!)} AXC`
        );
        expect(gasEstimated).not.toEqual(BigInt(0));
    });

    test.only("Can transfer erc20-WETH", async () => {
        // @ts-ignore
        const weth = await getContract({
            address: process.env.WETH as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const wethBalanceBefore = await weth.read.balanceOf([walletAddress]);
        console.log(
            `wethBalanceBefore: ${formatUnits(
                wethBalanceBefore,
                await weth.read.decimals()
            )} WETH`
        );
        const transactionHash = await axiomWallet.transferErc20(
            weth.address,
            "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            parseUnits("1", await weth.read.decimals())
        );
        expect(transactionHash).not.toEqual(zeroHash);
        const wethBalanceAfter = await weth.read.balanceOf([walletAddress]);
        console.log(
            `wethBalanceAfter: ${formatUnits(
                wethBalanceAfter,
                await weth.read.decimals()
            )} WETH`
        );
        expect(wethBalanceBefore).toBeGreaterThan(
            wethBalanceAfter + parseUnits("1", await weth.read.decimals())
        );
    });

    test.only("estimate gas of batch erc20-WETH transfer", async () => {
        // @ts-ignore
        const weth = await getContract({
            address: process.env.WETH as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const gasEstimated = await axiomWallet.estimateErc20Transfer(
            weth.address,
            [
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            ],
            [
                parseUnits("1", await weth.read.decimals()),
                parseUnits("1", await weth.read.decimals()),
            ]
        );
        console.log(
            `Erc-20 transfer gas estimated: ${formatGwei(
                gasEstimated!
            )} Gwei ${formatEther(gasEstimated!)} AXC`
        );
        expect(gasEstimated).not.toEqual(BigInt(0));
    });

    test.only("Can transfer erc20-WETH in batches", async () => {
        // @ts-ignore
        const weth = await getContract({
            address: process.env.WETH as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const wethBalanceBefore = await weth.read.balanceOf([walletAddress]);
        console.log(
            `wethBalanceBefore: ${formatUnits(
                wethBalanceBefore,
                await weth.read.decimals()
            )} WETH`
        );
        const transactionHash = await axiomWallet.transferErc20(
            weth.address,
            [
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            ],
            [
                parseUnits("1", await weth.read.decimals()),
                parseUnits("1", await weth.read.decimals()),
            ]
        );
        expect(transactionHash).not.toEqual(zeroHash);
        const wethBalanceAfter = await weth.read.balanceOf([walletAddress]);
        console.log(
            `wethBalanceAfter: ${formatUnits(
                wethBalanceAfter,
                await weth.read.decimals()
            )} WETH`
        );
        expect(wethBalanceBefore).toBeGreaterThan(
            wethBalanceAfter + parseUnits("2", await weth.read.decimals())
        );
    });

    test.only("estimate gas of erc20-wUSDC transfer", async () => {
        // @ts-ignore
        const wusdc = await getContract({
            address: process.env.WUSDC as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const gasEstimated = await axiomWallet.estimateErc20Transfer(
            wusdc.address,
            "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            parseUnits("1", await wusdc.read.decimals())
        );
        console.log(
            `Erc-20 transfer gas estimated: ${formatGwei(
                gasEstimated!
            )} Gwei ${formatEther(gasEstimated!)} AXC`
        );
        expect(gasEstimated).not.toEqual(BigInt(0));
    });

    test.only("Can transfer erc20-WUSDC", async () => {

        // @ts-ignore
        const wusdc = await getContract({
            address: process.env.WUSDC as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        })


        const wusdcBalanceBefore = await wusdc.read.balanceOf([walletAddress]);
        console.log(
            `wusdcBalanceBefore: ${formatUnits(
                wusdcBalanceBefore,
                await wusdc.read.decimals()
            )} WUSDC`
        );
        const transactionHash = await axiomWallet.transferErc20(
            wusdc.address,
            "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            parseUnits("1", await wusdc.read.decimals())
        );
        expect(transactionHash).not.toEqual(zeroHash);
        const wusdcBalanceAfter = await wusdc.read.balanceOf([walletAddress]);
        console.log(
            `wusdcBalanceAfter: ${formatUnits(
                wusdcBalanceAfter,
                await wusdc.read.decimals()
            )} WUSDC`
        );
        expect(wusdcBalanceBefore).toBeGreaterThan(
            wusdcBalanceAfter + parseUnits("1", await wusdc.read.decimals())
        );
    });

    test.only("estimate gas of batch erc20-WUSDC transfer", async () => {
        // @ts-ignore
        const wusdc = await getContract({
            address: process.env.WUSDC as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const gasEstimated = await axiomWallet.estimateErc20Transfer(
            wusdc.address,
            [
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            ],
            [
                parseUnits("1", await wusdc.read.decimals()),
                parseUnits("1", await wusdc.read.decimals()),
            ]
        );
        console.log(
            `Erc-20 transfer gas estimated: ${formatGwei(
                gasEstimated!
            )} Gwei ${formatEther(gasEstimated!)} AXC`
        );
        expect(gasEstimated).not.toEqual(BigInt(0));
    });

    test.only("Can transfer erc20-WUSDC in batches", async () => {
        // @ts-ignore
        const wusdc = await getContract({
            address: process.env.WUSDC as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const wusdcBalanceBefore = await wusdc.read.balanceOf([walletAddress]);
        console.log(
            `wusdcBalanceBefore: ${formatUnits(
                wusdcBalanceBefore,
                await wusdc.read.decimals()
            )} WUSDC`
        );
        const transactionHash = await axiomWallet.transferErc20(
            wusdc.address,
            [
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            ],
            [
                parseUnits("1", await wusdc.read.decimals()),
                parseUnits("1", await wusdc.read.decimals()),
            ]
        );
        expect(transactionHash).not.toEqual(zeroHash);
        const wusdcBalanceAfter = await wusdc.read.balanceOf([walletAddress]);
        console.log(
            `wusdcBalanceAfter: ${formatUnits(
                wusdcBalanceAfter,
                await wusdc.read.decimals()
            )} WUSDC`
        );
        expect(wusdcBalanceBefore).toBeGreaterThan(
            wusdcBalanceAfter + parseUnits("2", await wusdc.read.decimals())
        );
    });

    test.only("estimate gas of erc20-wUSDT transfer", async () => {
        // @ts-ignore
        const wusdt = await getContract({
            address: process.env.WUSDT as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const gasEstimated = await axiomWallet.estimateErc20Transfer(
            wusdt.address,
            "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            parseUnits("1", await wusdt.read.decimals())
        );
        console.log(
            `Erc-20 transfer gas estimated: ${formatGwei(
                gasEstimated!
            )} Gwei ${formatEther(gasEstimated!)} AXC`
        );
        expect(gasEstimated).not.toEqual(BigInt(0));
    });

    test.only("Can transfer erc20-WUSDT", async () => {

        // @ts-ignore
        const wusdt = await getContract({
            address: process.env.WUSDT as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        })


        const wusdtBalanceBefore = await wusdt.read.balanceOf([walletAddress]);
        console.log(
            `wusdtBalanceBefore: ${formatUnits(
                wusdtBalanceBefore,
                await wusdt.read.decimals()
            )} WUSDT`
        );
        const transactionHash = await axiomWallet.transferErc20(
            wusdt.address,
            "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            parseUnits("1", await wusdt.read.decimals())
        );
        expect(transactionHash).not.toEqual(zeroHash);
        const wusdtBalanceAfter = await wusdt.read.balanceOf([walletAddress]);
        console.log(
            `wusdtBalanceAfter: ${formatUnits(
                wusdtBalanceAfter,
                await wusdt.read.decimals()
            )} WUSDT`
        );
        expect(wusdtBalanceBefore).toBeGreaterThan(
            wusdtBalanceAfter + parseUnits("1", await wusdt.read.decimals())
        );
    });

    test.only("estimate gas of batch erc20-WUSDT transfer", async () => {
        // @ts-ignore
        const wusdt = await getContract({
            address: process.env.WUSDT as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const gasEstimated = await axiomWallet.estimateErc20Transfer(
            wusdt.address,
            [
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            ],
            [
                parseUnits("1", await wusdt.read.decimals()),
                parseUnits("1", await wusdt.read.decimals()),
            ]
        );
        console.log(
            `Erc-20 transfer gas estimated: ${formatGwei(
                gasEstimated!
            )} Gwei ${formatEther(gasEstimated!)} AXC`
        );
        expect(gasEstimated).not.toEqual(BigInt(0));
    });

    test.only("Can transfer erc20-WUSDT in batches", async () => {
        // @ts-ignore
        const wusdt = await getContract({
            address: process.env.WUSDT as Address,
            abi: ERC20_ABI,
            client: viemPublicClient,
        });
        const wusdtBalanceBefore = await wusdt.read.balanceOf([walletAddress]);
        console.log(
            `wusdtBalanceBefore: ${formatUnits(
                wusdtBalanceBefore,
                await wusdt.read.decimals()
            )} WUSDT`
        );
        const transactionHash = await axiomWallet.transferErc20(
            wusdt.address,
            [
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
                "0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013",
            ],
            [
                parseUnits("1", await wusdt.read.decimals()),
                parseUnits("1", await wusdt.read.decimals()),
            ]
        );
        expect(transactionHash).not.toEqual(zeroHash);
        const wusdtBalanceAfter = await wusdt.read.balanceOf([walletAddress]);
        console.log(
            `wusdtBalanceAfter: ${formatUnits(
                wusdtBalanceAfter,
                await wusdt.read.decimals()
            )} WUSDT`
        );
        expect(wusdtBalanceBefore).toBeGreaterThan(
            wusdtBalanceAfter + parseUnits("2", await wusdt.read.decimals())
        );
    });

})