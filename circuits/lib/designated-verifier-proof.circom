pragma circom 2.0.0;

include "../../node_modules/circom-ecdsa/circuits/ecdsa.circom";
include "./dvp-component.circom";

template DesignatedVerifierProof(n, k){

    // inputs for ecdsa ECDSAVerifyNoPubkeyCheck circuit
    signal input r[k];
    signal input s[k];
    signal input msghash[k];
    signal input pubkey[2][k];

    // input for Designated Verifier Proof Component
    signal input privkey[k];
    signal input addr;

    // output of the circuit => 1 if at least one of the condition is valid, 0 otherwise
    signal output out;

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

    // instantiate the dvp component 
    component dvp = DesignatedVerifierProofComponent(n, k);

    dvp.check1out <== verifySignature.result;

    for (var i = 0; i < k; i++) {
        dvp.privkey[i] <== privkey[i];
    }

    dvp.addr <== addr;

    out <== dvp.out;
}