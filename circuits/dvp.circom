pragma circom 2.0.2;

include "./lib/designated-verifier-proof.circom";

component main  {public [msghash,pubkey,addr]} = DesignatedVerifierProof(64, 4);
