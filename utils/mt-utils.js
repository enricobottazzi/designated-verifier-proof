const { Group } = require("@semaphore-protocol/group")

function marshallMerkleProof () {

    const group = new Group(32)
    let groupMembers = [BigInt("0x18afd50b47cc095dddaa20d48e429183afd3dd7dd508edaf9ef0582315b18345"), BigInt("0x4a8c08329fe89d1f0a8f9270fe4fc7ad12b87c5336eb8222bf80a6b20413bbb"), BigInt("0x854c3ff930263fbed74f55251e1ddff15cd7ad4b83503e069f58251bff751f5")]
    group.addMembers(groupMembers)   
    const merkleProof = group.generateProofOfMembership(group.indexOf(groupMembers[0]))

    let input = JSON.stringify(merkleProof, (_, v) => typeof v === 'bigint' ? v.toString() : v)

    console.log(input)
}

marshallMerkleProof ()
