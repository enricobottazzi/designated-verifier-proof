pragma circom 2.0.2;

include "./lib/designated-message-reader.circom";

component main  {public [msghash,pubkey,addr]} = DesignatedMessageReader(64, 4);
