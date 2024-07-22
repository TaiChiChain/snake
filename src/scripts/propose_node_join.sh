#!/usr/bin/env bash

set -e
#set -x

CURRENT_PATH=$(
  cd $(dirname ${BASH_SOURCE[0]})
  pwd
)
source ${CURRENT_PATH}/.env.sh
node_repo=${1:-"${CURRENT_PATH}/new-nodes/node5"}
node_name=${2:-"node5"}

function propose_node_join() {
# new node register to blockchain network
"$node_repo"/tools/bin/axiom-ledger --repo "$node_repo" node --rpc "$AXIOM_LEDGER_RPC_URL" register --block-number 1000000 --node-name "$node_name" --node-desc "$node_name" --sender "$COUNCIL_KEY_1" > ${CURRENT_PATH}/proposal.info

  sleep 2
  # get proposal id
  proposal_id=$(cat "${CURRENT_PATH}"/proposal.info | grep "proposal id" | awk '{print $NF}')
  echo "$proposal_id"
  # get proposal hash
  #proposal_hash=$(cat "${CURRENT_PATH}"/proposal.info | grep "tx hash" | awk '{print $NF}')
  #echo "proposal hash: $proposal_hash"
}

propose_node_join