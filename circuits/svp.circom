pragma circom 2.0.2;

include "./lib/selected-verifier-proof.circom";

component main = SelectedVerifierProof {public [root,addr]} (64, 4, 32);
