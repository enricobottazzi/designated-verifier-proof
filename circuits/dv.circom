pragma circom 2.0.2;

include "./lib/designated-verifier.circom";

component main  { public [root,addr]} = DesignatedVerifer(64, 4, 32);
