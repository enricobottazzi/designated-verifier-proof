// Testing for ECDSAVerifyNoPubkeyCheck borrowed from https://github.com/0xPARC/circom-ecdsa/blob/master/test/ecdsa.test.ts
// Testing for ECDSAPrivToAddress borrowed from https://github.com/0xPARC/cabal
const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const {sign, Point } = require('@noble/secp256k1')
const ethers = require('ethers');

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

    describe("Prover to Verifier", function () {
    
        it("should verify a valid proof coming from the prover", async () => {
        
            let circuit = await wasm_tester(path.join(__dirname, "../circuits", "verifySignature.circom"));

            // Prover generates a random privkey
            const wallet = ethers.Wallet.createRandom()
            let privKey = wallet.privateKey    
            
            // Extract pubKey from privKey using Point
            let pubkey = Point.fromPrivateKey(BigInt(privKey))

            // generate msgHash
            let msghash_bigint = BigInt(1234)
            var msghash = bigint_to_Uint8Array(msghash_bigint);

            // signs message
            var sig = await sign(msghash, bigint_to_Uint8Array(BigInt(privKey)), {canonical: true, der: false})
            var r = sig.slice(0, 32);
            var r_bigint = Uint8Array_to_bigint(r);
            var s = sig.slice(32, 64);
            var s_bigint = Uint8Array_to_bigint(s);

            var priv_array = bigint_to_array(64, 4, BigInt(privKey));
            var r_array = bigint_to_array(64, 4, r_bigint);
            var s_array = bigint_to_array(64, 4, s_bigint);
            var msghash_array = bigint_to_array(64, 4, msghash_bigint);
            var pub0_array = bigint_to_array(64, 4, pubkey.x);
            var pub1_array = bigint_to_array(64, 4, pubkey.y);

            // Generate Witness
            let witness = await circuit.calculateWitness({"r": r_array,
                                                          "s": s_array,
                                                          "msghash": msghash_array,
                                                          "pubkey": [pub0_array, pub1_array]});
            
            // Evaluate witness to output 1 (namely true) 
            await circuit.assertOut(witness, {result: "1"})
            await circuit.checkConstraints(witness);
            });
        });
    });