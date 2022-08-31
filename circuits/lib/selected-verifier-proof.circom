pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";
include "../../circom-ecdsa/circuits/eth_addr.circom";


template PrivKeyToAddrChecker(n, k) {

    signal input privkey[k];
    signal input addr;
    signal output out;

    component addr1 = PrivKeyToAddr(n, k);

    for (var i = 0; i < k; i++) {
        addr1.privkey[i] <== privkey[i];
    }

    component eq = IsEqual();

    eq.in[0] <== addr1.addr;
    eq.in[1] <== addr;

    out <== eq.out;
    
}


template MerkleTreeInclusionProof(nLevels) {
    signal input leaf;
    signal input pathIndices[nLevels];
    signal input siblings[nLevels];
    signal input root;

    signal computedRoot;

    signal output out;

    component poseidons[nLevels];
    component mux[nLevels];
    component eq = IsEqual();

    signal hashes[nLevels + 1];
    hashes[0] <== leaf;

    for (var i = 0; i < nLevels; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        poseidons[i] = Poseidon(2);
        mux[i] = MultiMux1(2);

        mux[i].c[0][0] <== hashes[i];
        mux[i].c[0][1] <== siblings[i];

        mux[i].c[1][0] <== siblings[i];
        mux[i].c[1][1] <== hashes[i];

        mux[i].s <== pathIndices[i];

        poseidons[i].inputs[0] <== mux[i].out[0];
        poseidons[i].inputs[1] <== mux[i].out[1];

        hashes[i + 1] <== poseidons[i].out;
    }

    computedRoot <== hashes[nLevels];

    eq.in[0] <== computedRoot;
    eq.in[1] <== root;

    out <== eq.out;
}


template SelectedVerifierProof(n, k, nLevels){

    signal input leaf;
    signal input pathIndices[nLevels];
    signal input siblings[nLevels];
    signal input root;

    signal input privkey[k];
    signal input addr;

    signal output out;

    component mt = MerkleTreeInclusionProof(nLevels);

    mt.leaf <== leaf;
    for (var i = 0; i < nLevels; i++) {
        mt.siblings[i] <== siblings[i];
        mt.pathIndices[i] <== pathIndices[i];
    }
    mt.root <== root;

    component pk = PrivKeyToAddrChecker(n,k);

    for (var i = 0; i < k; i++) {
        pk.privkey[i] <== privkey[i];
    }

    pk.addr <== addr;

    component or = OR();

    or.a <== mt.out;
    or.b <== pk.out;

    out <== or.out;

}