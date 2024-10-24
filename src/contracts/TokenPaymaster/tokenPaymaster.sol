// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface TokenPaymaster {

    function addToken(address token, address oracle) external;

    function getToken(address token) external view returns (address);
}