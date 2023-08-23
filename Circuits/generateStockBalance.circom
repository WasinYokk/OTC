pragma circom 2.0.0;

include "circomlib-master/circuits/poseidon.circom";

template generateStockBalance() {
    
    // Private Input 
    signal input userID; // UserID //
    signal input stockName; // The stockName represent by number //
    signal input totalStock; // The total stock number //
    signal input stockSalt;
    
    // Output
    signal output stockBalance; 

    component poseidon = Poseidon(4);

    poseidon.inputs[0] <== userID;
    poseidon.inputs[1] <== stockName;
    poseidon.inputs[2] <== totalStock;
    poseidon.inputs[3] <== stockSalt;

    stockBalance <== poseidon.out;
}

component main = generateStockBalance();