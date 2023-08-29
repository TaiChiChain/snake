# axiomTester

Test tools for [@axiomesh](https://github.com/axiomesh)

## Usage

Install the dependencies

```shell
npm install
```

Run the tests ✔️

```shell
npm test
PASS  src/tests/block.test.ts
✓ eth_getBlockByHash (36 ms)
✓ eth_getBlockByNumber (7 ms)
...
```

## Test RPC methods

-   `eth_getBlockByHash`
-   `eth_getBlockByNumber`

## Change RPC URL

```typescirpt
// src/utils/rpc.ts
...
export const url = "http://127.0.0.1:8881"
export const client = new Web3(url)
...
```

## Jest in vscode

just want to run single testcase, you can install [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) plugin to help you.

![jest](https://cdn.jsdelivr.net/gh/jiuhuche120/CDN/images/202307141515448.png)
