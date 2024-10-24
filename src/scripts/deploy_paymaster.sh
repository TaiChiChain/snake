#!/usr/bin/env bash

set -e
set -x

CURRENT_PATH=$(cd $(dirname ${BASH_SOURCE[0]}); pwd)
#echo $CURRENT_PATH
source ${CURRENT_PATH}/.env.sh
SOURCE_PATH=$(dirname "${CURRENT_PATH}")
#echo $SOURCE_PATH
PROJECT_PATH=$(dirname "${SOURCE_PATH}")
#echo $PROJECT_PATH
cd "$(dirname "${PROJECT_PATH}")"
pwd
rm -rf verifying-paymaster
if ps aux | grep verifying-paymaster | grep -v grep | grep -q .
then
  kill $(ps aux | grep verifying-paymaster | grep -v grep | awk '{print $2}')
fi
git clone git@github.com:axiomesh/verifying-paymaster.git
cd verifying-paymaster
sudo make build
mkdir logs
rm -rf .env
{
    echo "PAYMASTER_PRIVATE_KEY_PASSWORD=axiomesh"
    echo "PAYMASTER_PORT=10088"
    echo "PAYMASTER_CHAIN_ID=1356"
    echo "PAYMASTER_VALID_PERIOD=\"10m\""
    echo "PAYMASTER_ENABLE_TLS=false"
} >>.env

{
    echo "$COUNCIL_KEY_4"
} >>sk.txt

cp -r ${SOURCE_PATH}/key/encrypted_key.txt ./
bash start.sh &

