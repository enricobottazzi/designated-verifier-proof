const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const ethers = require('ethers');
const {sign, Point} = require('@noble/secp256k1')
const {bigintToTuple, bigint_to_array, bigint_to_Uint8Array, Uint8Array_to_bigint } = require ("../utils/convertors.js");

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("Designated Verifier Testing", function async() {

    this.timeout(1000 * 1000);

    // Generate a wallet for the Prover
    const proverWallet = ethers.Wallet.createRandom()
    let proverPrivKey = proverWallet.privateKey
    let proverPubKey = Point.fromPrivateKey(BigInt(proverPrivKey))

    // Generate a wallet for the Verifier
    const verifierWallet = ethers.Wallet.createRandom()
    let verifierPrivKey = verifierWallet.privateKey
    let verifierAddress = verifierWallet.address   

    // Generate a third random wallet
    const randomWallet = ethers.Wallet.createRandom()
    let randomWalletPrivKey = randomWallet.privateKey

    describe("Prover to Designated Verifier", function () {

        it("should verify a valid proof (based on 1st condition) coming from the prover", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));
            
            // message to be Signed
            let message = "Hello World!!!!";
            let msghash_bigint = BigInt(ethers.utils.solidityKeccak256(["string"], [message]))
            let msghash = bigint_to_Uint8Array(msghash_bigint);     
           
            // prover signs the hashed message
            var sig = await sign(msghash, bigint_to_Uint8Array(BigInt(proverPrivKey)), {canonical: true, der: false})
            var r = sig.slice(0, 32);
            var r_bigint = Uint8Array_to_bigint(r);
            var s = sig.slice(32, 64);
            var s_bigint = Uint8Array_to_bigint(s);

            var r_array = bigint_to_array(64, 4, r_bigint);
            var s_array = bigint_to_array(64, 4, s_bigint);
            var msghash_array = bigint_to_array(64, 4, msghash_bigint);
            var pub0_array = bigint_to_array(64, 4, proverPubKey.x);
            var pub1_array = bigint_to_array(64, 4, proverPubKey.y);
            
            // Generate Witness that satisfies 1st condition (msg signature) and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness({
                "r": r_array,
                "s": s_array,
                "msghash": msghash_array,
                "pubkey": [pub0_array, pub1_array],
                "privkey": bigintToTuple(BigInt(randomWalletPrivKey)),
                "addr": BigInt(verifierAddress) 
                });
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
        });

        it("should verify a valid proof (based on 2nd condition) coming from a dishonest verifier", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));
            
            // message to be Signed
            let message = "Hello World!!!!";
            let msghash_bigint = BigInt(ethers.utils.solidityKeccak256(["string"], [message]))
            let msghash = bigint_to_Uint8Array(msghash_bigint);     
           
            // prover signs the hashed message
            var sig = await sign(msghash, bigint_to_Uint8Array(BigInt(proverPrivKey)), {canonical: true, der: false})
            var r = sig.slice(0, 32);
            var r_bigint = Uint8Array_to_bigint(r);
            var s = sig.slice(32, 64);
            var s_bigint = Uint8Array_to_bigint(s);

            // generate an invalid signature
            var r_array = bigint_to_array(64, 4, r_bigint + 1n);
            var s_array = bigint_to_array(64, 4, s_bigint);
            var msghash_array = bigint_to_array(64, 4, msghash_bigint);
            var pub0_array = bigint_to_array(64, 4, proverPubKey.x);
            var pub1_array = bigint_to_array(64, 4, proverPubKey.y);

            // Generate Witness that doesn't satisfy the 1st condition and satisfies the 2nd condition condition (msg signature)
            let witness = await circuit.calculateWitness({
                "r": r_array,
                "s": s_array,
                "msghash": msghash_array,
                "pubkey": [pub0_array, pub1_array],
                "privkey": bigintToTuple(BigInt(verifierPrivKey)),
                "addr": BigInt(verifierAddress)    
            });    
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
        });

        it("should verify a valid proof (based on both conditions)", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));
            
            // message to be Signed
            let message = "Hello World!!!!";
            let msghash_bigint = BigInt(ethers.utils.solidityKeccak256(["string"], [message]))
            let msghash = bigint_to_Uint8Array(msghash_bigint);     
           
            // prover signs the hashed message
            var sig = await sign(msghash, bigint_to_Uint8Array(BigInt(proverPrivKey)), {canonical: true, der: false})
            var r = sig.slice(0, 32);
            var r_bigint = Uint8Array_to_bigint(r);
            var s = sig.slice(32, 64);
            var s_bigint = Uint8Array_to_bigint(s);

            var r_array = bigint_to_array(64, 4, r_bigint);
            var s_array = bigint_to_array(64, 4, s_bigint);
            var msghash_array = bigint_to_array(64, 4, msghash_bigint);
            var pub0_array = bigint_to_array(64, 4, proverPubKey.x);
            var pub1_array = bigint_to_array(64, 4, proverPubKey.y);

            // Generate Witness that satisfies 1st condition (msg signature) and satisfies 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness({
                "r": r_array,
                "s": s_array,
                "msghash": msghash_array,
                "pubkey": [pub0_array, pub1_array],
                "privkey": bigintToTuple(BigInt(verifierPrivKey)),
                "addr": BigInt(verifierAddress)    
            });    

            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
        });


        it("shouldn't verify an invalid proof (both conditions are not met) coming from the prover", async () => {
            
            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));
            
            // message to be Signed
            let message = "Hello World";
            // hash the message 
            let msghash_bigint = BigInt(ethers.utils.solidityKeccak256(["string"], [message]))
            let msghash = bigint_to_Uint8Array(msghash_bigint);     
      
            // prover signs the hashed message
            var sig = await sign(msghash, bigint_to_Uint8Array(BigInt(proverPrivKey)), {canonical: true, der: false})
            var r = sig.slice(0, 32);
            var r_bigint = Uint8Array_to_bigint(r);
            var s = sig.slice(32, 64);
            var s_bigint = Uint8Array_to_bigint(s);

            // generate an invalid signature
            var r_array = bigint_to_array(64, 4, r_bigint + 1n);
            var s_array = bigint_to_array(64, 4, s_bigint);
            var msghash_array = bigint_to_array(64, 4, msghash_bigint);
            var pub0_array = bigint_to_array(64, 4, proverPubKey.x);
            var pub1_array = bigint_to_array(64, 4, proverPubKey.y);
                    
            // Generate Witness that doesn't satisfies 1st condition (msg signature) and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness({
                "r": r_array,
                "s": s_array,
                "msghash": msghash_array,
                "pubkey": [pub0_array, pub1_array],
                "privkey": bigintToTuple(BigInt(randomWalletPrivKey)),
                "addr": BigInt(verifierAddress)    
            });    
            
            // Evaluate witness to output 0 (namely false) 
            await circuit.assertOut(witness, {out: "0"})
            await circuit.checkConstraints(witness);
        });
    });
});