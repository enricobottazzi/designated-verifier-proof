const { Command } = require('commander');
const program = new Command();
const genProof = require("./src/gen-proof.js")
const verifyProof = require("./src/verify-proof.js")
const ethers = require('ethers');


program
  .name('dvp')
  .description('CLI to demo Designated Verifier Proof Library')
  .version('0.0.1');

program.command('gen-proof')
    .description('Generate DVP')
    .argument('<signature>', "0xaf365471712541c890ccfefbb999ead07c1a9de89dd31ee78b3414b7afe0bcd0616171dd276e19e3a2b259be28693ea434bc16d6dbd317a1411f45a61a5f16b41b")
    .argument('<path/to/txt/file>', "msg.txt")
    .argument('<alleged address of the signer>', "0x9992847Cb19492673457f7f088Eb2d102F98aeCC")
    .argument('<address of the designated verifier>', "0xA4a3eE27160e2DA1fB2C7dbEDbc7375D70917121")
    .argument('<path/to/folder/containing/artifacts>', "test-folder/artifcats")
    .option('-pkey <private key of the designated verifier>', 'define the private key of the designated verifier')
    .option('-oProof <path/file.json>', 'define the path where to store the file containing the proof', 'proof.json')
    .option('-oPublic <path/file.json>', 'define the path where to store the file containing the public signals', 'public.json')
    .action(async (sig, pathToTxtFile, allegedSignerAddress, designatedVerifierAddress, pathToArtifacts, options) => {
      let designatedVerifierPrivateKey 
      if (options.PKey) {
        const verifierWallet = new ethers.Wallet(options.pkey)
        designatedVerifierPrivateKey = verifierWallet.privateKey
      } else {
        const verifierWallet = ethers.Wallet.createRandom()
        designatedVerifierPrivateKey = verifierWallet.privateKey        
      }

      let paths = { 
        "pathToMessage": pathToTxtFile,
        "pathToArtifacts" : pathToArtifacts,
        "pathToProof" : options.OProof,
        "pathToPublic" : options.OPublic
      }
  
  await genProof(sig, allegedSignerAddress, designatedVerifierAddress, designatedVerifierPrivateKey, paths)

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