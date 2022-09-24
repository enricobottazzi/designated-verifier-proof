#!/bin/bash

PHASE1=./circom-ecdsa/circuits/pot21_final.ptau
BUILD_DIR=./build/verify
CIRCUIT_NAME=verify

if [ -f "$PHASE1" ]; then
    echo "Found Phase 1 ptau file"
else
    echo "No Phase 1 ptau file found. Exiting..."
    exit 1
fi

if [ ! -d "$BUILD_DIR" ]; then
    echo "No build directory found. Creating build directory..."
    mkdir -p "$BUILD_DIR"
fi

echo "****GENERATING WITNESS FOR SAMPLE INPUT****"
start=`date +%s`
node "$BUILD_DIR"/"$CIRCUIT_NAME"_js/generate_witness.js "$BUILD_DIR"/"$CIRCUIT_NAME"_js/"$CIRCUIT_NAME".wasm scripts/input_verify.json "$BUILD_DIR"/witness.wtns
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****EXPORTING WITNESS TO JSON ****"
start=`date +%s`
npx snarkjs wtns export json "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/witness.json
end=`date +%s`
echo "DONE ($((end-start))s)"

