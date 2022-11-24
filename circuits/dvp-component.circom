pragma circom 2.0.0;

include "../circuits-ecdsa/eth_addr.circom";

template DesignatedVerifierProofComponent(n, k){

    signal input expectedOutCircuit;
    signal input actualOutCircuit;
    signal input privkey[k];
    signal input addr;

    // output of the circuit => 1 if at least one of the condition is valid, 0 otherwise
    signal output out;

    component eq1 = IsEqual();
    component eq2 = IsEqual();

    // check if expectedOutCircuit matches actualOutCircuit
    eq1.in[0] <== expectedOutCircuit;
    eq1.in[1] <== actualOutCircuit;

    component pk2addr = PrivKeyToAddr(n, k);

    for (var i = 0; i < k; i++) {
        pk2addr.privkey[i] <== privkey[i];
    }

    eq2.in[0] <== pk2addr.addr;
    eq2.in[1] <== addr;

    // check if at least one of the proofs is valid
    component or = OR();

    or.a <== eq1.out;
    or.b <== eq2.out;

    // output of the circuit => 1 if at least one of the condition is valid, 0 otherwise
    out <== or.out;
}

