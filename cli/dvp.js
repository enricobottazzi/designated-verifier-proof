const { Command } = require('commander');
const program = new Command();
const genSignature = require("./utils/sign.js")
const genProof = require("./utils/gen-proof.js")
const verifyProof = require("./utils/verify-proof.js")

program
  .name('dvp')
  .description('CLI to demo Designated Verifier Proof Library')
  .version('0.0.1');

program.command('sign')
  .description('Sign a message with a ECDSA secp256k1 private key')
  .argument('<message to sign>')
  .argument('<private key>')
  .action(async (message, privateKey) => {
    await genSignature(message, privateKey)
  });

// add path to dvs.wasm and dvs.zkey here
program.command('gen-proof')
    .description('Generate DVP')
    .argument('<address of the designated verifier>')
    // make it optional 
    .argument('<private key of the designated verifier>')
    .action(async (address, privateKey) => {
        await genProof(address, privateKey)
});

program.command('verify-proof')
  .description('Verify DVP')
  .action(async () => {
    await verifyProof()
  });

program.parse();