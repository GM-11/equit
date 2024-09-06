import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { ethers } from "ethers";
import { useLocation, useParams } from "react-router-dom";
import { COMPANY_TOKEN_CONTRACT_ABI } from "../utils/constants";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { chartOptions, data, proposal, shareHolder } from "../utils/types";
import { hexBytesToString } from "../utils/functions";
import AddProposalModel from "../modals/AddProposalModel";
import ShowProposalModel from "../modals/ShowProposalModel";

function CompanyDashboard() {
  const { walletProvider } = useWeb3ModalProvider();
  const { address } = useWeb3ModalAccount();
  const { tokenAddress } = useParams();
  let { state } = useLocation();
  const [companyData, setCompanyData] = useState<data>();
  const [series, setSeries] = useState<number[]>([]);
  const [showAddProposalModel, setShowAddProposalModel] = useState(false);
  const [showPropsalModel, setShowProposalModel] = useState<proposal | null>(
    null
  );
  const [options, setOptions] = useState<ApexOptions>(chartOptions);

  async function getData() {
    if (!tokenAddress) {
      return;
    }

    const provider = new ethers.BrowserProvider(
      walletProvider as ethers.Eip1193Provider
    );

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      COMPANY_TOKEN_CONTRACT_ABI,
      signer
    );
    const providerContract = new ethers.Contract(
      tokenAddress,
      COMPANY_TOKEN_CONTRACT_ABI,
      provider
    );

    const _allShareHolders = await contract.getAllShareHolders();
    const _allProposals = await contract.getAllProposals();
    const minRequired = Number(await contract.MIN_REQUIRED());

    let proposals: proposal[] = [];

    for (let index = 0; index < _allProposals.length; index++) {
      const element = _allProposals[index];

      const id = Number(element[0]);
      const owner = element[1];
      const title = element[2];
      const description = hexBytesToString(element[3]);
      const executed = element[4];
      const timestamp = element[5];
      const approvals = element[6];
      const totalProposedDilutions = element[7];

      proposals.push({
        id,
        owner,
        description,
        title,
        executed,
        timestamp,
        approvals,
        totalProposedDilutions,
      });
    }

    let shareHolders: shareHolder[] = [];
    for (let index = 0; index < _allShareHolders.length; index++) {
      const id = Number(_allShareHolders[index][0]);
      const address = _allShareHolders[index][1];
      const amount = Number(
        ethers.formatEther(await providerContract.balanceOf(address))
      );

      shareHolders.push({ id, address, amount });
    }

    setCompanyData({
      name: state.name,
      symbol: state.symbol,
      owner: state.owner,
      shareHolders,
      address: tokenAddress,
      proposals: proposals,
      totalCapital: state.capital,
      minRequired,
    });

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

  async function executeProposal(proposalId: number) {
    if (!tokenAddress) return;

    const provider = new ethers.BrowserProvider(
      walletProvider as ethers.Eip1193Provider
    );

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      COMPANY_TOKEN_CONTRACT_ABI,
      signer
    );

    const tx = await contract.executeProposal(proposalId);
    await tx.wait();
    console.log(tx);
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
          totalCapital={companyData.totalCapital}
        />
      )}
      {showPropsalModel && companyData && (
        <ShowProposalModel
          p={showPropsalModel}
          close={() => setShowProposalModel(null)}
          tokenAddress={companyData.address}
        />
      )}
      <main className="flex flex-col justify-start w-full min-h-screen items-start z-0">
        {companyData && (
          <div className="grid grid-cols-1 md:grid-cols-2 ">
            <section className="flex flex-col justify-start items-start w-[50vw]  p-4 z-0">
              <h1>
                {companyData.name} ({companyData.symbol})
              </h1>
              <h4>
                Token address: <strong> {companyData.address}</strong>{" "}
              </h4>
              <h4>
                Minimum Approvals Required:{" "}
                <strong> {companyData.minRequired} </strong>
              </h4>
              <br />
              <div className="w-full flex flex-row justify-between align-middle items-center">
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

              {companyData.proposals.map((proposal) => {
                return (
                  <div
                    key={Number(proposal.timestamp)}
                    className="flex flex-col w-[90%] p-4 rounded-xl m-4 align-middle items-center border-2 border-amber-500"
                  >
                    <button onClick={() => setShowProposalModel(proposal)}>
                      <h3>{proposal.title}</h3>
                      <table className="w-full p-4">
                        <tr>
                          <td>Owner</td>
                          <td>{proposal.owner}</td>
                        </tr>
                        <tr>
                          <td>Proposed On</td>
                          <td>
                            {new Date(
                              Number(proposal.timestamp) * 1000
                            ).toDateString()}
                          </td>
                        </tr>
                        <tr>
                          <td>Approvals</td>
                          <td>{Number(proposal.approvals)}</td>
                        </tr>
                        <tr>
                          <td>Executed</td>
                          <td>{proposal.executed ? "Yes" : "No"}</td>
                        </tr>
                      </table>
                    </button>
                    {companyData.shareHolders.length <=
                      companyData.minRequired &&
                      companyData.shareHolders
                        .some((holder) => holder.address === address)
                        .valueOf() && !proposal.executed.valueOf() && (
                        <button
                          onClick={() => executeProposal(proposal.id)}
                          className="px-4 py-2  mt-4 border-emerald-400 border-2 rounded-lg  hover:bg-emerald-100 transition ease-in font-bold duration-100"
                        >
                          Execute
                        </button>
                      )}

                    {proposal.approvals < companyData.minRequired
                      ? "Not enough approvals"
                      : "Enough Approvals"}
                  </div>
                );
              })}
            </section>
            <section className="flex flex-col justify-center items-center align-middle  z-0">
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
