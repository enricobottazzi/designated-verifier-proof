pragma circom 2.0.2;

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
