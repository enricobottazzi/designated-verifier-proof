const { Command } = require('commander');
const program = new Command();
const genSignature = require("./src/sign.js")
const genProof = require("./src/gen-proof.js")
const verifyProof = require("./src/verify-proof.js")
const ethers = require('ethers');


program
  .name('dvp')
  .description('CLI to demo Designated Verifier Proof Library')
  .version('0.0.1');

program.command('sign')
  .description('Sign a message with a ECDSA secp256k1 private key')
  .argument('<message to be signed>', "hello world")
  .argument('<private key>', "7e4a26d6d34648fdc64848f87fcf798107e6c08b3b4628498b5fdf73304eded8")
  .option('-o <path/file.json>', 'define the path where to store the signature', 'signature.json')
  .action(async (message, privateKey, options) => {
    let path = options.o
    await genSignature(message, privateKey, path)
  });

program.command('gen-proof')
    .description('Generate DVP')
    .argument('<address of the designated verifier>', "0xA4a3eE27160e2DA1fB2C7dbEDbc7375D70917121")
    .argument('<path/to/folder/containing/artifacts>', "test-folder/artifcats")
    .argument('<path/to/signatureFile>', "test-folder/signature.json")
    .option('-pkey <private key of the designated verifier>', 'define the private key of the designated verifier')
    .option('-oProof <path/file.json>', 'define the path where to store the file containing the proof', 'proof.json')
    .option('-oPublic <path/file.json>', 'define the path where to store the file containing the public signals', 'public.json')
    .action(async (address, pathToArtifacts, pathToSignature, options) => {
      let designatedVerifierPrivateKey 
      if (options.PKey) {
        const verifierWallet = new ethers.Wallet(options.pkey)
        designatedVerifierPrivateKey = verifierWallet.privateKey
      } else {
        const verifierWallet = ethers.Wallet.createRandom()
        designatedVerifierPrivateKey = verifierWallet.privateKey        
      }

      let paths = {
        "pathToArtifacts" : pathToArtifacts,
        "pathToSignature" : pathToSignature,
        "pathToProof" : options.OProof,
        "pathToPublic" : options.OPublic
      }
  
  await genProof(address, paths, designatedVerifierPrivateKey)

});

program.command('verify-proof')
  .description('Verify DVP')
  .argument('<path/to/proofFile>', "test-folder/proof.json")
  .argument('<path/to/publicFile>', "test-folder/public.json")
  .argument('<path/to/folder/containing/artifacts>', "test-folder/artifcats")
  .action(async (pathToProof, pathToPublic, pathToArtifacts) => {
    let paths = {
      "pathToProof" : pathToProof,
      "pathToPublic" : pathToPublic,
      "pathToArtifacts" : pathToArtifacts
    }
    await verifyProof(paths)  
});

program.parse();