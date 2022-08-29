function bigintToTuple(x) {
    // 2 ** 64
    let mod = 18446744073709551616n
    let ret = [0n, 0n, 0n, 0n];
  
    var x_temp = x;
    for (var idx = 0; idx < 4; idx++) {
      ret[idx] = x_temp % mod;
      x_temp = x_temp / mod;
    }

    for (var idx = 0; idx < 4; idx++) {
      ret[idx] = ret[idx].toString();
    }

    return ret;
  }

function addressToBigInt(x){
    console.log(BigInt(x))
}

addressToBigInt("0x03A1a33cCFA0fDb876519F4E54b9fEFab716c686")

