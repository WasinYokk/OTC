// An assertion library, which provides utility functions to make it easier to write test assertions.//
const { expect } = require("chai");
const { assert } = require("chai");

// Helps in loading predefined data to be used for the tests. //
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const { generateUserID, generateStockBalance, generateCashBalance, callData } = require("../scripts/calculationSell.js");

describe("Circuit Test", function (){

    async function userFixture() {

        const password = "123";
        const salt = "456";
        const userID = "19620391833206800292073497099357851348339828238212863168390691880932172496143";

        const stockName = "1";
        const totalStock = "100";
        const stockSalt = "55";
        const stockHash = "19560085824258327485361135150237162356547762503436458757112031802475197179429";

        const totalCash = "1000";
        const cashSalt = "66";
        const cashHash = "14551668389226498871082468426041927229718781623901355098364306400286936392611"

        const sellAmount = "10";
        const price = "1";

        const username = "A"

        return{ password, salt, userID, stockName, totalStock, stockSalt, stockHash, totalCash, cashSalt, cashHash ,sellAmount, price, username};
    }
    
    it("User Creating an unique id", async function () {

        const{ password, salt, userID } = await loadFixture(userFixture);
        const id = await generateUserID(password, salt);

        expect(id).to.equal(userID);
    })

    it("Ensure that the difference input generate a different user ID", async function () {
        
        const{ password, salt } = await loadFixture(userFixture);
        const id = await generateUserID(password, salt);
        
        const id2 = await generateUserID("989989", "22");
        const id3 = await generateUserID("6666", "11");
        const id4 = await generateUserID("45678", "33");
        
        assert.notEqual(id, id2, "Both IDs should not be the same");
        assert.notEqual(id, id3, "Both IDs should not be the same");
        assert.notEqual(id, id4, "Both IDs should not be the same");  
        assert.notEqual(id2, id3, "Both IDs should not be the same"); 
        assert.notEqual(id2, id4, "Both IDs should not be the same"); 
        assert.notEqual(id3, id4, "Both IDs should not be the same");    
        }
    )

    it("Ensure that the difference salt generate different UserID, even though the password is the same", async function (){
        const{ password, salt } = await loadFixture(userFixture);
        const id = await generateUserID(password, salt);

        const id2 = await generateUserID(password, "22");
        const id3 = await generateUserID(password, "11");
        const id4 = await generateUserID(password, "33");
        
        assert.notEqual(id, id2, "Both IDs should not be the same");
        assert.notEqual(id, id3, "Both IDs should not be the same");
        assert.notEqual(id, id4, "Both IDs should not be the same");  
        assert.notEqual(id2, id3, "Both IDs should not be the same"); 
        assert.notEqual(id2, id4, "Both IDs should not be the same"); 
        assert.notEqual(id3, id4, "Both IDs should not be the same"); 
    })

    it("User generating a stock balance", async function () {

        const{ userID, stockName, totalStock, stockSalt, stockHash } = await loadFixture(userFixture);
        const stockBalance = await generateStockBalance(userID, stockName, totalStock, stockSalt);

        expect(stockBalance).to.equal(stockHash);
    })

    it("Ensure that difference userID generate different stockbalance, even though the balance and salt is equal", async function (){

        const{ userID, stockName, totalStock, stockSalt} = await loadFixture(userFixture);
        const stockBalance = await generateStockBalance(userID, stockName, totalStock, stockSalt);

        const stockBalance2 = await generateStockBalance("19559708564467027071309568042669577929093050622036796493164541452023845929520",stockName, totalStock, stockSalt);
        const stockBalance3 = await generateStockBalance("23567",stockName, totalStock, stockSalt);
        const stockBalance4 = await generateStockBalance("889999",stockName, totalStock, stockSalt);

        assert.notEqual(stockBalance, stockBalance2, "Both stock balance should not be the same");
        assert.notEqual(stockBalance, stockBalance3, "Both stock balance should not be the same");
        assert.notEqual(stockBalance, stockBalance4, "Both stock balance should not be the same");  
        assert.notEqual(stockBalance2, stockBalance3, "Both stock balance should not be the same"); 
        assert.notEqual(stockBalance3, stockBalance4, "Both stock balance should not be the same"); 
        assert.notEqual(stockBalance3, stockBalance4, "Both stock balance should not be the same");
    })

    it("Ensure that difference salt generate different stockbalance, even though the balance and user ID is equal", async function (){

        const{ userID, stockName, totalStock, stockSalt} = await loadFixture(userFixture);
        const stockBalance = await generateStockBalance(userID, stockName, totalStock, stockSalt);

        const stockBalance2 = await generateStockBalance(userID,stockName, totalStock, "980");
        const stockBalance3 = await generateStockBalance(userID,stockName, totalStock, "13567");
        const stockBalance4 = await generateStockBalance(userID,stockName, totalStock, "000000");

        assert.notEqual(stockBalance, stockBalance2, "Both stock balance should not be the same");
        assert.notEqual(stockBalance, stockBalance3, "Both stock balance should not be the same");
        assert.notEqual(stockBalance, stockBalance4, "Both stock balance should not be the same");  
        assert.notEqual(stockBalance2, stockBalance3, "Both stock balance should not be the same"); 
        assert.notEqual(stockBalance3, stockBalance4, "Both stock balance should not be the same"); 
        assert.notEqual(stockBalance3, stockBalance4, "Both stock balance should not be the same");
    })


    it("User generating a cash balance", async function () {

        const{ userID, totalCash, cashSalt, cashHash} = await loadFixture(userFixture);
        const cashBalance = await generateCashBalance(userID, totalCash, cashSalt);

        expect(cashBalance).to.equal(cashHash);
    })

    it("Ensure that difference userID generate different cashbalance, even though the balance and salt is equal", async function (){

        const{ userID, totalCash, cashSalt} = await loadFixture(userFixture);
        const cashBalance = await generateCashBalance(userID, totalCash, cashSalt);

        const cashBalance2 = await generateCashBalance("19559708564467027071309568042669577929093050622036796493164541452023845929520",totalCash, cashSalt);
        const cashBalance3 = await generateCashBalance("21341",totalCash, cashSalt);
        const cashBalance4 = await generateCashBalance("55689",totalCash, cashSalt);

        assert.notEqual(cashBalance, cashBalance2, "Both cash balance should not be the same");
        assert.notEqual(cashBalance, cashBalance3, "Both cash balance should not be the same");
        assert.notEqual(cashBalance, cashBalance4, "Both cash balance should not be the same");
        assert.notEqual(cashBalance2, cashBalance3, "Both cash balance should not be the same");
        assert.notEqual(cashBalance2, cashBalance4, "Both cash balance should not be the same");
        assert.notEqual(cashBalance3, cashBalance4, "Both cash balance should not be the same");
    })

    it("Ensure that difference salt generate different cashbalance, even though the balance and user ID is equal", async function (){

        const{ userID, totalCash, cashSalt} = await loadFixture(userFixture);
        const cashBalance = await generateCashBalance(userID,totalCash, cashSalt);

        const cashBalance2 = await generateCashBalance(userID,totalCash, "980");
        const cashBalance3 = await generateCashBalance(userID,totalCash, "8888");
        const cashBalance4 = await generateCashBalance(userID,totalCash, "981340");

        assert.notEqual(cashBalance, cashBalance2, "Both cash balance should not be the same");
        assert.notEqual(cashBalance, cashBalance3, "Both cash balance should not be the same");
        assert.notEqual(cashBalance, cashBalance4, "Both cash balance should not be the same");
        assert.notEqual(cashBalance2, cashBalance3, "Both cash balance should not be the same");
        assert.notEqual(cashBalance2, cashBalance4, "Both cash balance should not be the same");
        assert.notEqual(cashBalance3, cashBalance4, "Both cash balance should not be the same");
    })



})