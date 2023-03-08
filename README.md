# Protecting Private Communication Channels with Designated Verifier Proofs 

> The code in this repo is unaudited and not recommended for production use

**Core Team**: Enrico Bottazzi (Developer) and Shrey Jain (Researcher and PM). Enrico Bottazzi is an Applied ZK Developer and Shrey Jain is a Web3 Researcher at Microsoft.

Despite the progress being made in cryptography, we still lack the technological countermeasures to prevent the public revelation of private communication. Examples of this abuse is seen with China’s digital Yuan, Snowden's Turnkey Tyranny, media giants profiting off of users private information, large technology companies merging with surveillance states, and the rise of foreign and domestic conflicts that spur the erosion of civil liberties [1-3]. 

Regardless of the methods being used to improve both the security and privacy on a communication channel, so long as an agent is able to interpret and understand information, there is no technological tool that can prevent this information from being shared. 

The gap that exists today is that we associate privacy with being a mathematical problem that can be solved by cryptography. Privacy is not mathematical, it is fundamentally social. Given that it is a social problem, it requires social data structures to solve it, yet there are few solutions today that look at privacy from this angle. 

To protect our privacy, not only do we need to ensure that our cryptographic tools withstand the test of quantum computers, but we also need to design social data structures that can prevent information from being persuasive in its shared form (having a 3rd party believe private information) [4]. Designated verifier proofs (DVPs) were introduced in 1996 as a social data structure in the form of a cryptographic scheme to ensure that only a designated verifier is persuaded of information being communicated to them and any 3rd party is unsure whether the designated verifier is telling the truth or not [5]. 

This repository aims at providing the tools for builders to use DVPs for communication more broadly to mitgiate the persuasiveness of private information in its shared form. 
_________________________________________________________________________________________________

DVP is a reusable component to add a designated verifier to your zk circom circuit. It means that the zk proof generated from your circuit cannot be verified by someonewho is not the designated verifier (identified by its ethereum public address). For this example we used the component to generate a designated verifier proof of valid ECDSA signature. 

DVP uses Zero Knowledge Proof to achieve that:

- The prover chooses the designated verifier
- The prover signs the message to be shared with the designated verifier 
- The prover generates a proof that the signature is valid (1st condition) **OR** he/she knows the private key of the designated verifier (2nd condition)
- The verifier receives the proof

After the verifier receives the proof, he/she can potentially share it with third parties. But here's the cool thing:
No one, except for the designated verifier, can tell if the proof verifies because of the 1st condition or the 2nd condition, i.e. because it has been forged by the designated verifier.

Idea inspired by: 

