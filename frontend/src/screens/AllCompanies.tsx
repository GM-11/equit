import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  COMPANY_TOKEN_CONTRACT_ABI,
  COMPANY_TOKEN_FACTORY_CONTRACT_ABI,
  COMPANY_TOKEN_FACTORY_CONTRACT_ADDRESS,
} from "../utils/constants";
import { Link } from "react-router-dom";

type company = {
  name: string;
  symbol: string;
  address: string;
  owner: string;
  totalCapital: number;
};

function AllCompanies() {
  const { walletProvider } = useWeb3ModalProvider();
  const { address } = useWeb3ModalAccount();
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

    for (let index = 0; index < allTokens.length; index++) {
      const element = allTokens[index];

      let companyContract = new ethers.Contract(
        element[3],
        COMPANY_TOKEN_CONTRACT_ABI,
        signer
      );

      console.log(element);

      const shareHolders = await companyContract.getAllShareHolders();
      let total = 0;

      for (let index = 0; index < shareHolders.length; index++) {
        const holder = shareHolders[index];
        console.log("holder");
        console.log(holder);
        total += Number(holder[2]) / 10 ** 18;

        if (holder[1] === address) {
          c.push({
            name: element[0],
            symbol: element[1],
            owner: element[2],
            address: element[3],
            totalCapital: total,
          });
          c.push({
            name: element[0],
            symbol: element[1],
            owner: element[2],
            address: element[3],
            totalCapital: total,
          });
          c.push({
            name: element[0],
            symbol: element[1],
            owner: element[2],
            address: element[3],
            totalCapital: total,
          });
        }
      }
    }
    setCompanies(c);
    console.log(c);
  }

  useEffect(function () {
    console.log("use effect");

    setUp();
  }, []);

  return (
    <main className="flex flex-col justify-start items-start">
      <section className="p-4 flex flex-row w-full justify-between">
        <h1>All Companies</h1>
        <w3m-account-button />
      </section>
      <section className="grid grid-cols-2 w-full mt-16 items-center  justify-center">
        {companies.map((c, index) => (
          <Link
            to={`/company/${c.address}`}
            state={{ name: c.name, symbol: c.symbol, owner: c.owner, capital: c.totalCapital }}
            className="border-2 border-emerald-300 p-4 flex flex-col justify-start items-start m-4 rounded-xl"
            key={index}
          >
            <section className="flex flex-row items-baseline mb-4 ">
              <h2>{c.name}</h2>
              <h3 className="ml-4">{c.symbol}</h3>
            </section>
            <h4>
              Token address: <strong>{c.address}</strong>
            </h4>
            <h4>
              Owner: <strong>{c.owner}</strong>
            </h4>

            <>{c.totalCapital}</>
          </Link>
        ))}
      </section>{" "}
    </main>
  );
}

export default AllCompanies;
