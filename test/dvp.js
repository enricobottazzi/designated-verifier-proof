const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const ethers = require('ethers');
const buildInput = require ("../utils/build-input.js");
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("Designated Verifier Testing", function async() {

    this.timeout(1000 * 1000);

    // Generate a wallet for the Prover
    let proverWallet = ethers.Wallet.createRandom()

    // Generate a wallet for the Designated Verifier
    const verifierWallet = ethers.Wallet.createRandom()
    let verifierPrivKey = verifierWallet.privateKey
    let verifierAddress = verifierWallet.address

    // message to be signed
    let message = "Hello World!!!!"

    // Generate a third random wallet
    const randomWallet = ethers.Wallet.createRandom()
    let randomWalletPrivKey = randomWallet.privateKey

    describe("Designated Verifier Signature Testing", function () {

        it("should verify a valid signature sent from a benevolent prover to the desingated verifier", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));

            // Benevolent prover generates a valid signature
            const sig = await proverWallet.signMessage(message)

            // the benevolent prover is the alleged signer of the message 
            const allegedSignerPubKey = proverWallet.publicKey

            // Enter random as private key of the Designated Verifier as the benevolent Prover doesn't know it! 
            const input = buildInput(sig, message, allegedSignerPubKey, verifierAddress, randomWalletPrivKey)
            
            let witness = await circuit.calculateWitness(input);
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
        });

        it("should verify an invalid signature sent from a malicous designated verifier", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));

            // Malicous Designated Verifier signs a message
            const sig = await verifierWallet.signMessage(message)

            // the prover is the alleged signer of the message 
            const allegedSignerPubKey = proverWallet.publicKey

            // Enter Verifier Private of the Designated Verifier as in this case the proof is being generated by a malicoius designated 
            // verifier, who, by definition, knows their private key
            const input = buildInput(sig, message, allegedSignerPubKey, verifierAddress, verifierPrivKey)
            
            let witness = await circuit.calculateWitness(input);
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);

        });

        it("shouldn't verify an invalid signature sent from a malicious prover", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));

            // Malicous Prover takes a signature executed by a third party
            const sig = await randomWallet.signMessage(message)

            // the malicious prover choose themselves as alleged signer 
            const allegedSignerPubKey = proverWallet.publicKey

            // Enter random as private key of the Designated Verifier as the malicious Prover doesn't know it! 
            const input = buildInput(sig, message, allegedSignerPubKey, verifierAddress, randomWalletPrivKey)
            
            // Generate Witness that satisfies 1st condition (msg signature) and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness(input);
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
            
        });
    });
});