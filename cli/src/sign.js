const {sigToRSArrays, msgToMsgHashInput, pubkeyToXYArrays } = require ("../../utils/input-support.js");
const ethers = require('ethers');
const fs = require('fs');

async function genSignature (message, privateKey, path) {

  const proverWallet = new ethers.Wallet(privateKey)

    const data = await sign(message, proverWallet)
            
    fs.writeFile(path, JSON.stringify(data), (err) => {
      if (err) {
        console.error(err);
        return;
      }
    
      console.log(`Data saved to ${path}`);
    });
}

// retrieve pubkey from address later on
async function sign (message, signer) {

    const sig = await signer.signMessage(message)
    const [r, s] = sigToRSArrays(sig)
    let publiclyVisiblePubKey = signer.publicKey

    const data = {
    "r": r,
    "s": s,
    "msghash": msgToMsgHashInput(message),
    "pubkey": pubkeyToXYArrays(publiclyVisiblePubKey)
    };
            
    return data 
}

// You can if and only if a transaction has been sent from the account
async function getPubKeyFromAddress (address) {

  // fetch a tx from etherscan
  // if no transaction exist return an error
  // if there's a transaction we need to process it!
  // Need to look up for a signature executed by this address on etherscan
  // https://ethereum.stackexchange.com/questions/13778/get-public-key-of-any-ethereum-account/13892

  // Fetch the public Key
  const publicKey = ethers.utils.recoverPublicKey(
    ethers.utils.arrayify(ethers.utils.hashMessage(ethers.utils.arrayify(msghash))),
    sig
  )

  return publicKey
}

module.exports = {genSignature, sign}


