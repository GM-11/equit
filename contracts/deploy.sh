
read -p "Enter network (local / prod): " network

if [ "$network" == "local" ]; then
echo "Deploying Company Factory Contract"
forge create ./src/CompanyTokenFactory.sol:CompanyTokenFactory --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

echo ""
else
    echo "Invalid network type. Please enter 'local' or 'prod'."
fi

echo "Copying ABIS"
cp -r out/CompanyToken.sol/CompanyToken.json ../frontend/src/utils/abis/CompanyToken.json
cp -r out/CompanyTokenFactory.sol/CompanyTokenFactory.json ../frontend/src/utils/abis/CompanyTokenFactory.json
echo "Copied"