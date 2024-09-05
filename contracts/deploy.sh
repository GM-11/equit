
read -p "Enter network: " network

if [ "$network" == "local" ]; then
echo "Deploying Company Factory Contract"
forge create ./src/CompanyTokenFactory.sol:CompanyTokenFactory --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
fi

if [ "$network" == "sepolia" ]; then
echo "Deploy Company Factory Contract to Sepolia"
forge create ./src/CompanyTokenFactory.sol:CompanyTokenFactory --rpc-url https://sepolia-rollup.arbitrum.io/rpc --private-key 0x7f3ed3d4b4d6dca6127fca65f465c94cd541938faf126d6c481fe9b8800e502b
fi
if [ "$network" == "base-sepolia" ]; then
echo "Deploy Company Factory Contract to Sepolia"
forge create ./src/CompanyTokenFactory.sol:CompanyTokenFactory --rpc-url https://chain-proxy.wallet.coinbase.com?targetName=base-sepolia --private-key 0x7f3ed3d4b4d6dca6127fca65f465c94cd541938faf126d6c481fe9b8800e502b
fi

echo "Copying ABIS"
cp -r out/CompanyToken.sol/CompanyToken.json ../frontend/src/utils/abis/CompanyToken.json
cp -r out/CompanyTokenFactory.sol/CompanyTokenFactory.json ../frontend/src/utils/abis/CompanyTokenFactory.json
echo "Copying Done"