// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

contract SubscribeTest {

    mapping(address => uint256) public _balances;
    event Transfer(address indexed from, address indexed to, uint256 value);

    event TestOne(string mes);
    event TestTwo(string mes);


    function transfer(
        address from,
        address to,
        uint256 amount
    ) external {
        _balances[from] = 10000000; 
        _balances[from] -=  amount; 
        _balances[to] += amount;

        emit Transfer(from, to, amount);
    }

    function testAll() public {
        emit TestOne("message test one");
        emit TestTwo("message test two");
    }

    function testEventOne() public{
        emit TestOne("message test one");
    }

    function testEventTwo() public{
        emit TestTwo("message test two");
    }
}