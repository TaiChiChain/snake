// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface KycVerification {
    function Submit(bytes calldata extra) external;

    function Remove(bytes calldata extra) external;
}