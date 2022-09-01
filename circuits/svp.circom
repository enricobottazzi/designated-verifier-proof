pragma circom 2.0.2;

include "./lib/selected-verifier-proof.circom";

component main  { public [root,addr]} = SelectedVerifierProof(64, 4, 32);
