const chai = require("chai");
const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const ethers = require('ethers');
const {sign, Point} = require('@noble/secp256k1')
const {bigintToTuple, bigint_to_array, bigint_to_Uint8Array, Uint8Array_to_bigint } = require ("../utils/convertors.js");

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("Simple test", function () {
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
    let randomWalletAddress = randomWallet.address   

    it("Checking the compilation of a simple circuit generating wasm", async () => {
        const circuit = await wasm_tester(
	    path.join(__dirname, "../circuits", "dvs.circom"))

        console.log(circuit);

        let message = "Hello World!!!!";
        let msghash_bigint = BigInt(ethers.utils.solidityKeccak256(["string"], [message]))
        let msghash = bigint_to_Uint8Array(msghash_bigint);     
           
            // prover signs the hashed message
            var sig = await sign(msghash, bigint_to_Uint8Array(BigInt(proverPrivKey)), {canonical: true, der: false})
            var r = sig.slice(0, 32);
            var r_bigint = Uint8Array_to_bigint(r);
            var s = sig.slice(32, 64);
            var s_bigint = Uint8Array_to_bigint(s);

            var priv_array = bigint_to_array(64, 4, BigInt(proverPrivKey));
            var r_array = bigint_to_array(64, 4, r_bigint);
            var s_array = bigint_to_array(64, 4, s_bigint);
            var msghash_array = bigint_to_array(64, 4, msghash_bigint);
            var pub0_array = bigint_to_array(64, 4, proverPubKey.x);
            var pub1_array = bigint_to_array(64, 4, proverPubKey.y);

            // Prover generates a random privkey to use as input as he/she doesn't know verifier's private key
            const wallet3 = ethers.Wallet.createRandom()
            let randPrivKey = wallet3.privateKey   
            
            // Generate Witness that satisfies 1st condition (msg signature) and doesn't satisfy 2nd condition (priv key to address)
            const w = await circuit.calculateWitness({
                r: r_array,
                s: s_array,
                msghash: msghash_array,
                pubkey: [pub0_array, pub1_array],
                privkey: bigintToTuple(BigInt(randPrivKey)),
                addr: BigInt(verifierAddress)    
                });
            
        await circuit.checkConstraints(w);
    });
});
