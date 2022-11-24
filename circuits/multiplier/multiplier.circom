pragma circom 2.0.0;

include "../dvp-component.circom";
/*This circuit template checks that c is the multiplication of a and b.*/  

template Multiplier2 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output c;  

   // Constraints.  
   c <== a * b;  
}

template DesignatedVerifierMultiplier2 (n, k) {

   signal input a;  
   signal input b;  
   signal input expectedC;
   signal input privkey[k];
   signal input addr;
   signal output out;

   component multiplier = Multiplier2();

    multiplier.a <== a;
    multiplier.b <== b;
   
   component dvEverything = DesignatedVerifierProofComponent(n, k);

    dvEverything.expectedOutCircuit <== expectedC;
    dvEverything.actualOutCircuit <== multiplier.c;

    for (var i = 0; i < k; i++) {
        dvEverything.privkey[i] <== privkey[i];
    }

    dvEverything.addr <== addr;

    out <== dvEverything.out;
}

component main {public [expectedC,addr]} = DesignatedVerifierMultiplier2(64, 4);
