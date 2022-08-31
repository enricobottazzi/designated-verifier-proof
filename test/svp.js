// Testing for ECDSAPrivToAddress borrowed from https://github.com/0xPARC/cabal
const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const ethers = require('ethers');
const { Group } = require("@semaphore-protocol/group")

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

describe("Designated Verifier Testing", function() {

    this.timeout(1000 * 1000);
    let circuit = await wasm_tester(path.join(__dirname, "../circuits", "svp.circom"));

    // Create a merkle tree and add leaves 
    const mt = new Group(32)
    let leaves = ["12345", "7542394", "1234697"]
    mt.addMembers(leaves)   

    // Generate merkleProof for leaf 7542394
    let merkleProof = mt.generateProofOfMembership(mt.indexOf(leaves[1]))


    describe("Prover to Designated Verifier", function() {



        // Prover generates a validProof

        // invalidProof


        
    });

    describe("Designated Verifier to Third Party", function() {

        
        
    });

});





  it("verify a valid proof coming from the prover to the designated verifier", async () => {
    let circuit = await wasm_tester(path.join(__dirname, "../circuits", "svp.circom"));

    validProof = "a"

    // NOTE: same as circom-ecdsa test cases
    let testPrivs = [
      '0xc3c50b95a58172a4cce3e76629276a627a6d8626bcbbb7762e521207bbc59761',
      '0x535d586f561155c728815b18c7a6836e4c8863d9a24a571818c49ad50a6a079c',
      '0xc7d5ce7bee4ad0cd41c16aa685016b14ac5547575b84a574324c1fdd7eb54619',
      '0xf55ac2f52c4b3712a7819ffdc4be600315e57767c081a8d43b2e41cdb0eda0cb'
    ]

    for (let priv of testPrivs) {
      let address = ethers.utils.computeAddress(priv);
      
      const w = await circuit.calculateWitness(
        {
          privkey: bigintToTuple(BigInt(priv)),
          addr: address
        },
        true
      );
      await circuit.assertOut(w, {out: "1"})
      await circuit.checkConstraints(w);
    }
  });

  it("verify that the same privkeys do not match random addresses", async () => {
    let circuit = await wasm_tester(path.join(__dirname, "../circuits", "eth.circom"));

    // NOTE: same as circom-ecdsa test cases
    let testPrivs = [
      '0xc3c50b95a58172a4cce3e76629276a627a6d8626bcbbb7762e521207bbc59761',
      '0x535d586f561155c728815b18c7a6836e4c8863d9a24a571818c49ad50a6a079c',
      '0xc7d5ce7bee4ad0cd41c16aa685016b14ac5547575b84a574324c1fdd7eb54619',
      '0xf55ac2f52c4b3712a7819ffdc4be600315e57767c081a8d43b2e41cdb0eda0cb'
    ]

    let nonCorrelatedAddresses = [
      '0xA85bd5bA932e4345df66b08C5794F3fD6F63cacC',
      '0xA85bd5bA932e4345df66b08C5794F3fD6F63cacD',
      '0xA85bd5bA932e4345df66b08C5794F3fD6F63cacE',
      '0xA85bd5bA932e4345df66b08C5794F3fD6F63cacF'
    ]

    for (let i=0; i<testPrivs.length; i++) {
      
      const w = await circuit.calculateWitness(
        {
          privkey: bigintToTuple(BigInt(testPrivs[i])),
          addr: BigInt(nonCorrelatedAddresses[i])
        },
        true
      );
      await circuit.assertOut(w, {out: "0"})
      await circuit.checkConstraints(w);
    }
  });
});