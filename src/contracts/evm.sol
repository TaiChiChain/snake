// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract EVM {
    event ValEvent(uint value);

    function getBlockhash(uint number) external view returns (bytes32) {
        return blockhash(number);
    }

    function blockChainid() external view returns (uint) {
        return block.chainid;
    }

    function blockCoinbase() external view returns (address) {
        return block.coinbase;
    }

    function blockDifficulty() external view returns (uint) {
        return block.difficulty;
    }

    function blockGaslimit() external view returns (uint) {
        return block.gaslimit;
    }

    function blockNumber() external view returns (uint) {
        return block.number;
    }

    function blockTimestamp() external view returns (uint) {
        return block.timestamp;
    }

    function msgData() external pure returns (bytes calldata) {
        return msg.data;
    }

    function msgSender() external view returns (address) {
        return msg.sender;
    }

    function msgSig() external pure returns (bytes4) {
        return msg.sig;
    }

    function msgValue() external payable {
        emit ValEvent(msg.value);
    }

    function txGasprice() external payable {
        emit ValEvent(tx.gasprice);
    }

    function txOrigin() external view returns (address) {
        return tx.origin;
    }
}

contract CrossEVM {
    EVM _evm;
    constructor(address evmAddress) {
        _evm = EVM(evmAddress);
    }

    function crossMsgSender() external view returns (address) {
        return _evm.msgSender();
    }

    function crossTxOrigin() external view returns (address) {
        return _evm.txOrigin();
    }
}