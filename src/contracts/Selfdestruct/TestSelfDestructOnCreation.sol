// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.20.0;

contract TestSelfDestructOnCreation {
    constructor(address payable _recipient) {
        selfdestruct(_recipient);
    }
}