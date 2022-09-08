pragma circom 2.0.2;

include "../circom-ecdsa/circuits/ecdsa.circom";

component main {public [msghash, pubkey]} = ECDSAVerifyNoPubkeyCheck(64, 4);