// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract PriceFeeds {
    struct TickerInfo {
        uint256 price;
        uint256 decimals;
        uint256 timestamp;
        string source;
        address sender;
        string currency;
        string ticker;
        address tickerAddress;
    }

    mapping(address => TickerInfo) public prices;

    address public owner;

    mapping(address => bool) public whitelist;

    uint256 public maxArrayLength = 1000;  // 默认值
    uint256 public maxTickersLength = 20;  // 默认值

    event PriceUpdated(address indexed sender, uint256 timestamp, uint updateNums);

    constructor() {
        owner = msg.sender;
        whitelist[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Caller is not in the whitelist.");
        _;
    }

    function addToWhitelist(address _address) public onlyOwner {
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) public onlyOwner {
        whitelist[_address] = false;
    }

    function setMaxArrayLength(uint256 _maxArrayLength) public onlyOwner {
        maxArrayLength = _maxArrayLength;
    }

    function setMaxTickersLength(uint256 _maxTickersLength) public onlyOwner {
        maxTickersLength = _maxTickersLength;
    }

    function updatePrices(TickerInfo[] memory _TickerInfos) public onlyWhitelisted {
        require(_TickerInfos.length <= maxArrayLength, "Input array exceeds maximum length");

        for(uint i = 0; i < _TickerInfos.length; i++) {
            TickerInfo memory info = _TickerInfos[i];
            prices[info.tickerAddress] = TickerInfo({
            price: info.price,
            decimals: info.decimals,
            timestamp: info.timestamp,
            source: info.source,
            sender: msg.sender,
            currency: info.currency,
            ticker: info.ticker,
            tickerAddress: info.tickerAddress
            });
        }
        emit PriceUpdated(msg.sender, block.timestamp, _TickerInfos.length);
    }

    function getTickerInfos(address[] memory _tickerAddresses) public view returns (TickerInfo[] memory) {
        require(_tickerAddresses.length <= maxTickersLength, "Input array exceeds maximum length");

        TickerInfo[] memory infos = new TickerInfo[](_tickerAddresses.length);
        for (uint i = 0; i < _tickerAddresses.length; i++) {
            TickerInfo storage info = prices[_tickerAddresses[i]];
            infos[i] = info;
        }
        return infos;
    }

    function getTokenValueOfAXC(address _tickerAddress, uint256 _amount) public view returns (uint256) {
        // info.price is AXC standard
        TickerInfo storage info = prices[_tickerAddress];
        require(info.price > 0, "Price must be greater than zero");
        // _amount is amount of AXC, which is 18 decimal
        // and price is 8 decimal, which means the return res is 10 decimal
        return _amount / info.price ;
    }

    function changeOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }
}