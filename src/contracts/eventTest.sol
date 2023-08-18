pragma solidity >=0.8.2 <0.9.0;


contract EventTest {

    event TestOne(string mes);

    event TestTwo(string mes);

    event TestThree(string mes);

    function testAll() public {
        emit TestOne("message test one");
        emit TestTwo("message test two");
        emit TestThree("message test three");
    }


    function testEventOne() public{
        emit TestOne("message test one");
    }

    function testEventTwo() public{
        emit TestTwo("message test two");
    }

    function testEventThree() public{
        emit TestThree("message test three");
    }




}