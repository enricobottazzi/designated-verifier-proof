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

async function sig (message, wallet) {

  let proverPrivateKey = wallet.privateKey
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
  
  // sig to array

  // save signature and message hash inside a json file
  // console.log("signature", signature)     
  // // 0xb1cd9e9cb8c6606b50e0d7c2c962f93e4c32bd8ed583ae84b10210bffda6779452dd167242236be03951e1e2a823789854a7406cc1b1eb595e7dc2f34e9154a61c
  // console.log("signature to Bytes", hexToBytes(signature))
  // console.log("signature to Bytes length", hexToBytes(signature).length)
  // console.log("signature length", signature.length) 
}

// Taken from https://github.com/personaelabs/heyanon/blob/248feef0b3a34a5bc280ac6bf8f11c81607c0005/lib/zkp.ts#L100 
// function sigToRSArrays(sig) {
//   const rArr = bigint_to_array(64, 4, BigInt("0x" + sig.slice(2, 2 + 64))).map(
//     (el) => el.toString()
//   );
//   const sArr = bigint_to_array(64, 4, BigInt("0x" + sig.slice(66, 66 + 64))).map(
//     (el) => el.toString()
//   );

//   return [rArr, sArr];
// }

module.exports = {genSignature, sig}

