import { MouseEventHandler, useEffect, useState } from "react";
import { dilution, proposal } from "../utils/types";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { ethers } from "ethers";
import { COMPANY_TOKEN_CONTRACT_ABI } from "../utils/constants";

type props = {
  p: proposal;
  close: MouseEventHandler<HTMLButtonElement>;
  tokenAddress: string;
};

function ShowProposalModel({ p, close, tokenAddress }: props) {
  const { walletProvider } = useWeb3ModalProvider();

  const [dilutions, setDilutions] = useState<dilution[]>([]);

  async function getDilutions() {
    const provider = new ethers.BrowserProvider(
      walletProvider as ethers.Eip1193Provider
    );

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      tokenAddress,
      COMPANY_TOKEN_CONTRACT_ABI,
      signer
    );

    let dilutions: dilution[] = [];

    const _dilutions = await contract.getDilutionsForProposal(0);

    for (let index = 0; index < _dilutions.length; index++) {
      const element = _dilutions[index];
      dilutions.push({
        from: element[1],
        amount: Number(element[3]),
        to: element[2],
      });
    }

    setDilutions(dilutions);
  }

  async function rejectProposal() {
    const provider = new ethers.BrowserProvider(
      walletProvider as ethers.Eip1193Provider
    );

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      tokenAddress,
      COMPANY_TOKEN_CONTRACT_ABI,
      signer
    );

    console.log(p.id);

    const tx = await contract.revokeProposal(p.id);
    await tx.wait();
    console.log(tx);
  }

  async function approveProposal() {
    const provider = new ethers.BrowserProvider(
      walletProvider as ethers.Eip1193Provider
    );

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      tokenAddress,
      COMPANY_TOKEN_CONTRACT_ABI,
      signer
    );


    const tx = await contract.approveProposal(p.id);
    await tx.wait();
    console.log(tx);
  }

  useEffect(() => {
    getDilutions();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-10 ">
      <div className="bg-white p-4 rounded-xl w-[75%] max-h-90% overflow-y-scroll custom-scrollbar">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between">
            <h2>{p.title}</h2>
            <button onClick={close}>X</button>
          </div>
          <br />
          <p>{p.description}</p>
          <br />

          <h3>Dilutions:</h3>

          <table className="my-4">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {dilutions.map((dilution, index) => (
                <tr key={index}>
                  <td className="text-center">{dilution.from}</td>
                  <td className="text-center">{dilution.to}</td>
                  <td className="text-center">{dilution.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>Approvals: {Number(p.approvals)}</p>

          <div className="flex flex-row w-full justify-between">
            <button
              onClick={approveProposal}
              className="px-4 py-2 w-[50%] mx-2 my-4 border-emerald-400 border-2 rounded-lg  hover:bg-emerald-100 transition ease-in font-bold duration-100"
            >
              Accept
            </button>
            <button
              onClick={rejectProposal}
              className="px-4 py-2  w-[50%] mx-2 my-4 border-red-400 border-2 rounded-lg  hover:bg-red-100 transition ease-in font-bold duration-100"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowProposalModel;
