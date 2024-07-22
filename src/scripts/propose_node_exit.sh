#!/usr/bin/env bash

set -e
#set -x

CURRENT_PATH=$(
  cd $(dirname ${BASH_SOURCE[0]})
  pwd
)
source ${CURRENT_PATH}/.env.sh
node_repo=$1
node_name=$2

# step 1: new node register to blockchain network
"$AXIOM_LEDGER_BINARY_PATH"/axiom-ledger --repo "$node_repo" node --rpc "$AXIOM_LEDGER_RPC_NODE" register --block-number 100000 --node-name "$node_name" --node-desc "$node_name" --sender "$COUNCIL_KEY_4"