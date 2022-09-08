pragma circom 2.0.2;

include "./lib/designated-verifier-signature.circom";

component main  {public [msghash,pubkey,addr]} = DesignatedVerifierSignature(64, 4);
