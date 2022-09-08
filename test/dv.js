// Testing for ECDSAPrivToAddress borrowed from https://github.com/0xPARC/cabal
const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const ethers = require('ethers');
const { Group } = require("@semaphore-protocol/group")
import { expect, assert } from 'chai';


// for converting privkey to 4-tuple
function bigintToTuple(x) {
  // 2 ** 64
  let mod = 18446744073709551616n
  let ret = [0n, 0n, 0n, 0n];

  var x_temp = x;
  for (var idx = 0; idx < 4; idx++) {
    ret[idx] = x_temp % mod;
    x_temp = x_temp / mod;
  }
  return ret;
}

describe("Designated Verifier Testing", function () {

    this.timeout(1000 * 1000);

    // Create a merkle tree and add leaves 
    const mt = new Group(32)
    let leaves = [BigInt("12345"), BigInt("7542394"), BigInt("1234697")]
    mt.addMembers(leaves)

    // Generate merkleProof for leaf 7542394
    let merkleProof = mt.generateProofOfMembership(mt.indexOf(leaves[1]))

    // Generate a random privkey for the Verifier
    const wallet = ethers.Wallet.createRandom()
    let verifierPrivKey = wallet.privateKey
    let verifierAddress = wallet.address

    describe("Prover to Designated Verifier", function () {
    

        it("should verify a valid proof (based on 1st condition) coming from the prover", async () => {
        
            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvs.circom"));

            // Prover generates a random privkey
            const wallet2 = ethers.Wallet.createRandom()
            let randPrvKey = wallet2.privateKey
        
            // Prover generates input that satisfies 1st condition and doesn't satisfy 2nd condition
            let input = {
                leaf: merkleProof.leaf,
                pathIndices: merkleProof.pathIndices,
                siblings: merkleProof.siblings,
                root: merkleProof.root,
                privkey: bigintToTuple(BigInt(randPrvKey)),
                addr: verifierAddress,
            }


            const w = await circuit.calculateWitness(
                input,
                true
            );

            // Verifier should check that proof is valid and infer that this must be valid because it satisfies 1st condition 
            await circuit.assertOut(w, {out: "1"})
            await circuit.checkConstraints(w);
        });

        it("shouldn't verify an invalid proof (both conditions are not met) coming from the prover", async () => {
        
            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvs.circom"));

            // Prover generates a random privkey that doesn't satisfy 1st condition (remember, the prover doesn't know the verifier's private key)
            const wallet2 = ethers.Wallet.createRandom()
            let randPrvKey = wallet2.privateKey

            // generate a random leaf that is not part of the tree
            let nonMemberLeaf = BigInt("6742389")
        
            // Prover generates input that doesn't satisfy both 1st and 2nd condition
            let input = {
                leaf: nonMemberLeaf,
                pathIndices: merkleProof.pathIndices,
                siblings: merkleProof.siblings,
                root: merkleProof.root,
                privkey: bigintToTuple(BigInt(randPrvKey)),
                addr: verifierAddress,
            }
    
            const w = await circuit.calculateWitness(
                input,
                true
              );
    
            // Verifier should check that proof is not valid
            await circuit.assertOut(w, {out: "0"})
            await circuit.checkConstraints(w);
        });
    });

    describe("Designated Verifier to Third Party Verifier", function () {
    
        it("should verify a forged proof for 1st condition and verified on 2nd condition coming from designated verifier", async () => {
        
            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvs.circom"));

            let nonMemberLeaf = BigInt("6742389")
        
            // Designated Verifier generate a false proof for the 1st condition and a valid proof for the 2nd condition (he certainly knows his own private key)
            let input = {
                leaf: nonMemberLeaf,
                pathIndices: merkleProof.pathIndices,
                siblings: merkleProof.siblings,
                root: merkleProof.root,
                privkey: bigintToTuple(BigInt(verifierPrivKey)),
                addr: verifierAddress,
            }

            const w = await circuit.calculateWitness(
                input,
                true
            );

            // Third party Verifier should check that the proof is valid => He knows that the 2nd condition is true so he cannot say if 1st condition is true or false.
            await circuit.assertOut(w, {out: "1"})
            await circuit.checkConstraints(w);
        });

    });

});