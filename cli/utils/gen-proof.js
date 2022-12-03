const fs = require('fs');
const {bigintToTuple, bigint_to_array, bigint_to_Uint8Array, Uint8Array_to_bigint } = require ("../../utils/convertors.js");
const ethers = require('ethers');


async function generateProof(address) {

// declare the data variable and initialize it to an empty object
let input = await readFileData("input.json");

// Generate a wallet for the Verifier
const verifierWallet = ethers.Wallet.createRandom()
let verifierPrivKey = verifierWallet.privateKey


console.log(input)

// Need to convert it to String too! 
input.privkey = bigintToTuple(BigInt(verifierPrivKey))
input.addr = BigInt(address).toString()


console.log(input)





   
    // inputs = {
    //         "r": initInput.r,
    //         "s": initInput.s,
    //         "msghash": initInput.msghash,
    //         "pubkey": initInput.pubkey,
    //         "privkey": bigintToTuple(BigInt(privateKey)),
    //         "addr": BigInt(address)    
    // };

    // console.log(inputs)


    // const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, "circuit.wasm", "circuit_final.zkey");

  
    // return {
    //   proof,
    //   publicSignals,
    // }
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
