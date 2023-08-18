// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./verifier_full_SellStock.sol";
import "./verifier_full_BuyStock.sol";

contract OTC {

    //======================
    // STRUCT
    //======================

    // Stock Structure for system-level
    struct RegisteredStock {
        uint256 no;             // No of Stock in System
        string stockName;       // Name of the Stock 
    }

    // User's Stock
    struct UserStock {
        uint256 no;             // No of Stock in System
        string stockName;       // Name of the Stock
        uint amount;            // Amount of the Stock Hold by that user
    }

    // User Account
    struct Account {
        address userAddress;    // Address of the user
        string username;        // Username of user
        UserStock[] stocks;     // A list of the Stock Holde by user
        uint cashBalance;       // User's cashBalance
    }

    // Sell Order
    struct SellOrder {
        uint256 orderIndex;    // Index of the sell order
        string username;       // Username of the seller
        uint256 stockNo;       // Stock No of the selling-stock
        string stockName;      // Name of the selling-stock
        uint256 amountSell;    // Amount of the selling-stock
        uint256 price;         // Price of the selling-stock
        SellStatus status;     // Status of the sell order
    }


    //======================
    // ENUM
    //======================

    // Status of the Sell Order
    enum SellStatus {OnSell, Sold} 


    //======================
    // VARIABLES
    //======================

    // Auto-generating stock numbers
    uint256 private stockNoCounter = 0;

    // Auto-generating order index
    uint256 private orderCounter = 0;


    PlonkVerifier public sellStockVerifier;
    PlonkVerifierB public buyStockVerifier;


    constructor(address _sellStockVerifierAddress, address _buyStockVerifierAddress) {
        sellStockVerifier = PlonkVerifier(_sellStockVerifierAddress);
        buyStockVerifier = PlonkVerifierB(_buyStockVerifierAddress);
    }

    //======================
    // MODIFIER
    //======================

    modifier onlyVerifiedSellStockProof(uint256[24] calldata _proof, uint256[12] calldata _pubSignals) {
        require(verifySellStockProof(_proof, _pubSignals), "Sell stock proof verification failed");
        _;
    }

    modifier onlyVerifiedBuyStockProof(uint256[24] calldata _proof, uint256[12] calldata _pubSignals) {
        require(verifyBuyStockProof(_proof, _pubSignals), "Buy stock proof verification failed");
        _;
    }


    //======================
    // List
    //======================

    // List of Sell orders
    SellOrder[] public sellBoard;

    // A list of Registered Stock
    RegisteredStock[] private registeredStocks;


    //======================
    // Mapping
    //======================

    // accounts : maps an Ethereum address to their account details
    // Allows the system to fetch and modify a user's details when provided with their Ethereum address.
    mapping(address => Account) public accounts;

    // registeredAddress : maps an Ethereum address to a boolean value indicating whether that address has been registered or not.
    // Ensure that an Ethereum address cannot regiester more than once
    mapping(address => bool) private registeredAddress;

    // stockRegistry : maps a stock's name to its details (a "RegisteredStock" structure)
    mapping(string => RegisteredStock) private stockRegistry; // Allows lookup of a stock's details using its name

    // noToStockName : maps a stock number to its name
    mapping(uint256 => string) private noToStockName; // Allows us to find the stock name using its no.

    // usernameToaddress : map the user's username to his/her address
    mapping(string => address) private usernameToaddress;

    // orderToCashBalance : map the new Cash balance of the seller to his/her Sell Order
    mapping(uint256 => uint) public orderToCashBalance;


    //======================
    // EVENTS
    //======================

    // AccountRegistered : emitted everytime a new account is registered
    // It logs the Ethereum Address of the user and his/her username
    // indexed allow the frontend to find the username of a particular address
    event AccountRegistered(address indexed userAddress, string username);

    // StockRegistered : emitted everytime a new stock is registered
    // It logs the unique stock number and its name
    event StockRegistered(uint256 indexed stockNo, string stockName);

    // StockListForSale : emitted everytime a stock is listed on sell board
    // It logs the address of the seller, the username of the seller ,the name of stock, the amount of stock and price of the stock
    event StockListForSale(address indexed seller, string username, string stockName, uint256 amount, uint256 price);

    // StockPurchased : emitted when one user buys stock from another
    // It logs the address of buyer and seller, the username of buyer and seller, the name of stock, the amount of stock and price of the stock
    event StockPurchased(address indexed buyer, address indexed seller, string buyerUsername, string sellerUsername, string stockName, uint256 amount, uint256 price);

    // CashBalanceUpdate : emitted when user's cash balance has been updated
    // It logs the address of user and the cash balance
    event CashBalanceUpdate(address indexed userAddress, uint256 newBalance);

    // StockBalanceUpdate : emitted when user's stock balance has been updated
    // It logs the address of the user, the name of the stock, the stock balance
    event StockBalanceUpdate(address indexed userAddress, string stockName, uint256 newBalance);

    //======================
    // FUNCTIONS
    //======================

    // REGISTER FUNCTIONS
    // Function to register an user of the system
    function registerAccount(string memory _username) public {

        // Ensure that the address hasn't been regiestered before
        require(!registeredAddress[msg.sender], "Address already registered");

        // Ensure that the username hasn't been use before
        // address(0) represents that no address has been mapped to this username
        require(usernameToaddress[_username] == address(0), "Username already taken");

        // Map the username to the caller's address
        usernameToaddress[_username] = msg.sender;

        // Indicate the values of each variables
        accounts[msg.sender].userAddress = msg.sender;
        accounts[msg.sender].username = _username;
        accounts[msg.sender].cashBalance = 0;

        // Indicate that this address is already registered
        registeredAddress[msg.sender] = true;

        // emit the AccountRegistered Event
        emit AccountRegistered(msg.sender, _username);
    }

    // Function to register the stock to the system
    function registerStock(string memory _stockName) public {

        // Ensure that this stock doesn't exist in the system
        require(bytes(stockRegistry[_stockName].stockName).length == 0, "Stock name already registered");

        RegisteredStock memory newStock = RegisteredStock(stockNoCounter, _stockName);
    
        stockRegistry[_stockName] = newStock;
        noToStockName[stockNoCounter] = _stockName;
        registeredStocks.push(newStock);  // Add the new stock to the list of registered stocks


        // Increment the counter for the next stock
        stockNoCounter++;

        // Emit the StockRegistered Event
        emit StockRegistered(stockNoCounter, _stockName);
    }

    // VIEW FUNCTIONS
    // Function to view the account detail
    function viewAccount(address _user) public view returns (address ,string memory, UserStock[] memory, uint256) {
        Account storage userAccount = accounts[_user];
        return (userAccount.userAddress,userAccount.username, userAccount.stocks, userAccount.cashBalance);
    }

    // Function to view the stock details by its name
    function viewStockByName(string memory _stockName) public view returns (uint256, string memory) {
        return (stockRegistry[_stockName].no, stockRegistry[_stockName].stockName);
    }

    // Function to view stock details by its number
    function viewStockByNo(uint256 _no) public view returns (uint256, string memory) {
        string memory stockName = noToStockName[_no];
        return (stockRegistry[stockName].no, stockRegistry[stockName].stockName);
    }

    // Function to view all registered stock
    function viewAllRegisteredStock() public view returns (RegisteredStock[] memory) {
        return registeredStocks;
    }

    // Function to view the Sell orders on the sell board
    function viewAllSellOrders() public view returns (SellOrder[] memory) {
        // Create a temporary array to store sell orders with OnSell status
        SellOrder[] memory onSellOrders = new SellOrder[](sellBoard.length);
        
        // Counter to track the number of OnSell orders
        uint256 count = 0;
        
        // Loop through each order in the sellBoard
        for(uint256 i = 0; i < sellBoard.length; i++) {
            if(sellBoard[i].status == SellStatus.OnSell) {
                onSellOrders[count] = sellBoard[i];
                count++;
            }
        }

        // Create a new array with the exact length for the result
        SellOrder[] memory result = new SellOrder[](count);
        for(uint256 j = 0; j < count; j++) {
            result[j] = onSellOrders[j];
        }

        return result;
    }

    // Function to get the address of the user
    function getAddressByUsername(string memory _username) public view returns (address) {
        address userAddress = usernameToaddress[_username];
        // Ensure that the address is mapped with the username
        require(userAddress != address(0), "Username not found");
        return userAddress;
    }

    // UPDATE BALANCE FUNCTIONS
    // Function to add stock to a user's account Using stockName
    function UpdateStockBalance(string memory _stockName, uint _amount) public {

        // Ensure that this stock exist in the system
        // If the stock was never registered, its name would be the default empty string, which has a byte length of "0".
        require(bytes(stockRegistry[_stockName].stockName).length !=0, "Stock not registered in the system");

        // Fetch the user's account using their address
        Account storage userAccount = accounts[msg.sender];

        // Variable uses to check whether the user has this stock in their portfolio
        bool stockExist = false;

        // For loop to check the stock Name
        for(uint256 i = 0; i < userAccount.stocks.length; i++) {

            // Checks if the stock name in the user's account matches "_stockName".
            if(keccak256(abi.encodePacked(userAccount.stocks[i].stockName)) == keccak256(abi.encodePacked(_stockName))) {
                userAccount.stocks[i].amount = _amount;
                stockExist = true;
                break;
            }
        }

        // If the user doesn't have this stock, create a mew entry in their porfolio
        if(!stockExist) {
            UserStock memory newUserStock = UserStock({
                no: stockRegistry[_stockName].no,
                stockName: _stockName,
                amount: _amount
            });
            
            // Add the new stock to the user porfolio
            userAccount.stocks.push(newUserStock);

            emit StockBalanceUpdate(
                msg.sender,
                _stockName,
                _amount
            );
        }
    }

    // Function to add cash balance
    function UpdateCashBalance(uint _amount) public {
        require(registeredAddress[msg.sender], "Address not registered");
        accounts[msg.sender].cashBalance = _amount;

        // Emit the CashBalanceUpdate event to log the updated cash balance for the user
        emit CashBalanceUpdate(
            msg.sender,
            _amount);
    }

    // ACTION FUNCTIONS
    // Function to sell the user's stock
    function sellStock(
        string memory _stockName, 
        uint256 _amount, 
        uint256 _price, 
        uint _newCashBalance,
        uint _newStockBalance,
        uint256[24] calldata _proof,
        uint256[12] calldata _pubSignals
        ) public onlyVerifiedSellStockProof(_proof, _pubSignals) {

        // Ensure that the stock name exists in the registry
        require(bytes(stockRegistry[_stockName].stockName).length != 0, "Stock not registered in the system");
    
        // Fetch the user's account using their address
        Account storage userAccount = accounts[msg.sender];
        
        // Update the seller's stock amount directly using newStockBalance
        bool hasStock = false;

        for(uint i = 0; i < userAccount.stocks.length; i++) {
            if(keccak256(abi.encodePacked(userAccount.stocks[i].stockName)) == keccak256(abi.encodePacked(_stockName))) {
                
                // Replace the sold stock amount with the new one
                userAccount.stocks[i].amount = _newStockBalance;

                emit StockBalanceUpdate(
                    msg.sender,
                    _stockName,
                    _newStockBalance
                );

                hasStock = true;
                break;
            }
        }

        require(hasStock, "User doesn't own this stock");

        // Create the new Sell Order
        SellOrder memory newOrder = SellOrder({
            orderIndex: orderCounter,
            username: userAccount.username,
            stockNo: stockRegistry[_stockName].no,
            stockName: _stockName,
            amountSell: _amount,
            price: _price,
            status: SellStatus.OnSell
        });

        // Map the newCashBalance to the orderIndex of this SellOrder
        orderToCashBalance[newOrder.orderIndex] = _newCashBalance;

        // Add the sell order to the sell board
        sellBoard.push(newOrder);

        // Generating the order index;
        orderCounter++;

        // Emit the StockListedForSale event
        emit StockListForSale(
            msg.sender, 
            accounts[msg.sender].username, 
            _stockName, _amount, 
            _price );
    }

    // Function to buy stock
    function buyStock(
        uint256 _orderIndex , 
        uint _newBuyerCashBalance, 
        uint _newBuyerStockBalance,
        uint256[24] calldata _proof, 
        uint256[12] calldata _pubSignals 
        ) public onlyVerifiedBuyStockProof(_proof, _pubSignals) {

        // Ensure that the order index is correct
        require(_orderIndex < sellBoard.length, "Invalid order Index");
        
        // Fetch the Sell Order data
        SellOrder storage order = sellBoard[_orderIndex];

        // Ensure that the order is still available for sale
        require(order.status == SellStatus.OnSell, "Already Sold");

        // Update the order status to sold
        order.status = SellStatus.Sold;

        // Update the balance of the buy in term of Stock and Cash
        
        // Change //
        UpdateStockBalance(order.stockName, _newBuyerStockBalance);

        emit StockBalanceUpdate(
            msg.sender,
            order.stockName,
            _newBuyerStockBalance
        );

        UpdateCashBalance(_newBuyerCashBalance);

        emit CashBalanceUpdate(
            msg.sender,
            _newBuyerCashBalance
        );

        // Update the balance of the seller's cash
        // Change //
        address sellerAddress = getAddressByUsername(order.username);
        accounts[sellerAddress].cashBalance = orderToCashBalance[_orderIndex];

        emit CashBalanceUpdate(
            sellerAddress,
            orderToCashBalance[_orderIndex]
        );

        // Emit the StockPurchased event
        emit StockPurchased(
            msg.sender, 
            sellerAddress, 
            accounts[msg.sender].username, 
            accounts[sellerAddress].username, 
            order.stockName, 
            order.amountSell, 
            order.price);
    }
    

    function verifySellStockProof(uint256[24] calldata _proof, uint256[12] calldata _pubSignals) public view returns (bool) {
        return sellStockVerifier.verifyProof(_proof, _pubSignals);
    }

    function verifyBuyStockProof(uint256[24] calldata _proof, uint256[12] calldata _pubSignals) public view returns (bool) {
        return buyStockVerifier.verifyProof(_proof, _pubSignals);
    }   
}
