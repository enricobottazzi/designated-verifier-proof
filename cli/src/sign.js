const {sign, Point} = require('@noble/secp256k1')
const {bigint_to_array, bigint_to_Uint8Array, Uint8Array_to_bigint } = require ("../../utils/convertors.js");
const ethers = require('ethers');
const fs = require('fs');

async function genSignature (message, privateKey, path) {

  const proverWallet = new ethers.Wallet(privateKey)

    const data = await sig(message, proverWallet)
            
    fs.writeFile(path, JSON.stringify(data), (err) => {
      if (err) {
        console.error(err);
        return;
      }
    
      console.log(`Data saved to ${path}`);
    });
}

async function sig (message, signer) {

  let proverPrivateKey = signer.privateKey
  let proverPubKey = Point.fromPrivateKey(BigInt(proverPrivateKey))

  let msghash_bigint = BigInt(ethers.utils.solidityKeccak256(["string"], [message]))
  let msghash = bigint_to_Uint8Array(msghash_bigint);    
  var sig = await sign(msghash, bigint_to_Uint8Array(BigInt(proverPrivateKey)), {canonical: true, der: false})
  var r = sig.slice(0, 32);
  var r_bigint = Uint8Array_to_bigint(r);
  var s = sig.slice(32, 64);
  var s_bigint = Uint8Array_to_bigint(s);

  var r_array = bigint_to_array(64, 4, r_bigint);
  var s_array = bigint_to_array(64, 4, s_bigint);
  var msghash_array = bigint_to_array(64, 4, msghash_bigint);
  var pub0_array = bigint_to_array(64, 4, proverPubKey.x);
  var pub1_array = bigint_to_array(64, 4, proverPubKey.y);

  const data = {
    "r": r_array,
    "s": s_array,
    "msghash": msghash_array,
    "pubkey": [pub0_array, pub1_array]
  };
          
  return data 
}

// // You can if and only if a transaction has been sent from the account
// async function getPubKeyFromAddress (address) {

//   // Need to look up for a signature executed by this address on etherscan
//   // https://ethereum.stackexchange.com/questions/13778/get-public-key-of-any-ethereum-account/13892

//   // Fetch the public Key
//   const publicKey = ethers.utils.recoverPublicKey(
//     ethers.utils.arrayify(ethers.utils.hashMessage(ethers.utils.arrayify(msghash))),
//     sig
//   )

//   return publicKey
// }

module.exports = {genSignature, sig}



