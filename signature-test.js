const ethers = require('ethers');
const {bigintToTuple, bigint_to_array, bigint_to_Uint8Array, Uint8Array_to_bigint } = require ("./utils/convertors.js");


// from here => https://github.com/ethers-io/ethers.js/issues/447 
async function sign () {

    const myWallet = new ethers.Wallet("89b2443cda47f74e976545e685ddda8032a60d3a86aba54d309481a76bb38435")

    let message = "hello"
    let msghash = ethers.utils.solidityKeccak256(["string"], [message])
    const sig = await myWallet.signMessage(ethers.utils.arrayify(msghash))

    const pk = ethers.utils.recoverPublicKey(
      ethers.utils.arrayify(ethers.utils.hashMessage(ethers.utils.arrayify(msghash))),
      sig
    )
  
    console.log("pk", pk)

    // it works 

    // const domain = {
    //     name: 'Ether Mail',
    //     version: '1',
    //     chainId: 1,
    //     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    // };
    
    // // The named list of all type definitions
    // const types = {
    //     Person: [
    //         { name: 'name', type: 'string' },
    //         { name: 'wallet', type: 'address' }
    //     ],
    //     Mail: [
    //         { name: 'from', type: 'Person' },
    //         { name: 'to', type: 'Person' },
    //         { name: 'contents', type: 'string' }
    //     ]
    // };
    
    // // The data to sign
    // const value = {
    //     from: {
    //         name: 'Cow',
    //         wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
    //     },
    //     to: {
    //         name: 'Bob',
    //         wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
    //     },
    //     contents: 'Hello, Bob!'
    // };
    
    // const signature = await myWallet._signTypedData(domain, types, value);

    // console.log("signature", signature)

    // const hash = _TypedDataEncoder.hash(domain, types, value);
    
    // 0xb1cd9e9cb8c6606b50e0d7c2c962f93e4c32bd8ed583ae84b10210bffda6779452dd167242236be03951e1e2a823789854a7406cc1b1eb595e7dc2f34e9154a61c
    // console.log("signature to Bytes", hexToBytes(signature))
    // console.log("signature to Bytes length", hexToBytes(signature).length)
    
    
    // 0x0413e3ab4f6e9c2f579bc32bc98a00bf20c0e4d4f98f9f90c5ff1c67918187288d57f31faacd03a324eb92dd060ce523d5372fe3e47258a1d5c67906f836303cc3
}

sign()