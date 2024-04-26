// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.20.0;

contract TestSelfDestruct {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {}

    function destroyContract(address payable _to) public {
        require(msg.sender == owner, "Only the owner can destroy this contract.");

        selfdestruct(_to);
    }

    function checkActive() public pure returns (string memory) {
        return "Contract is active";
    }
}