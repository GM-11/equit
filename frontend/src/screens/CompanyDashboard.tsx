import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { ethers } from "ethers";
import { useLocation, useParams } from "react-router-dom";
import { COMPANY_TOKEN_CONTRACT_ABI } from "../utils/constants";
import { MouseEventHandler, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { chartOptions, data, shareHolder } from "../utils/types";

const colors = ["#FFCF00", "#FFC000"];

function CompanyDashboard() {
  const { walletProvider } = useWeb3ModalProvider();
  const { tokenAddress } = useParams();
  let { state } = useLocation();
  const [companyData, setCompanyData] = useState<data>();
  const [series, setSeries] = useState<number[]>([]);
  const [showAddProposalModel, setShowAddProposalModel] = useState(false);
  const [options, setOptions] = useState<ApexOptions>(chartOptions);

  async function getData() {
    if (!tokenAddress) {
      return;
    }

    const provider = new ethers.BrowserProvider(
      walletProvider as ethers.Eip1193Provider
    );

    const contract = new ethers.Contract(
      tokenAddress,
      COMPANY_TOKEN_CONTRACT_ABI,
      provider
    );

    const _allShareHolders = await contract.getAllShareHolders();
    const _allProposals = await contract.getAllProposals();
    console.log("pros");

    console.log(_allProposals);
    console.log(_allShareHolders);
    let shareHolders: shareHolder[] = [];
    for (let index = 0; index < _allShareHolders.length; index++) {
      const id = Number(_allShareHolders[index][0]);
      const address = _allShareHolders[index][1];
      const amount = Number(ethers.formatEther(_allShareHolders[index][2]));
      console.log({ id, address, amount });

      shareHolders.push({ id, address, amount });
    }

    setCompanyData({
      name: state.name,
      symbol: state.symbol,
      owner: state.owner,
      shareHolders: shareHolders,
      address: tokenAddress,
    });

    console.log(shareHolders);

    const shareHoldersAmount = shareHolders.map(
      (shareHolder) => shareHolder.amount
    );

    const shareHolderLabels = shareHolders.map(
      (shareHolder) =>
        shareHolder.address.substring(0, 6) +
        "..." +
        shareHolder.address.substring(38)
    );

    setOptions({
      ...options,
      labels: shareHolderLabels,
    });

    setSeries(shareHoldersAmount);
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      {showAddProposalModel && companyData && (
        <AddProposalModel
          initialShareHolders={companyData.shareHolders}
          tokenAddress={companyData.address}
          close={() => setShowAddProposalModel(false)}
        />
      )}
      <main className="flex flex-col justify-start w-full min-h-screen items-start z-0">
        {companyData && (
          <div className="grid grid-cols-1 md:grid-cols-2 ">
            <section className="flex flex-col justify-start items-start h-fulls w-[50vw] bg-green-500 p-4 z-0">
              <h1>
                {companyData.name} ({companyData.symbol})
              </h1>
              <h4>Token addres: {companyData.address}</h4>
              <br />
              <div className="w-full flex flex-row justify-between">
                <h2>Proposals</h2>
                <button
                  onClick={() => {
                    setShowAddProposalModel(true);
                  }}
                  className="text-4xl rounded-full bg-yellow-500 w-12 text-center align-middle items-center h-12"
                >
                  +
                </button>
              </div>
            </section>
            <section className="flex flex-col justify-center items-center align-middle bg-red-500 w-[50vw] z-0">
              <br />
              <Chart
                options={options}
                series={series}
                height={350}
                width={350}
                type="pie"
              />
              <br />
              <h2>Share Distribution</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {companyData.shareHolders.map((shareHolder) => (
                    <tr key={shareHolder.id}>
                      <td>{shareHolder.address}</td>
                      <td>{shareHolder.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export default CompanyDashboard;

type props = {
  initialShareHolders: shareHolder[];
  close: MouseEventHandler<HTMLButtonElement>;
  tokenAddress: string;
};

function AddProposalModel({ initialShareHolders, close, tokenAddress }: props) {
  const { walletProvider } = useWeb3ModalProvider();
  const [title, setTitle] = useState("");
  const [proposedShareHolders, setProposedShareHolders] =
    useState<shareHolder[]>(initialShareHolders);
  const [description, setDescription] = useState("");
  const [proposedShares, setProposedShares] = useState<number[]>([]);
  const [dilutions, setDilutions] = useState<
    {
      from: string;
      amount: number;
    }[]
  >([]);

  async function addProposal() {
    if (proposedShares.reduce((a, b) => a + b, 0) !== 100) {
      alert("Sum of shares should be equal to 100");
      return;
    }

    const provider = new ethers.BrowserProvider(
      walletProvider as ethers.Eip1193Provider
    );

    const signer = await provider.getSigner();

    const providerContract = new ethers.Contract(
      tokenAddress,
      COMPANY_TOKEN_CONTRACT_ABI,
      provider
    );
    const signerContract = new ethers.Contract(
      tokenAddress,
      COMPANY_TOKEN_CONTRACT_ABI,
      signer
    );

    console.log(signerContract);
    let inititalCapital = []; // in ETH
    let finalCapital = proposedShares.map((share) => {
      return (share / 100) * 100;
    });
    let dilutions = [];

    for (let index = 0; index < initialShareHolders.length; index++) {
      const element = initialShareHolders[index];
      const balance = await providerContract.balanceOf(element.address);
      const paresdBalance = Number(ethers.formatEther(`${balance}`));
      inititalCapital.push(paresdBalance);
    }
    console.log(inititalCapital);
    console.log(finalCapital);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-10 ">
      <div className="bg-white p-4 rounded-xl w-[75%] max-h-90% overflow-y-scroll custom-scrollbar">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between">
            <h2>Add Proposal</h2>
            <button onClick={close}>X</button>
          </div>
          <br />
          <input
            type="text"
            placeholder="Title"
            className="border-b-2 border-gray-500 px-4 py-2"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <br />
          <textarea
            className="border-b-2 border-gray-500 px-4 py-2"
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
        </div>{" "}
        <br />
        <table className="w-full bg-red-500 my-4 ">
          <thead>
            <tr>
              <th className="text-center">Address</th>
              <th className="text-center">Initial Share (%)</th>
              <th className="text-center">Proposed Final Share (%)</th>
              <th className="text-center">Diluted From</th>
            </tr>
          </thead>
          <tbody className="mt-2">
            {proposedShareHolders.map((shareHolder) => (
              <tr key={shareHolder.id}>
                {shareHolder.id < initialShareHolders.length ? (
                  <td className="text-center">
                    {shareHolder.address.substring(0, 6) +
                      "..." +
                      shareHolder.address.substring(38)}
                  </td>
                ) : (
                  <td>
                    <input
                      onChange={(e) => {
                        const value = e.target.value;
                        setProposedShareHolders((prev) => {
                          prev[shareHolder.id].address = value;
                          return prev;
                        });
                      }}
                      type="text"
                      placeholder="Address"
                      className="border-b-2 border-gray-500 px-4 py-2"
                    />
                  </td>
                )}
                <td className="text-center">{shareHolder.amount}</td>
                <td className="text-center">
                  <input
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setProposedShares((prev) => {
                        prev[shareHolder.id] = value;
                        return prev;
                      });
                    }}
                    type="number"
                    placeholder="Final Share"
                    className="border-b-2 border-gray-500 px-4 py-2"
                  />
                </td>
                <td>
                  {shareHolder.id >= initialShareHolders.length && (
                    <select
                      onChange={(val) => {
                        console.log(val);
                      }}
                    >
                      {initialShareHolders.map((item) => (
                        <option className="font-bold" value={item.address}>
                          {item.address.substring(0, 6) +
                            "..." +
                            item.address.substring(38)}
                        </option>
                      ))}
                    </select>
                  )}{" "}
                </td>
                <td>
                  <button
                    disabled={shareHolder.id < initialShareHolders.length}
                    onClick={() => {
                      setProposedShareHolders((prev) => {
                        return prev.filter(
                          (item) => item.id !== shareHolder.id
                        );
                      });
                    }}
                    className=" m-0 p-0 bg-yellow-500 h-7 w-7 rounded-full"
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={() => {
            setProposedShareHolders((prev) => [
              ...prev,
              {
                id: prev.length,
                address: "",
                amount: 0,
              },
            ]);
          }}
          className="text-sm mb-4 mx-2 align-middle text-center"
        >
          Add Share Holder
        </button>
        <button
          onClick={addProposal}
          className="w-full bg-slate-400 rounded-md cursor-pointer py-2 hover:bg-slate-500 transition ease-linear duration-75 font-bold"
        >
          Add
        </button>
      </div>
    </div>
  );
}
