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
    const { proof, publicSignals } = await plonk.fullProve(input,"./scripts/fullBuyStock.wasm", "./scripts/circuit_final_full_BuyStock.zkey");
    
    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    // without this the execution never terminates (https://github.com/iden3/snarkjs/issues/152)
    globalThis.curve_bn128.terminate(); 

    console.log(calldata);

    //uses a regular expression to remove any double quotes, square brackets, and whitespace characters from the calldata string.//
    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    return argv;
}