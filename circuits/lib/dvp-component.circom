pragma circom 2.0.0;

include "../../circom-ecdsa/circuits/eth_addr.circom";

template DesignatedVerifierProofComponent(n, k){

    signal input check1out;
    signal input privkey[k];
    signal input addr;

    // output of the circuit => 1 if at least one of the condition is valid, 0 otherwise
    signal output out;

    component eq1 = IsEqual();

    component pk2addr = PrivKeyToAddr(n, k);

    for (var i = 0; i < k; i++) {
        pk2addr.privkey[i] <== privkey[i];
    }

    eq1.in[0] <== pk2addr.addr;
    eq1.in[1] <== addr;

    // check if at least one of the proofs is valid
    component or = OR();

    or.a <== check1out;
    or.b <== eq1.out;

    // output of the circuit => 1 if at least one of the condition is valid, 0 otherwise
    out <== or.out;
}