- [Jordi Baylina - ZKP and SSI - Iden3](https://www.youtube.com/watch?v=Rd6SMShk7-c&t=998s)
- [Markus Jakobsson - Designated Verifier Proofs and Their Applications paper](http://markus-jakobsson.com/papers/jakobsson-eurocrypt96.pdf)

## Circuit Design 

The design of the circuit relies on two main components: 

- [0xPARC `ECDSAVerifyNoPubkeyCheck`](https://github.com/0xPARC/circom-ecdsa/blob/master/circuits/ecdsa.circom#L129): Given a signature (r, s), a message hash, and a secp256k1 public key, it follows ecdsa verification algorithm to extract r' from s, message hash and public key, and then compares r' with r to see if the signaure is correct. The output result is 1 if r' and r are equal, 0 otherwise.
- [0xPARC `ECDSAPrivToPub`](https://github.com/0xPARC/circom-ecdsa/blob/master/circuits/ecdsa.circom#L14): Given a secp256k1 private key, outputs the corresponding public key by computing (private_key) * G where G is the base point of secp256k1.

The circuit [`DesignatedVerifierProof`](./circuits/lib/designated-verifier-proof.circom) meshes these two circuits together to verify 2 conditions: 

- Is the signature actually been performed by that `pubkey`?
- Does the private key match the `Designated Verifier Address`? 

Each of these conditions generates an intermediate signal => 1 if verifier and 0 if not verified. These two signals are eventually passed into a `OR` verification that generates the single public output of the circuit: 1 if at least one of the condition verifies or 0 if none of the condition verifies.

<div align="center">
<img src= "./imgs/dvs.png" align="center"/>
</div>

## Designated Verifier Proof in Practice

The essence of the DVP is based on a simple yet very powerful concept. Let's consider an example: Alice signs a message X and passes it to Bob (not using a DVP). In this scenario Bob is able to check that the signature is valid and it actually comes from Alice. Bob can now share this proof with third parties and *anyone will be persuaded* by the fact "Alice signed message X".

Using DVP, Alice generates a proof that the signature of message X is valid *OR* that she knows the private key of the designated verifier. This proof is passed to Bob. Bob is aware that his private key hasn't been compromised by Alice, therefore he knows that the proof must be valid because the signature is valid. 

What if Bob wants to persuade other people that "Alice signed message X"? He can still share the proof received by Alice with third parties but they wouldn't know whether: 

- The proof verifies because the signature is valid
- The proof verifies because the verifier knows his own private key (which is true by definition)

With DVP *only the Designated Verifier will be persuaded* by the signature provided by the Prover.

## Setup 

- Install package dependencies `npm i`
- Clone submodule from root directory `git submodule update --init`
- Install sub module dependencies `cd circom-ecdsa / npm i`
- Download ptau inside circuits folder `cd circuits / wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_21.ptau`

## Test 

- `export NODE_OPTIONS=--max-old-space-size=120480000` to specifies the amount of virtual memory allocated to Node.js in order to avoid Javascript running out of memory
- `mocha`

Note; in order to successfully test it a patch to circom_tester must be applied:

Comment out line 90 and 91 inside `node_modules/circom_tester/wasm/tester.js`. These avoids breaking the circom_tester compiler due to warnings included in the circuit compilation.

```js
// assert(b.stderr == "",
//   "circom compiler error \n" + b.stderr);
```

## Machine setup to build

To interact with such large circuits, it is needed to operate with very large machines and set a few tweaks to make it possible:

- [Set up your instance](https://hackmd.io/V-7Aal05Tiy-ozmzTGBYPA?view#Setup-from-scratch)
- [Remove system memory limit](https://hackmd.io/V-7Aal05Tiy-ozmzTGBYPA?view#Remove-system-memory-limit)
- [Install Snarkjs](https://docs.circom.io/getting-started/installation/#installing-snarkjs)
- Clone the repo and follow the setup previously described
- `export NODE_OPTIONS=--max-old-space-size=120480000` 
- To build `bash scripts/setup_dvp.sh`

I used a AWS c3.8xlarge instance to build this. This instance has 32vCPU, 60GB of RAM and 30 GB of SSD Memory. The instance will use Ubuntu 20.04. It costs $1.6/hour to run.

The circuit specified in this repo has 1756287 constraints.

## Benchmarks

All benchmarks were run on the AWS c3.8xlarge machine previously described.

|   |dvp|
|---|---|
|Constraints                          |1756287 |
|Circuit compilation                  |153s    |
|Witness generation                   |232s     |
|Trusted setup phase 2 key generation |722s     |
|Trusted setup phase 2 contribution   |104s      |
|Proving key size                     |1.2G     |
|Proving key verification             |787s     |
|Proving time                         |66s      |
|Proof verification time              |1s      |

The most intense step is the proving key generation. Luckily, this process need to be executed only once and can be reused for every application that wants to use this circuit architecture. 

The artifacts generated during the Trusted Setup are publicly available :

- proving key **zkey** `wget https://dvs-eb-bucket.s3.eu-west-2.amazonaws.com/dvs.zkey` 
- circuit **wasm** `wget  https://dvs-eb-bucket.s3.eu-west-2.amazonaws.com/dvs.wasm`
- verification key **vkey** `wget https://dvs-eb-bucket.s3.eu-west-2.amazonaws.com/vkey.json`

Users will only need these artifact in order to generate/verify proofs. These processes are much less light weight and can be executed locally inside any browser.

**References**

- [1] The, “The digital yuan offers China a way to dodge the dollar,” Economist (London, England: 1843), The Economist, Sep. 05, 2022. Accessed: Oct. 16, 2022. [Online]. Available: https://www.economist.com/finance-and-economics/2022/09/05/the-digital-yuan-offers-china-a-way-to-dodge-the-dollar
- [2]	E. Snowden, “Edward Snowden on Protecting Activists Against Surveillance,” WIRED, Sep. 18, 2018. https://www.wired.com/story/wired25-edward-snowden-malkia-cyril-activist-surveillance/ (accessed Oct. 16, 2022).
- [3]	B. X. Chen, “The Battle for Digital Privacy Is Reshaping the Internet,” The New York Times, The New York Times, Sep. 16, 2021. Accessed: Oct. 16, 2022. [Online]. Available: https://www.nytimes.com/2021/09/16/technology/digital-privacy.html.
- [4]	E. Kamenica and M. Gentzkow, “Bayesian Persuasion,” Am. Econ. Rev., vol. 101, no. 6, pp. 2590–2615, Oct. 2011.
- [5]	M. Jakobsson, K. Sako, and R. Impagliazzo, “Designated Verifier Proofs and Their Applications,” Advances in Cryptology — EUROCRYPT ’96, pp. 143–154, 1996.

## Using the CLI 

0. Create a `.env` file in the project directory and add there an Etherscan API KEY following this format: 

```
API_KEY_ETHERSCAN="XXXXX"
```

We are gonna use this API in step 2 to retrieve the public key of the alleged signer starting from its address

1. Download the artifacts generated during the trusted setup

```bash
    mkdir artifacts-folder
    cd artifacts-folder
    wget https://dvs-eb-bucket.s3.eu-west-2.amazonaws.com/dvs.zkey
    wget  https://dvs-eb-bucket.s3.eu-west-2.amazonaws.com/dvs.wasm
    wget https://dvs-eb-bucket.s3.eu-west-2.amazonaws.com/vkey.json
```

2. Generate the proof

```
node cli/dvp.js gen-proof 0xaf365471712541c890ccfefbb999ead07c1a9de89dd31ee78b3414b7afe0bcd0616171dd276e19e3a2b259be28693ea434bc16d6dbd317a1411f45a61a5f16b41b msg.txt 0x9992847Cb19492673457f7f088Eb2d102F98aeCC 0xe4D9621321e77B499392801d08Ed68Ec5175f204 artifacts-folder
```

Where: 

-`0xaf365471712541c890ccfefbb999ead07c1a9de89dd31ee78b3414b7afe0bcd0616171dd276e19e3a2b259be28693ea434bc16d6dbd317a1411f45a61a5f16b41b` is a standard [EIP-191 signature](https://docs.ethers.io/v5/api/signer/#Signer-signMessage). You can generate one using [this Sandbox](https://codesandbox.io/s/react-eth-metamask-signatures-ibuxj?file=/src/SignMessage.js)
- `msg.txt` is the path to the file that contains the message that was been signed 
- `0x9992847Cb19492673457f7f088Eb2d102F98aeCC` is the address of the alleged signer. This is a public signal inside the zk program. Note that this doesn't have to match the address of the **actual** signer of the message. A malicious prover can arbitrarly choose the address to put here.
- `0xe4D9621321e77B499392801d08Ed68Ec5175f204` is the address of the designated verifier has been saved
- `artifacts-folder` is the folder where the artifacts have been downloaded from step 1

> Alert: the ECDSA verify circuit takes the public key of the alleged singer as input. Not the address! In order to fetch the public key we need the address to have executed at least one tx on ethereum. Here's the [why](https://ethereum.stackexchange.com/questions/13778/get-public-key-of-any-ethereum-account) and the[how](https://gist.github.com/chrsengel/2b29809b8f7281b8f10bbe041c1b5e00). This means that if the address of the alleged signer you entered has never interacted on Ethereum mainnet, the program won't work

By default, we consider that the PrivateKey of the Designated Verifier is not known by the prover. In that case a random private key is generated. In the case the (malicious) prover knows the private key of the designated verifier, this can be passed as optional input 

```
node cli/dvp.js gen-proof 0xaf365471712541c890ccfefbb999ead07c1a9de89dd31ee78b3414b7afe0bcd0616171dd276e19e3a2b259be28693ea434bc16d6dbd317a1411f45a61a5f16b41b msg.txt 0x9992847Cb19492673457f7f088Eb2d102F98aeCC 0xe4D9621321e77B499392801d08Ed68Ec5175f204 artifacts-folder -pkey 7e4a26d6d34648fdc64848f87fcf798107e6c08b3b4628498b5fdf73304eded1
```

where `7e4a26d6d34648fdc64848f87fcf798107e6c08b3b4628498b5fdf73304eded1` is the private key of the designated verifier.

Additionally, it can be specified where to save the outputs of this command, which are the proof and the public signals. 

```
node cli/dvp.js gen-proof 0x439c9002d40Fb1AfEBc3969B06e9b9F66fd8B3ee artifacts test-folder/sig.json  -oProof test-folder/proof.json -oPublic test-folder/public.json
```

If not specified, the will be saved by default to a file named `proof.json` and `public.json` inside your current directory.

3. Verify the Proof

```
node cli/dvp.js verify-proof proof.json public.json artifacts-folder                                                                               
```

Where: 

- `proof.json` and `public.json` are the paths where the proof and the public Signals have been saved
- `artifacts-folder` is the folder where the artifacts have been downloaded from step 1

## Updates

- [ ] Create an independent circuit component that can be plugged into every circuit
- [ ] Make it work like "I know the signature of the designated verifier" rather than "I know the private key of the designated verifier". This is mainly for UX and security reason and it is always advisable not to deal with plain private keys



