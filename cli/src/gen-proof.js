const fs = require('fs');
const getPubKeyFromAddress = require ("../../utils/addr-to-pubkey.js");
const buildInput = require ("../../utils/build-input.js");
const snarkjs = require('snarkjs')

async function generateProof(sig, allegedSignerAddress, designatedVerifierAddress, designatedVerifierPrivateKey, paths) {

// add error handling here 
const allegedSignerPubKey = await getPubKeyFromAddress(allegedSignerAddress)

console.log(allegedSignerPubKey)

const message = fs.readFileSync(`${paths.pathToMessage}`, 'utf8');

const input = buildInput(sig, message, allegedSignerPubKey, designatedVerifierAddress, designatedVerifierPrivateKey)

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

module.exports = generateProof
