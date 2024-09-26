#!/usr/bin/env bash

set -e
#set -x

CURRENT_PATH=$(
  cd $(dirname ${BASH_SOURCE[0]})
  pwd
)
source ${CURRENT_PATH}/.env.sh

query_args=${1:-"current"}



function query_epoch_info() {
# new node register to blockchain network
"${CURRENT_PATH}"/new-nodes/node5/tools/bin/axiom-ledger --repo "${CURRENT_PATH}"/new-nodes/node5 epoch --rpc "$AXIOM_LEDGER_RPC_URL"  "$query_args" 
}

           
query_epoch_info