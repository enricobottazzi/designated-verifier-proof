const {bigint_to_array, bigintToTuple} = require ("./convertors.js");
const ethers = require('ethers');

function buildInput(sig, message, allegedSignerPublicKey, designatedVerifierAddress, designatedVerifierPrivateKey) {

  const [r, s] = sigToRSArrays(sig);

  return {
    "r": r,
    "s": s,
    "msghash": msgToMsgHashInput(message),
    "pubkey": pubkeyToXYArrays(allegedSignerPublicKey),
    "privkey": parsePrivateKey(designatedVerifierPrivateKey),
    "addr": BigInt(designatedVerifierAddress) 
    }

}

// utils From https://github.com/personaelabs/heyanon 
function sigToRSArrays(sig) {

    const rArr = bigint_to_array(64, 4, BigInt("0x" + sig.slice(2, 2 + 64))).map(
      (el) => el.toString()
    );
    const sArr = bigint_to_array(64, 4, BigInt("0x" + sig.slice(66, 66 + 64))).map(
      (el) => el.toString()
    );
  
    return [rArr, sArr];
  }

// Utils from https://github.com/personaelabs/heyanon 
function pubkeyToXYArrays(pk) {

    const XArr = bigint_to_array(64, 4, BigInt("0x" + pk.slice(4, 4 + 64))).map(
        (el) => el.toString()
    );
    const YArr = bigint_to_array(64, 4, BigInt("0x" + pk.slice(68, 68 + 64))).map(
        (el) => el.toString()
    );

    return [XArr, YArr];
}

// Utils from https://github.com/personaelabs/heyanon 
function msgToMsgHashInput(message) {

    let msghash_bigint = BigInt(ethers.utils.hashMessage(message))
    var msghash_array = bigint_to_array(64, 4, msghash_bigint);
    return msghash_array
    }


function parsePrivateKey(privateKey) {

    return bigintToTuple(BigInt(privateKey))

}

module.exports = buildInput
