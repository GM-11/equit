import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { BrowserProvider, ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  COMPANY_TOKEN_FACTORY_CONTRACT_ABI,
  COMPANY_TOKEN_FACTORY_CONTRACT_ADDRESS,
} from "../utils/constants";

function CreateCompany() {
  const [companyName, setCompanyName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [minRequired, setMinRequired] = useState<number>(0);
  const [initalCapital, setInitialCapital] = useState<number>(0);

  const { isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(function () {
    if (isConnected) {
      const provider = new BrowserProvider(
        walletProvider as ethers.Eip1193Provider
      );
      const contract = new ethers.Contract(
        COMPANY_TOKEN_FACTORY_CONTRACT_ADDRESS,
        COMPANY_TOKEN_FACTORY_CONTRACT_ABI,
        provider
      );

      console.log(contract);

      contract.on("CompanyTokenCreated", function (event) {
        console.log("Company Token Created \n", event);
      });
      return function () {
        contract.off("CompanyTokenCreated", function (event) {
          console.log("Company Token Created OFF\n", event);
        });
      };
    }
  }, []);

  async function createCompany() {
    if (companyName === "" || symbol === "") {
      alert("Please fill in all fields");
    }

    if (minRequired === 0) {
      alert("Minimum approvals required must be greater than 0");
    }

    if (companyName.length < 3) {
      alert("Company name must be at least 3 characters long");
    }

    if (symbol.length < 3) {
      alert("Symbol too short");
    }

    if (initalCapital <= 0) {
      alert("Initial capital must be greater than 0");
    }

    if (symbol.length > 5) {
      alert("Symbol too long");
    }

    const ethersProvider = new BrowserProvider(
      walletProvider as ethers.Eip1193Provider
    );
    const signer = await ethersProvider.getSigner();

    console.log(signer);

    if (isConnected) {
      const contract = new ethers.Contract(
        COMPANY_TOKEN_FACTORY_CONTRACT_ADDRESS,
        COMPANY_TOKEN_FACTORY_CONTRACT_ABI,
        signer
      );

      try {
        const res = await contract.createCompanyToken(
          companyName,
          symbol,
          minRequired,
          initalCapital
        );
        console.log(res);
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <main>
      <h1>Create your company</h1>
      <w3m-button />
      <form className="mt-8">
        <table>
          <tr>
            <td className="text-left ">
              <label>Company Name</label>
            </td>
            <td>
              <input
                className="px-2 py-1 ml-2 border-2 border-gray-300 rounded-lg"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td className=" text-left">
              <label>Symbol</label>
            </td>
            <td>
              <input
                className="px-2 py-1 ml-2 border-2 border-gray-300 rounded-lg"
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              />
            </td>
          </tr>
          <tr>
            <td className=" text-left">
              <label>Minimum Approvals Required </label>
            </td>
            <td>
              <input
                className="px-2 py-1 ml-2 border-2 border-gray-300 rounded-lg"
                type="number"
                value={minRequired}
                onChange={(e) => setMinRequired(parseInt(e.target.value))}
              />
            </td>
          </tr>
          <tr>
            <td className=" text-left">
              <label> Initial Captial (ETH) </label>
            </td>
            <td>
              <input
                className="px-2 py-1 ml-2 border-2 border-gray-300 rounded-lg"
                type="number"
                value={initalCapital}
                onChange={(e) => setInitialCapital(parseInt(e.target.value))}
              />
            </td>
          </tr>
        </table>
      </form>{" "}
      <button
        className="px-4 py-2  my-4 border-emerald-400 border-2 rounded-lg  hover:bg-emerald-100 transition ease-in font-bold duration-100"
        onClick={createCompany}
      >
        Create Company
      </button>
    </main>
  );
}

export default CreateCompany;
