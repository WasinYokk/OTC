// Imports the expect function from the Chai assertion library //
// Used for writing test assertions, which are checks that validate the behavior of your code. // 
const { expect } = require("chai");
const { done } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("OTC", function() {
    let PlonkVerifier;
    let PlonkVerifierB;
    let OTC;
    let plonkVerifierContract;
    let plonkVerifierBContract;
    let otcContract;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function() {
        // Get the ContractFactory and Signers here
        PlonkVerifier = await ethers.getContractFactory("PlonkVerifier");
        PlonkVerifierB = await ethers.getContractFactory("PlonkVerifierB");
        OTC = await ethers.getContractFactory("OTC");

        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // Deploy the dependent contracts first
        plonkVerifierContract = await PlonkVerifier.deploy();
        await plonkVerifierContract.deployed();

        plonkVerifierBContract = await PlonkVerifierB.deploy();
        await plonkVerifierBContract.deployed();

        // Deploy the OTC contract with the addresses of the deployed dependent contracts
        otcContract = await OTC.deploy(plonkVerifierContract.address, plonkVerifierBContract.address);
        await otcContract.deployed();
    });

    async function userFixture() {

        const proof = ["0x020753792ac84cc01f82b6c4763eecbd08641fd5cc84f1ec0cb6d0c5bd32d77e", 
        "0x1814ce2354c22fcd479465863d8dd50cfc629ef4bdb18413f9678357ef189b8f",
        "0x08363b45399acb745181970c37f34b09ff8ff952157d013c256ecd4e01de134c",
        "0x02f636fa6e004a27432dc7d93c0e0d9078764cca4807757a9af7eda22c616b28",
        "0x13d5f59ba0f58be8c42ba052b231cd9e5eb98c0f758cc8059d6223b9af8ba35f",
        "0x0c2aa68a4c264dfc56bd4ec8be8a1d983dabd4143afcf8d7e84994262d0f3cb4",
        "0x1769eab87e7d531b99493b5d2106366caaee5e59fc9a6f17b15b8b0efb7e5481",
        "0x2352a00e21d2d5c964215e626b9736cc78cbc8cf36c1fd03a6623a1c17fec475",
        "0x05a58db6f913c134c2f86b3b93ddfc651ec040ca9b00ebd619a18922bd7cb8fa",
        "0x202d813d75b1dbb60b1cf2f3a1b911816b6bc23d31dd4ac1f863f12942f4963f",
        "0x2ed919ec5d029fe3ea6b7236be2b6afa89ab016ddf2438e8e2ef48b7a65d7820",
        "0x079adab5767b3c6e27d5fc7ea13f742315ab4334414478e525c8456327681576",
        "0x1fa52b58fa8276c8d2991cff7815ed0713cff7b099e7a60e302070109012dc4f",
        "0x24b90aa93a193b9757c0d46024c5936b1162b836958400718cb51f4af718d827",
        "0x230c87cfcaa1584527e4a3719b12d55f41288fab4e516e68a6ffd02511975bd4",
        "0x185e20d3385bf3e9455d0095a52a4ff5fd2f67e655d482e7c68a14c79e83de56",
        "0x1d82ddaafa64fd96e02b444308da6e1f96b4db69210d0b5aa6065b82bb4e39ef",
        "0x1b7674fa1f36485422491359eb954937154f67abd7d6d4fdd402db7343285d73",
        "0x1dd4fb623ea26731c19d7e32f7beb32dad4f0f081be93fb232f0c20852c2d925",
        "0x283c0ab01d04f1b15ec268205f44b0b9b7fd0a9a0bffd347b98c9cdfc078384c",
        "0x058d9deb669ecf3f6c4f6407fb5a0f39744076e77f16476e68736afb39a22805",
        "0x12c749793593aaccf30892e30ecb5174f0e92b86a74961c4d387f8083341ef3e",
        "0x0fc00db6e08b33336627f7ee401e8375c636a98e145058b13827bc0acd3f2050",
        "0x251652f1297ef2d97bf802fae39ddc12d8b25e1f35a737f266de91bcd1642367"]

        const public = ["0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x1ac4b22831d74193fe5f4371b7701d6a0f3ff7294a8bcc81242722dde1dd27fc",
        "0x093a6cbb8fe9a2c1a55a14f2fd3cb03ac44429cd61a4dbb85af41a124a631b53",
        "0x2b60bf8caa91452f000be587c441f6495f36def6fc4c36f5cc7b5d673f59fd0f",
        "0x2b3e9dc2791eef7bc319dff7a80b6e2d4b21f8c787c1e5bd2c9cd1f839fb2625",
        "0x000000000000000000000000000000000000000000000000000000000000000a",
        "0x0000000000000000000000000000000000000000000000000000000000000001"]

        const buyProof = ["0x1fdcc9da924460f269707653936c96b6b35c965b50baf1dfffd0b03697f95e11", 
        "0x1ce398bc871a86335ffbcbc1c362b3305aa4386a38b29fce2d308b1f19bb10d2",
        "0x0652ba38fbb7f2d1c53a9ba7ec62b175bd2ff4fa94276c10954df3bc4e7220ce",
        "0x0bf18978f99d20b7b697a8b9f3c4bfeeb11fcc479835bb1b9f6df47df9148b2d",
        "0x24d10617f6063557692c3d1f4e47d2fb4d4598b0ca84adaefef4082fb834d154",
        "0x0024cf697dcc642a4b47e0f177287dfe2904a4d518ab18d4e8fcc3d09e532657",
        "0x1ee4ad1f19b3f5983bc31fa3078631b5ade62e0eb4bb7e181e3b3daa94fcc2cc",
        "0x011472c8bd40756e0d2fe62623c444b1319a0bb29a4b44e41362f7b750f24665",
        "0x2e108dcc3c3ff67cf919c6f52eb51f583af2f9546e1cdd7bda8fc7edc41f732b",
        "0x136e94b15bf1f47993a1b3523650077b161c9f619a79d93655abab362919ef11",
        "0x222e3a111d2cfd010739583b92b049da394897785341f61b0453ec6f815e76ba",
        "0x298abceaaaee7c4c1d7071a4d2c9b52317ff21d10ac6686fc73254ff76eb36eb",
        "0x228358bf2d44cf94a1646215520333f8edd6d6581946f7ae586252094872e5c8",
        "0x03c88469f2ea16bff7c133e0d6bee4e5ec1dc039846969e824fc878767bc03b8",
        "0x28d5e13037a1d5b359e7e5e83ed7727eb586b74f5393b418711d21f6ded12b8a",
        "0x137e2a8a791cbb88f7e69bbb15b92fa3fbcd35b43d9a4b03157209138f063202",
        "0x2de8c3f53003c233d3729cd9793108d51291ef38c35781ad03a6aa71b319a83c",
        "0x105e6e40306e0a3d0cea4d7db3bdb2a16a784cd50813a2f58e3617501d44ebf2",
        "0x27d4a74a9a4806cf8a7d6817a2857eadf6825ca6892d85a164249f7d3782d750",
        "0x2255646f8388c8ceb7bc220a60f5b361da71bf5982db409b3720efb8863a6fa6",
        "0x26db962acc40df12a2bb94d6de9333c4ceadf4f433e7f3e1738de6303b20b7d4",
        "0x26715501a81477b84f2fc579ebd2889a8f11d7c088b035d7368198ada394b9b6",
        "0x1bb8ba2efbff7c5b0fd486e26a4924c9b16777f9ec9f1a6cc0d4da0a944ba25b",
        "0x240ac7b9d7fafd71056638553078521e0dd8431d2c8e5b2c26d6d2ef9bf255b0"]

        const buyPublic = ["0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x1a8373e15b8a8d74ce22ea28ccbb97b3507ddd65fffb28a592434bb327c25840",
        "0x2114ebac543e5650f55898d21c53b2991158cea830103ca2f783b6781206ac2d",
        "0x2b60bf8caa91452f000be587c441f6495f36def6fc4c36f5cc7b5d673f59fd0f",
        "0x202bf3d2ebbb49531c03e1addbb355fda96f67b95c5324ddd718d477cc5be3a3",
        "0x000000000000000000000000000000000000000000000000000000000000000a",
        "0x0000000000000000000000000000000000000000000000000000000000000001"]

        // const invalidProof = 

        // const invalidPublic = 
        
        return {proof, public};
    }

    it("Should initialize OTC contract with correct Verifier addresses", async function() {
        expect(await otcContract.sellStockVerifier()).to.equal(plonkVerifierContract.address);
        expect(await otcContract.buyStockVerifier()).to.equal(plonkVerifierBContract.address);

        console.log("plonkVerifierContract's address:",plonkVerifierContract.address);
        console.log("plonkVerifierBContract's address:",plonkVerifierBContract.address);
        console.log("otcContract's address:",otcContract.address);
        console.log("owner's address:",owner.address);
        console.log("addr1's address:",addr1.address);
        console.log("addr2's address:",addr2.address);
        console.log("addr3's address:",addr3.address);
    });

    // .to.be.true                   checks if the given expression evaluates to the boolean value true.
    // .to.be.false                  checks if the expression evaluates to the boolean value false
    // .to.be.revertWith             checks if a transaction was reverted and if the reason for its failure matches the provided string.
    // .to.equal                     checks if the given expression is equal to value.
    // .to.exist                     checks if the target is neither null nor undefined.
    // .to.be.an('type')             checks if the target's type is the given string, e.g., .to.be.an('array').
    // .to.have.lengthOf(value)      checks if the length property of an object, useful for arrays or strings.
    // .to.be.above(value)           checks if the target is greater than value.
    // .to.be.below(value)           checks if the target is less than value.
    // .to.be.instanceOf(Object)     checks if the target is an instance of Object.
    // .to.be.reverted               checks if a transaction was reverted, without checking the specific revert reason.

    //============================
    // registerAccount Function
    //============================

    describe("registerAccount", function() {
        it("Should register an account successfully", async function() {
            await otcContract.connect(addr1).registerAccount("username1");
            expect(await otcContract.registeredAddress(addr1.address)).to.be.true; 
            expect(await otcContract.usernameToaddress("username1")).to.equal(addr1.address);

            console.log("Show Confirm");
            console.log(await otcContract.usernameToaddress("username1"));
            console.log(addr1.address);
        });

        it("Should emit AccountRegistered event with correct details", async function() {
            const tx = await otcContract.connect(addr1).registerAccount("username1");
            await expect(tx).to.emit(otcContract, 'AccountRegistered').withArgs(addr1.address, "username1");
        });
    
        it("Should set initial cash balance to 0 for new accounts", async function() {
            await otcContract.connect(addr1).registerAccount("username1");
            const accountDetails = await otcContract.accounts(addr1.address);
            expect(accountDetails.cashBalance).to.equal(0);
        });
    
        it("Shouldn't allow duplicate address registration", async function() {
            await otcContract.connect(addr1).registerAccount("username1");
            await expect(otcContract.connect(addr1).registerAccount("username2")).to.be.revertedWith("Address already registered");
        });
    
        it("Shouldn't allow duplicate username registration", async function() {
            await otcContract.connect(addr1).registerAccount("username1");
            await expect(otcContract.connect(addr2).registerAccount("username1")).to.be.revertedWith("Username already taken");
        });

    });

    //============================
    // registerStock Function
    //============================

    describe("registerStock", function() {
        it("Should register a stock successfully", async function() {
            await otcContract.connect(owner).registerStock("Apple");
            expect(await otcContract.stockRegistry("Apple")).to.exist;
            expect(await otcContract.noToStockName(0)).to.equal("Apple");
        });

        it("Shouldn't allow non-owners to register a stock", async function() {
            await expect(otcContract.connect(addr1).registerStock("Google")).to.be.revertedWith("Not authorized. Only the owner can call this.");
        });
        

        it("Shouldn't allow duplicate stock registration", async function() {
            await otcContract.registerStock("Apple");
            await expect(otcContract.registerStock("Apple")).to.be.revertedWith("Stock name already registered");
        });

        it("Should emit StockRegistered event with correct details", async function() {
            const tx = await otcContract.connect(owner).registerStock("Apple");
            await expect(tx).to.emit(otcContract, 'StockRegistered').withArgs(0, "Apple"); 
        });
    
        it("Should increment stockNoCounter correctly", async function() {
            await otcContract.connect(owner).registerStock("Apple");
            const stockCounter = await otcContract.stockNoCounter();
            expect(stockCounter).to.equal(1); 
        });

    });

    //============================
    // View Function
    //============================

    describe("View Functions", function() {
    
        beforeEach(async function() {
            // Assuming registration of accounts and stocks before each test for fresh start
            await otcContract.connect(addr1).registerAccount("username1");
            await otcContract.connect(owner).registerStock("Apple");
            await otcContract.connect(owner).registerStock("Microsoft");
        });
    
        it("Should correctly view an account's details", async function() {
            const [address, username, stocks, balance] = await otcContract.viewAccount(addr1.address);
            expect(address).to.equal(addr1.address);
            expect(username).to.equal("username1");
            expect(balance).to.equal(0);

            console.log( await otcContract.viewAccount(addr1.address));
        });
    
        it("Should correctly view a stock's details by its name", async function() {
            const [no, stockName] = await otcContract.viewStockByName("Apple");
            expect(no).to.equal(0);  
            expect(stockName).to.equal("Apple");
            console.log( await otcContract.viewStockByName("Apple"));
        });
    
        it("Should correctly view a stock's details by its number", async function() {
            const [no, stockName] = await otcContract.viewStockByNo(1); 
            expect(no).to.equal(1);
            expect(stockName).to.equal("Microsoft");

            console.log( await otcContract.viewStockByNo(1));
        });
    
        it("Should list all registered stocks", async function() {
            const stocks = await otcContract.viewAllRegisteredStock();
            console.log(stocks);
            expect(stocks.length).to.equal(2);
            expect(stocks[0].stockName).to.equal("Apple");
            expect(stocks[1].stockName).to.equal("Microsoft");
        });
    });

    // ============================
    // UpdateStockBalance Function
    // ============================

    describe("UpdateStockBalance", function() {

        beforeEach(async function() {
            // Register a user and a stock for testing
            await otcContract.connect(addr1).registerAccount("username1");
            await otcContract.connect(owner).registerStock("Apple");
            await otcContract.connect(owner).registerStock("Microsoft");
        });

        it("Should update the stock balance for a registered stock", async function() {
            await otcContract.connect(addr1).UpdateStockBalance("Apple", 50);

            const first = await otcContract.connect(addr1).getUserStockCount();
            expect(first).to.be.equal(1);

            const stockbalance = await otcContract.connect(addr1).viewUserStockBalance("Apple");
            expect(stockbalance).to.be.equal(50);
            
        });
        
        it("Should add the stock to the user's portfolio if not exist", async function() {
            await otcContract.connect(addr1).UpdateStockBalance("Apple", 50);
            
            const account = await otcContract.viewAccount(addr1.address);
            //console.log(account);

            const first = await otcContract.connect(addr1).getUserStockCount();
            expect(first).to.be.equal(1);

            await otcContract.connect(addr1).UpdateStockBalance("Microsoft", 100);

            const second = await otcContract.connect(addr1).getUserStockCount();
            expect(second).to.be.equal(2);

            const stockbalance = await otcContract.connect(addr1).viewUserStockBalance("Microsoft");
            const stockbalance2 = await otcContract.connect(addr1).viewUserStockBalance("Apple");
            expect(stockbalance).to.be.equal(100);
            expect(stockbalance2).to.be.equal(50);

            const account2 = await otcContract.viewAccount(addr1.address);
            //console.log(account2);
        });

        it("Should update the stock balance for a exist stock", async function() {
            await otcContract.connect(addr1).UpdateStockBalance("Apple", 50);
            
            const account = await otcContract.viewAccount(addr1.address);
            //console.log(account);

            const first = await otcContract.connect(addr1).getUserStockCount();
            expect(first).to.be.equal(1);

            const stockbalance = await otcContract.connect(addr1).viewUserStockBalance("Apple");
            expect(stockbalance).to.be.equal(50);

            await otcContract.connect(addr1).UpdateStockBalance("Apple", 100);

            const second = await otcContract.connect(addr1).getUserStockCount();
            expect(second).to.be.equal(1);

            const stockbalance2 = await otcContract.connect(addr1).viewUserStockBalance("Apple");
            
            expect(stockbalance2).to.be.equal(100);

            const account2 = await otcContract.viewAccount(addr1.address);
            //console.log(account2);
        });

        
        it("Should revert for non-registered stock", async function() {
            await expect(otcContract.connect(addr1).UpdateStockBalance("Samsung", 100)).to.be.revertedWith("Stock not registered with the system");
        });

        // Should thrw an error since our funtion design to get one input from the user they only need to provide the amount. The address of the target account our function get from the msg.sender
        it("Shouldn't allow other users to update another user's stock balance", async function() {
            await otcContract.connect(addr2).registerAccount("username2");
            await expect(otcContract.connect(addr2).UpdateStockBalance(addr1.address, "Apple", 150)).to.be.revertedWith("Not authorized");
        });

        // // Should throw an error since our contract design that the cashbalance need to be uint. Unit does not support a minus value
        // it("Should revert if trying to set negative stock balance", async function() {
        //     await expect(otcContract.connect(addr1).UpdateStockBalance("Apple", -50)).to.be.revertedWith("Invalid stock amount");
        // });
        
        
        it("Should emit StockBalanceUpdate event with correct details", async function() {
            const tx = await otcContract.connect(addr1).UpdateStockBalance("Apple", 100);
            await expect(tx).to.emit(otcContract, 'StockBalanceUpdate').withArgs(addr1.address, "Apple", 100);
        });
    });

    // ============================
    // UpdateCashBalance Function
    // ============================

    describe("UpdateCashBalance", function() {

        beforeEach(async function() {
            // Assuming registration of accounts and stocks before each test for fresh start
            await otcContract.connect(addr1).registerAccount("username1");
        });

        it("Should update the cash balance for a registered user", async function() {
            await otcContract.connect(addr1).UpdateCashBalance(1000);

            const account = await otcContract.connect(addr1).viewAccountBalance();
            //console.log("accountBalance:",account);
            expect(account).to.equal(1000);
        });

        // Should throw an error since our funtion design to get one input from the user they only need to provide the amount. The address of the target account our function get from the msg.sender
        it("Shouldn't allow other users to update another user's cash balance", async function() {
            await expect(otcContract.connect(addr2).UpdateCashBalance(addr1.address, 1000)).to.be.revertedWith("too many argument");
        })

        it("Should emit CashBalanceUpdate event with correct details", async function() {
            const tx = await otcContract.connect(addr1).UpdateCashBalance(1000);
            await expect(tx).to.emit(otcContract, 'CashBalanceUpdate').withArgs(addr1.address, 1000);
        });
    });

    // ============================
    // Proof Verifcation Function
    // ============================

    describe("Proof Verification", function() {

        it("Should return true if the proof is valid", async function () {
            const {proof, public} = await loadFixture(userFixture);
            const result = await otcContract.connect(addr1).verifySellStockProof(proof,public);
            expect(result).to.be.true;
        })

        it("Should return true if the proof is valid", async function () {
            const {buyProof, buyPublic} = await loadFixture(userFixture);
            const result = await otcContract.connect(addr1).verifyBuyStockProof(buyProof,buyPublic);
            expect(result).to.be.true;
        })

    })

    // ============================
    // SellStock Function
    // ============================

    describe("SellStock", function() {

        beforeEach(async function() {
            // Register a user and a stock for testing
            await otcContract.connect(addr1).registerAccount("username1");
            await otcContract.connect(owner).registerStock("Apple");
            await otcContract.connect(owner).registerStock("Microsoft");
            await otcContract.connect(addr1).UpdateStockBalance("Apple", 50);
        });

        it("Should return true if the proof is valid", async function() {
            const {proof, public} = await loadFixture(userFixture);
            const result = await otcContract.connect(addr1).verifySellStockProof(proof,public);
            expect(result).to.be.true;
        });

        it("Should not allow the users to sell unregister stock", async function(){
            const {proof, public} = await loadFixture(userFixture);
            expect(otcContract.connect(addr1).sellStock("Samsung",10, 10, 210, 0, proof, public)).to.be.revertedWith("Stock not registered in the system") 
        })
        
        it("Should not allow the users to sell the stock that does not exist in his profolio", async function(){
            const {proof, public} = await loadFixture(userFixture);
            expect(otcContract.connect(addr1).sellStock("Microsoft",10, 10, 210, 0, proof, public)).to.be.revertedWith("User doesn't own this stock") 
        })

        it("Should allow a user to sell stock", async function () {
            this.timeout(1200000);
        
            console.log("Starting test...");
        
            const _stockName = "Apple";
            const _amount = 5;
            const _price = 100;
            const _newCashBalance = 500;
            const _newStockBalance = 45;
        
            console.log("Loading fixture...");
            const {proof, public} = await loadFixture(userFixture);
        
            console.log("Calling sellStock...");
            await otcContract.connect(addr1).sellStock(_stockName, _amount, _price, _newCashBalance, _newStockBalance, proof, public);
        
            console.log("Fetching updated cash balance...");
            const updatedCashBalance = await stockContract.orderToCashBalance(0);
            expect(updatedCashBalance).to.equal(_newCashBalance);
        
            console.log("Test completed.");
        });
                
    });

});

