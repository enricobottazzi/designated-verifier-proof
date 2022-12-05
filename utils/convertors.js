// for converting privkey to 4-tuple
function bigintToTuple(x) {
    // 2 ** 64
    let mod = 18446744073709551616n
    let ret = [0n, 0n, 0n, 0n];
  
    var x_temp = x;
    for (var idx = 0; idx < 4; idx++) {
      ret[idx] = (x_temp % mod).toString();
      x_temp = x_temp / mod;
    }
    return ret;
  }

function bigint_to_array(n, k, x) {
      let mod = 1n;
      for (var idx = 0; idx < n; idx++) {
          mod = mod * 2n;
      }
  
      let ret = [];
      var x_temp = x;
      for (var idx = 0; idx < k; idx++) {
          ret.push((x_temp % mod).toString());
          x_temp = x_temp / mod;
      }
      return ret;
  }
  
function bigint_to_Uint8Array(x) {
      var ret = new Uint8Array(32);
      for (var idx = 31; idx >= 0; idx--) {
          ret[idx] = Number(x % 256n);
          x = x / 256n;
      }
      return ret;
  }
  
function Uint8Array_to_bigint(x) {
      var ret = 0n;
      for (var idx = 0; idx < x.length; idx++) {
          ret = ret * 256n;
          ret = ret + BigInt(x[idx]);
      }
      return ret;
  }


module.exports = {bigintToTuple, bigint_to_array, bigint_to_Uint8Array, Uint8Array_to_bigint}
  