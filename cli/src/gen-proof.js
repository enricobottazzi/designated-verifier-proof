const fs = require('fs');
const getPubKeyFromAddress = require ("../../utils/addrToPubkey.js");
const buildInput = require ("../../utils/input-support.js");
const snarkjs = require('snarkjs')

async function generateProof(sig, message, allegedSignerAddress, designatedVerifierAddress, designatedVerifierPrivateKey, paths) {

// let input = await readFileData(`${paths.pathToSignature}`);

// add error handling here 
const allegedSignerPubKey = await getPubKeyFromAddress(allegedSignerAddress)

console.log(allegedSignerPubKey)

const input = buildInput(sig, message, allegedSignerPubKey, designatedVerifierAddress, designatedVerifierPrivateKey)

// input.privkey = parsePrivateKey(designatedVerifierPrivateKey)
// input.addr = BigInt(address).toString()

console.log("Consuming your CPU to generate the proof ... It usally take around 5 mins")

const {proof, publicSignals } = await snarkjs.groth16.fullProve(input, `${paths.pathToArtifacts}/dvs.wasm`, `${paths.pathToArtifacts}/dvs.zkey`);

fs.writeFile(`${paths.pathToProof}`, JSON.stringify(proof), (err) => {
    if (err) {
      console.error(err);
    }
  
    console.log(`Proof saved to ${paths.pathToProof}`);
  });

  fs.writeFile(`${paths.pathToPublic}`, JSON.stringify(publicSignals), (err) => {
    if (err) {
      console.error(err);
    }
  
    console.log(`Public signals saved to ${paths.pathToPublic}`);
    process.exit();
  });

}

// async function readFileData(path) {
//     // declare the data variable and initialize it to an empty object
//     let data = {};
  
//     try {
//       // read the file using fs.readFile() and wait for it to complete
//       const fileData = await fs.promises.readFile(path);
  
//       // fileData is a Buffer, so we need to convert it to a string before parsing it as JSON
//       data = JSON.parse(fileData.toString());
//     } catch (err) {
//       throw err;
//     }
  
//     return data;
//   }

module.exports = generateProof
