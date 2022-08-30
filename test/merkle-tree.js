const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const { Group } = require("@semaphore-protocol/group")

describe("MerkleTree", function() {
  this.timeout(1000 * 1000);

  it("verify membership of a leaf that is part of the group", async () => {
    let circuit = await wasm_tester(path.join(__dirname, "../circuits", "mt.circom"));

    // Create semaphore group and add members 
    const group = new Group(32)
    let groupMembers = [BigInt("0x18afd50b47cc095dddaa20d48e429183afd3dd7dd508edaf9ef0582315b18345"), BigInt("0x4a8c08329fe89d1f0a8f9270fe4fc7ad12b87c5336eb8222bf80a6b20413bbb"), BigInt("0x854c3ff930263fbed74f55251e1ddff15cd7ad4b83503e069f58251bff751f5")]
    group.addMembers(groupMembers)   
    const merkleProof = group.generateProofOfMembership(group.indexOf(groupMembers[0]))
    
    const w = await circuit.calculateWitness({
        "leaf": merkleProof.leaf,
        "pathIndices": merkleProof.pathIndices,
        "siblings": merkleProof.siblings,
        "root": merkleProof.root
    }, true);

    await circuit.assertOut(w, {out: "1"});
    await circuit.checkConstraints(w);
  });

  it("verify non membership of a leaf that is not part of the group", async () => {
    let circuit = await wasm_tester(path.join(__dirname, "../circuits", "mt.circom"));

    // Create semaphore group and add members 
    const group = new Group(32)
    let groupMembers = [BigInt("0x18afd50b47cc095dddaa20d48e429183afd3dd7dd508edaf9ef0582315b18345"), BigInt("0x4a8c08329fe89d1f0a8f9270fe4fc7ad12b87c5336eb8222bf80a6b20413bbb"), BigInt("0x854c3ff930263fbed74f55251e1ddff15cd7ad4b83503e069f58251bff751f5")]
    group.addMembers(groupMembers)
    const merkleProof = group.generateProofOfMembership(group.indexOf(groupMembers[0]))

    let nonMemberLeaf = BigInt("0x18afd50b47cc095dddaa20d48e429183afd3dd7dd508edaf9ef0582315b18346")
    
    const w = await circuit.calculateWitness({
        "leaf": nonMemberLeaf,
        "pathIndices": merkleProof.pathIndices,
        "siblings": merkleProof.siblings,
        "root": merkleProof.root
    }, true);

    await circuit.assertOut(w, {out: "0"});
    await circuit.checkConstraints(w);
  });
});