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

rm -rf stackup-bundler

if ps aux | grep stackup-bundler | grep -v grep | grep -q .
then
  kill $(ps aux | grep stackup-bundler | grep -v grep | awk '{print $2}')
fi

git clone git@github.com:axiomesh/stackup-bundler.git

cd stackup-bundler

# 切到该分支
git checkout release-2024-06-13

# 安装依赖
sudo make install-dev

# 生成环境变量文件.env，就在当前目录下
sudo make generate-environment

# 获取bundler私钥的地址，后面需要给bundler地址转token，否则因为该地址没有钱bundler没办法发交易
output=$(sudo make fetch-wallet 2>&1)
address_line=$(echo "$output" | grep "Address:")
echo $address_line > fetch-wallet.log

mv .env env.txt
ERC4337_BUNDLER_PRIVATE_KEY=$(cat env.txt | grep "ERC4337_BUNDLER_PRIVATE_KEY" )

{
    echo "ERC4337_BUNDLER_ETH_CLIENT_URL=http://127.0.0.1:8881"
    echo "ERC4337_BUNDLER_SUPPORTED_ENTRY_POINTS=0x0000000000000000000000000000000000001008"
    echo $ERC4337_BUNDLER_PRIVATE_KEY
} >>.env

rm -rf env.txt
cp -r fetch-wallet.log ${SOURCE_PATH}/data

sudo make build
sh ./start.sh


