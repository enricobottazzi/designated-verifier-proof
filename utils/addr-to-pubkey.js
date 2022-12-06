const ethers = require('ethers');
require('dotenv').config()

async function getPubKeyFromAddress (address) {

  console.log()

    const etherscanProvider = new ethers.providers.EtherscanProvider(
      "homestead",
      `${process.env.API_KEY_ETHERSCAN}`
    );
        
    const pubKey = await etherscanProvider
      .getHistory(address)
      .then(async (history) => {
        // first need to fetch a tx in order to use recoverPublicKey()
        let lastTxIndex = history.length - 1;
        return await getPubKeyFromtxHash(history[lastTxIndex].hash);
      });
  
    return pubKey
  };
  
  // Add error handling here
async function getPubKeyFromtxHash (txHash) {
    const infuraProvider = new ethers.providers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${process.env.API_KEY_INFURA}`
    );
  
    const tx = await infuraProvider.getTransaction(txHash);
  
    const expandedSig = {
      r: tx.r,
      s: tx.s,
      v: tx.v
    };
  
    const signature = ethers.utils.joinSignature(expandedSig);
  
    let transactionHashData;
    switch (tx.type) {
      case 0:
        transactionHashData = {
          gasPrice: tx.gasPrice,
          gasLimit: tx.gasLimit,
          value: tx.value,
          nonce: tx.nonce,
          data: tx.data,
          chainId: tx.chainId,
          to: tx.to
        };
        break;
      case 2:
        transactionHashData = {
          gasLimit: tx.gasLimit,
          value: tx.value,
          nonce: tx.nonce,
          data: tx.data,
          chainId: tx.chainId,
          to: tx.to,
          type: 2,
          maxFeePerGas: tx.maxFeePerGas,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas
        };
        break;
      default:
        throw "Unsupported transactionHash type";
    }
    const rstransactionHash = await ethers.utils.resolveProperties(
      transactionHashData
    );
    const raw = ethers.utils.serializeTransaction(rstransactionHash); // returns RLP encoded transactionHash
    const msgHash = ethers.utils.keccak256(raw); // as specified by ECDSA
    const msgBytes = ethers.utils.arrayify(msgHash); // create binary hash
    const recoveredPubKey = ethers.utils.recoverPublicKey(msgBytes, signature);
    return recoveredPubKey;
  };
  
module.exports = getPubKeyFromAddress
