const fs = require('fs');
const {bigintToTuple, bigint_to_array, bigint_to_Uint8Array, Uint8Array_to_bigint } = require ("../../utils/convertors.js");
const ethers = require('ethers');
const snarkjs = require('snarkjs')

async function generateProof(address) {

// declare the data variable and initialize it to an empty object
let input = await readFileData("input.json");

// Generate a wallet for the Verifier
const verifierWallet = ethers.Wallet.createRandom()
let verifierPrivKey = verifierWallet.privateKey

input.privkey = bigintToTuple(BigInt(verifierPrivKey))
input.addr = BigInt(address).toString()


const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, "dvs.wasm", "dvs.zkey");

fs.writeFile('proof.json', JSON.stringify(proof), (err) => {
    if (err) {
      console.error(err);
      return;
    }
  
    console.log('Proof saved to proof.json');
  });

  fs.writeFile('public.json', JSON.stringify(publicSignals), (err) => {
    if (err) {
      console.error(err);
      return;
    }
  
    console.log('Public signals saved to public.json');

    // it doesn't return anything, needs to be fixed 
  });

// Update it to IPFS

}

async function readFileData(path) {
    // declare the data variable and initialize it to an empty object
    let data = {};
  
    try {
      // read the file using fs.readFile() and wait for it to complete
      const fileData = await fs.promises.readFile(path);
  
      // fileData is a Buffer, so we need to convert it to a string before parsing it as JSON
      data = JSON.parse(fileData.toString());
    } catch (err) {
      throw err;
    }
  
    return data;
  }

module.exports = generateProof
