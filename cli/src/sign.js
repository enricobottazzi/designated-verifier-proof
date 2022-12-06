const {sigToRSArrays, msgToMsgHashInput, pubkeyToXYArrays } = require ("../../utils/input-support.js");
const ethers = require('ethers');
const fs = require('fs');

// async function genSignature (message, privateKey, path) {

//   const proverWallet = new ethers.Wallet(privateKey)

//     const data = await sign(message, proverWallet)
            
//     fs.writeFile(path, JSON.stringify(data), (err) => {
//       if (err) {
//         console.error(err);
//         return;
//       }
    
//       console.log(`Data saved to ${path}`);
//     });
// }

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

module.exports = {genSignature, sign}


