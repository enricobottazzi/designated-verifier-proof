// Testing for ECDSAVerifyNoPubkeyCheck borrowed from https://github.com/0xPARC/circom-ecdsa/blob/master/test/ecdsa.test.ts
// Testing for ECDSAPrivToAddress borrowed from https://github.com/0xPARC/cabal
const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const ethers = require('ethers');
const {sign, Point } = require('@noble/secp256k1')


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

function bigint_to_array(n, k, x) {
    let mod = 1n;
    for (var idx = 0; idx < n; idx++) {
        mod = mod * 2n;
    }

    let ret = [];
    var x_temp = x;
    for (var idx = 0; idx < k; idx++) {
        ret.push(x_temp % mod);
        x_temp = x_temp / mod;
    }
    return ret;
}

function bigint_to_Uint8Array(x) {
    var ret = new Uint8Array(32);
    for (var idx = 31; idx >= 0; idx--) {
        ret[idx] = Number(x % 256n);
        x = x / 256n;
    }
    return ret;
}

function Uint8Array_to_bigint(x) {
    var ret = 0n;
    for (var idx = 0; idx < x.length; idx++) {
        ret = ret * 256n;
        ret = ret + BigInt(x[idx]);
    }
    return ret;
}

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

    describe("Prover to Designated Verifier", function () {

        it("should verify a valid proof (based on 1st condition) coming from the prover", async () => {
            
            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvs.circom"));
            
            // msgHash to be Signed
            let msghash_bigint = BigInt(1234)
            let msghash = bigint_to_Uint8Array(msghash_bigint);
           
            // prover signs message
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
            
            let input = {
                r: r_array,
                s: s_array,
                msghash: msghash_array,
                pubkey: [pub0_array, pub1_array],
                privkey: bigintToTuple(BigInt(randPrivKey)),
                addr: verifierAddress,
            }

            console.log(input)



            // Generate Witness that satisfies 1st condition (msg signature) and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness({"r": r_array,
                                                          "s": s_array,
                                                          "msghash": msghash_array,
                                                          "pubkey": [pub0_array, pub1_array],
                                                          "privkey": bigintToTuple(BigInt(randPrivKey)),
                                                          "addr": verifierAddress,
                                                        });
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
           

        });

        it("shouldn't verify an invalid proof (both conditions are not met) coming from the prover", async () => {
            
            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvs.circom"));
            
            // msgHash to be Signed
            let msghash_bigint = BigInt(1234)
            let msghash = bigint_to_Uint8Array(msghash_bigint);
            
            // prover signs message
            var sig = await sign(msghash, bigint_to_Uint8Array(BigInt(proverPrivKey)), {canonical: true, der: false})
            var r = sig.slice(0, 32);
            var r_bigint = Uint8Array_to_bigint(r);
            var s = sig.slice(32, 64);
            var s_bigint = Uint8Array_to_bigint(s);

            var priv_array = bigint_to_array(64, 4, BigInt(proverPrivKey));
            var r_array = bigint_to_array(64, 4, r_bigint);
            var s_array = bigint_to_array(64, 4, s_bigint);
            // incorrect msghash generated
            var msghash_array = bigint_to_array(64, 4, msghash_bigint + BigInt(1));
            var pub0_array = bigint_to_array(64, 4, proverPubKey.x);
            var pub1_array = bigint_to_array(64, 4, proverPubKey.y);

            // Prover generates a random privkey to use as input as he/she doesn't know verifier's private key
            const wallet3 = ethers.Wallet.createRandom()
            let randPrivKey = wallet3.privateKey            

            // Generate Witness that doesn't satisfies 1st condition (msg signature) and doesn't satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness({"r": r_array,
                                                          "s": s_array,
                                                          "msghash": msghash_array,
                                                          "pubkey": [pub0_array, pub1_array],
                                                          "privkey": bigintToTuple(BigInt(randPrivKey)),
                                                          "addr": verifierAddress,
                                                        });
            
            // Evaluate witness to output 0 (namely false) 
            await circuit.assertOut(witness, {out: "0"})
            await circuit.checkConstraints(witness);
        });
    });

    describe("Designated Verifier to Third Party Verifier", function () {
    
        it("should verify a proof by the designated verifier which is invalid for 1st condition and valid for 2nd condition", async () => {
            
            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "dvs.circom"));
            
            // msghash to be Signed as part of the forged proof
            let msghash_bigint = BigInt(123456)
            let msghash = bigint_to_Uint8Array(msghash_bigint);

            // Designated Verifier signs a message
            var sig = await sign(msghash, bigint_to_Uint8Array(BigInt(verifierPrivKey)), {canonical: true, der: false})            

            var r = sig.slice(0, 32);
            var r_bigint = Uint8Array_to_bigint(r);
            var s = sig.slice(32, 64);
            var s_bigint = Uint8Array_to_bigint(s);

            var priv_array = bigint_to_array(64, 4, BigInt(privKey));
            var r_array = bigint_to_array(64, 4, r_bigint);
            var s_array = bigint_to_array(64, 4, s_bigint);
            var msghash_array = bigint_to_array(64, 4, msghash_bigint);
            var pub0_array = bigint_to_array(64, 4, proverPubKey.x);
            var pub1_array = bigint_to_array(64, 4, proverPubKey.y);


            // Generate Witness that doesn't satisfy 1st condition (msg signature) and satisfy 2nd condition (priv key to address)
            let witness = await circuit.calculateWitness({"r": r_array,
                                                          "s": s_array,
                                                          "msghash": msghash_array,
                                                          "pubkey": [pub0_array, pub1_array],
                                                          "privkey": bigintToTuple(BigInt(verifierPrivKey)),
                                                          "addr": verifierAddress,
                                                        });
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {out: "1"})
            await circuit.checkConstraints(witness);
        
        });

    });

});