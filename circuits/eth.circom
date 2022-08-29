pragma circom 2.0.2;

include "../circom-ecdsa/circuits/eth_addr.circom";

component main = PrivKeyToAddr(64, 4);
