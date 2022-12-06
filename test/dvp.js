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

    // Generate a wallet for the Verifier
    const verifierWallet = ethers.Wallet.createRandom()
    let verifierPrivKey = verifierWallet.privateKey
    let verifierAddress = verifierWallet.address

    // message to be signed
    let message = "Hello World!!!!"

    // Generate a third random wallet
    const randomWallet = ethers.Wallet.createRandom()
    let randomWalletPrivKey = randomWallet.privateKey

    describe("Prover to Designated Verifier", function () {

        it("should verify a valid proof (based on 1st condition) coming from the prover", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));

            const sig = await proverWallet.signMessage(message)

            const input = buildInput(sig, message, proverWallet.publicKey, verifierAddress, randomWalletPrivKey)
            
            // Generate Witness that satisfies 1st condition (msg signature) and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness(input);
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
        });

        it("should verify a valid proof (based on 2nd condition) coming from a dishonest verifier", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));

            // message to be Signed
            const sig = await verifierWallet.signMessage(message)

            const input = buildInput(sig, message, proverWallet.publicKey, verifierAddress, verifierPrivKey)
            
            // Generate Witness that satisfies 1st condition (msg signature) and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness(input);
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);

        });

        // it("should verify a valid proof (based on both conditions)", async () => {
            

        //     let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));
            
        //     // message to be Signed
        //     let message = "Hello World!!!!";
        //     var data = await sign(message, proverWallet)

        //     // Generate Witness that satisfies 1st condition (msg signature) and satisfies 2nd condition (priv key to address)
        //     let witness = await circuit.calculateWitness({
        //         "r": data.r,
        //         "s": data.s,
        //         "msghash": data.msghash,
        //         "pubkey": data.pubkey,
        //         "privkey": bigintToTuple(BigInt(verifierPrivKey)),
        //         "addr": BigInt(verifierAddress)    
        //     });    

        //     // Evaluate witness to output 1 (namely true) 
        //     await circuit.assertOut(witness, {out: "1"})
        //     await circuit.checkConstraints(witness);
        // });


        it("shouldn't verify an invalid proof (both conditions are not met) coming from the prover", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvp.circom"));

            // message to be Signed
            const sig = await randomWallet.signMessage(message)

            const input = buildInput(sig, message, proverWallet.publicKey, verifierAddress, randomWalletPrivKey)
            
            // Generate Witness that satisfies 1st condition (msg signature) and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness(input);
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
            
        });
    });
});