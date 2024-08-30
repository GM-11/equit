import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import {
  COMPANY_TOKEN_FACTORY_CONTRACT_ABI,
  COMPANY_TOKEN_FACTORY_CONTRACT_ADDRESS,
} from "../utils/constants";

type company = {
  name: string;
  symbol: string;
  address: string;
  owner: string;
};

function AllCompanies() {
  const { walletProvider } = useWeb3ModalProvider();
  const [companies, setCompanies] = useState<company[]>([]);

  async function setUp() {
    const ethersProvider = new ethers.BrowserProvider(
      walletProvider as ethers.Eip1193Provider
    );
    const signer = await ethersProvider.getSigner();

    const contract = new ethers.Contract(
      COMPANY_TOKEN_FACTORY_CONTRACT_ADDRESS,
      COMPANY_TOKEN_FACTORY_CONTRACT_ABI,
      signer
    );

    let c: company[] = [];
    const allTokens = await contract.getAllCompanyTokens();
    console.log(allTokens);

    for (let index = 0; index < allTokens.length; index++) {
      const element = allTokens[index];
      c.push({
        name: element[0],
        symbol: element[1],
        address: element[2],
        owner: element[3],
      });
    }
    setCompanies(c);
    console.log(companies);
  }

  useEffect(function () {
    setUp();
  }, []);

  return (
    <main>
      <w3m-account-button />
      <h1>All Companies</h1>
      {companies.map((c, index) => (
        <div key={index}>
          <h2>{c.name}</h2>
          <h3>{c.symbol}</h3>
          <h4>Token address: {c.address}</h4>
          <h5>Owner: {c.owner}</h5>
        </div>
      ))}
    </main>
  );
}

export default AllCompanies;
