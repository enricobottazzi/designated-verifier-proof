pragma circom 2.0.0;

include "../../circom-ecdsa/circuits/eth_addr.circom";
include "../../semaphore/circuits/tree.circom";

template SelectedVerifierProof(n, k, nLevels){

    // inputs for semaphore's tree.circom circuit
    signal input leaf;
    signal input pathIndices[nLevels];
    signal input siblings[nLevels];

    // checker against the output of the semaphore's tree.circom circuit
    signal input root;

    // input for PrivKeyToAddr
    signal input privkey[k];

    // checker against the output of PrivKeyToAddr
    signal input addr;

    // output of the circuit => 1 if at least one of the condition is valid, 0 otherwise
    signal output out;

    component eq1 = IsEqual();
    component eq2 = IsEqual();

    // compute proof #1
    component mt = MerkleTreeInclusionProof(nLevels);

    mt.leaf <== leaf;
    for (var i = 0; i < nLevels; i++) {
        mt.siblings[i] <== siblings[i];
        mt.pathIndices[i] <== pathIndices[i];
    }

    // verify proof #1 => Does the computed root match the one provided as input?
    eq1.in[0] <== mt.root;
    eq1.in[1] <== root;

    // compute proof #2 
    component pk2addr = PrivKeyToAddr(n, k);

    for (var i = 0; i < k; i++) {
        pk2addr.privkey[i] <== privkey[i];
    }

    // verify proof #2 => Does the computed address match the one provided as input?
    eq2.in[0] <== pk2addr.addr;
    eq2.in[1] <== addr;

    // check if at least one of the proofs is valid
    component or = OR();

    or.a <== eq1.out;
    or.b <== eq2.out;

    out <== or.out;
}