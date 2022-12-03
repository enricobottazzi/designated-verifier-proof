const { Command } = require('commander');
const program = new Command();
const genSignature = require("./utils/sign.js")
const genProof = require("./utils/gen-proof.js")
// const verifyProof = require("../cli-utils/verify-proo.js)

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

program.command('gen-proof')
    .description('Generate DVP')
    .argument('<address of the designated verifier>')
    // make it optional 
    .argument('<private key of the designated verifier>')
    .action(async (address, privateKey) => {
        await genProof(address, privateKey)
});

program.command('verify-proof')
  .description('Split a string into substrings and display as an array')
  .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-s, --separator <char>', 'separator character', ',')
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

program.parse();