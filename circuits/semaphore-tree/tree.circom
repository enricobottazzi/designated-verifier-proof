pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";
// To be added
include "../dvp-component.circom";

template MerkleTreeInclusionProof(nLevels) {
    signal input leaf;
    signal input pathIndices[nLevels];
    signal input siblings[nLevels];

    signal output root;

    component poseidons[nLevels];
    component mux[nLevels];

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

    root <== hashes[nLevels];
}

// To be added
template DesignatedVerifierMerkleTreeInclusionProof (n, k, nLevels) {

    signal input leaf;  
    signal input pathIndices[nLevels];  
    signal input siblings[nLevels];
    signal input expectedRoot;
    signal input privkey[k];
    signal input addr;
    signal output out;

    component inclusionProof = MerkleTreeInclusionProof(nLevels);
    inclusionProof.leaf <== leaf;

    for (var i = 0; i < nLevels; i++) {
        inclusionProof.siblings[i] <== siblings[i];
        inclusionProof.pathIndices[i] <== pathIndices[i];
    }

    component dvEverything = DesignatedVerifierProofComponent(n, k);

    dvEverything.expectedOutCircuit <== expectedRoot;
    dvEverything.actualOutCircuit <== inclusionProof.root;

    for (var i = 0; i < k; i++) {
        dvEverything.privkey[i] <== privkey[i];
    }

    dvEverything.addr <== addr;

    out <== dvEverything.out;
}

component main {public [expectedRoot,addr]} = DesignatedVerifierMerkleTreeInclusionProof(64, 4, 20);
