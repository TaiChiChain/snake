// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract WUSDT is ERC20, ERC20Permit {
    constructor() ERC20("wUSDT", "wUSDT") ERC20Permit("wUSDT") {}

    function mint(address account, uint256 value) public {
        _mint(account, value);
    }

    function decimals() public override  view virtual returns (uint8) {
        return 6;
    }

    receive() external payable{
    }

    fallback() external payable {
    }
}
