const {buildPoseidon} = require("circomlibjs");
const {plonk} = require("snarkjs");

async function poseidon(input) {
    let poseidon = await buildPoseidon()
    return poseidon.F.toObject(poseidon(input))
}

async function generateUserID(password, salt) {
    return poseidon([password, salt]);
}

async function generateStockBalance(userID, stockName, totalStock, stockSalt) {
    return poseidon([userID, stockName, totalStock, stockSalt]);
}

async function generateCashBalance(userID, totalCash, cashSalt) {
    return poseidon([userID, totalCash, cashSalt]);
}

async function exportCallDataPlonk(input) {
    const { proof, publicSignals } = await plonk.fullProve(input,"./scripts/fullSellStock.wasm", "./scripts/circuit_final_full_SellStock.zkey");

    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    // without this the execution never terminates (https://github.com/iden3/snarkjs/issues/152)
    globalThis.curve_bn128.terminate(); 

    console.log(calldata);

    //uses a regular expression to remove any double quotes, square brackets, and whitespace characters from the calldata string.//
    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    return argv;
}


async function callData(password, userSalt, userHash, stockName, totalStock, stockSalt, stockHash, totalCash, cashSalt, sellAmount, price) {
    const INPUT = {
        password: password,
        userSalt: userSalt,
        userHash: userHash,
        stockName: stockName,
        totalStock: totalStock,
        stockSalt: stockSalt,
        stockHash: stockHash,
        totalCash: totalCash,
        cashSalt: cashSalt,
        sellAmount: sellAmount,
        price: price
    };

    let proof;

    try {
        let dataResult = await exportCallDataPlonk(INPUT);
        proof = dataResult.slice(0, 36);
    } catch (error) {
        console.log(error);
    }

    return proof;
}

module.exports = {
    generateUserID,
    generateStockBalance,
    generateCashBalance,
    callData
};