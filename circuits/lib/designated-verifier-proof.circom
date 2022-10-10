pragma circom 2.0.0;

include "../../circom-ecdsa/circuits/eth_addr.circom";
include "../../circom-ecdsa/circuits/ecdsa.circom";

template DesignatedVerifierSignature(n, k){

    // inputs for ecdsa ECDSAVerifyNoPubkeyCheck circuit
    signal input r[k];
    signal input s[k];
    signal input msghash[k];
    signal input pubkey[2][k];

    // input for PrivKeyToAddr
    signal input privkey[k];

    // checker against the output of PrivKeyToAddr
    signal input addr;

    // output of the circuit => 1 if at least one of the condition is valid, 0 otherwise
    signal output out;

    component eq1 = IsEqual();

    // compute proof #1
    component verifySignature = ECDSAVerifyNoPubkeyCheck(n, k);

    for (var i = 0; i < k; i++) {
        verifySignature.r[i] <== r[i];
        verifySignature.s[i] <== s[i];
        verifySignature.msghash[i] <== msghash[i];
        for (var j = 0; j < 2; j++) {
            verifySignature.pubkey[j][i] <== pubkey[j][i];
        }
    }

    // compute proof #2 
    component pk2addr = PrivKeyToAddr(n, k);

    for (var i = 0; i < k; i++) {
        pk2addr.privkey[i] <== privkey[i];
    }

    // verify proof #2 => Does the computed address match the one provided as input?
    eq1.in[0] <== pk2addr.addr;
    eq1.in[1] <== addr;

    // check if at least one of the proofs is valid
    component or = OR();

    or.a <== verifySignature.result;
    or.b <== eq1.out;

    out <== or.out;
}