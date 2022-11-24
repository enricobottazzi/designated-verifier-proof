const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const ethers = require('ethers');
const {bigintToTuple} = require ("../utils/convertors.js");
const { Group } = require("@semaphore-protocol/group");
const { Identity } = require("@semaphore-protocol/identity");
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("Designated Verifier Testing", function async() {


    this.timeout(1000 * 1000);

    // Generate a wallet for the Verifier
    const designatedVerifierWallet = ethers.Wallet.createRandom()
    let designatedVerifierPrivKey = designatedVerifierWallet.privateKey
    let verifierAddress = designatedVerifierWallet.address   

    // Generate a third random wallet
    const randomWallet = ethers.Wallet.createRandom()
    let randomWalletPrivKey = randomWallet.privateKey

    // must match the levels of the tree inside your circuit
    const group = new Group(20)

    const identity = new Identity()
    const commitment = identity.generateCommitment()

    group.addMember(commitment)

    const index = group.indexOf(commitment) // 0

    const proof = group.generateProofOfMembership(index)

    describe("Prover to Designated Verifier", function () {

        it("should verify a valid proof coming from the prover", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits/semaphore-tree", "tree.circom"));

            // Generate Witness that satisfies 1st condition and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness({
                "leaf": proof.leaf,
                "pathIndices": proof.pathIndices,
                "siblings": proof.siblings,
                "expectedRoot" : proof.root,
                "privkey": bigintToTuple(BigInt(randomWalletPrivKey)),
                "addr": BigInt(verifierAddress)    
                });
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
        });

        it("should verify a valid proof (based on 2nd condition) coming from a dishonest verifier", async () => {

            let circuit = await wasm_tester(path.join(__dirname, "../circuits/semaphore-tree", "tree.circom"));
    
            let invalidLeaf = proof.leaf + 1n

            // Generate Witness that satisfies 1st condition and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness({
                "leaf": invalidLeaf,
                "pathIndices": proof.pathIndices,
                "siblings": proof.siblings,
                "expectedRoot" : proof.root,
                "privkey": bigintToTuple(BigInt(designatedVerifierPrivKey)),
                "addr": BigInt(verifierAddress)    
                });
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
        });

        it("shouldn't verify an invalid proof (both conditions are not met) coming from the prover", async () => {
            
            let circuit = await wasm_tester(path.join(__dirname, "../circuits/semaphore-tree", "tree.circom"));
    
            let invalidLeaf = proof.leaf + 1n

            // Generate Witness that satisfies 1st condition and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness({
                "leaf": invalidLeaf,
                "pathIndices": proof.pathIndices,
                "siblings": proof.siblings,
                "expectedRoot" : proof.root,
                "privkey": bigintToTuple(BigInt(randomWalletPrivKey)),
                "addr": BigInt(verifierAddress)    
                });
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "0"})
            await circuit.checkConstraints(witness);
        });
    });
});