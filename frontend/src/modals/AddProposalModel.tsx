import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { ethers } from "ethers";
import { MouseEventHandler, useState } from "react";
import { COMPANY_TOKEN_CONTRACT_ABI } from "../utils/constants";
import { shareHolder } from "../utils/types";

type props = {
  initialShareHolders: shareHolder[];
  close: MouseEventHandler<HTMLButtonElement>;
  tokenAddress: string;
  totalCapital: number;
};

type newShareHolder = {
  id: number;
  address: string;
  amount: number;
  dilutedFrom?: string;
};

export default function AddProposalModel({
  initialShareHolders,
  close,
  tokenAddress,
}: props) {
  const { walletProvider } = useWeb3ModalProvider();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [proposedShareHolders, setProposedShareHolders] =
    useState<newShareHolder[]>(initialShareHolders);

  async function addProposal() {
    if (proposedShareHolders.reduce((a, b) => a + b.amount, 0) !== 100) {
      alert("Sum of shares should be equal to 100");
      return;
    }

    if (description === "" || title === "") {
      alert("Title and Description are required");
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

    const newShareHolders = proposedShareHolders.filter((val) => {
      return val.id >= initialShareHolders.length;
    });

    let totalCapital = 0;

    const dilutions = newShareHolders.map((val) => {
      return {
        from: val.dilutedFrom,
        amount: val.amount,
        to: val.address,
      };
    });

    for (let index = 0; index < initialShareHolders.length; index++) {
      const element = initialShareHolders[index];
      const balance = await providerContract.balanceOf(element.address);
      const paresdBalance = Number(ethers.formatEther(`${balance}`));
      totalCapital += paresdBalance;
    }

    if (totalCapital === 0) {
      alert("Total Capital is 0");
      return;
    }

    console.log(totalCapital, "total capital");

    const dilutionsTO = dilutions.map((val) => {
      return val.to;
    });
    const dilutionsFROM = dilutions.map((val) => {
      return val.from;
    });
    const dilutionsAMOUNT = dilutions.map((val) => {
      return (val.amount / 100) * totalCapital;
    });

    console.log(dilutionsTO, "dilutionsTO");
    console.log(dilutionsFROM, "dilutionsFROM");
    console.log(dilutionsAMOUNT, "dilutionsAMOUNT");

    if (dilutionsTO.length === 0) {
      alert("No dilutions");
      return;
    }

    if (
      dilutionsTO.length !== dilutionsFROM.length ||
      dilutionsTO.length !== dilutionsAMOUNT.length ||
      dilutionsFROM.length !== dilutionsAMOUNT.length
    ) {
      alert("Something went wrong");
      return;
    }

    const descriptionBytes = new TextEncoder().encode(description);

    const tx = await signerContract.addProposal(
      descriptionBytes,
      title,
      dilutionsTO,
      dilutionsFROM,
      dilutionsAMOUNT,
      dilutionsAMOUNT.length
    );

    await tx.wait();

    console.log(tx);
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
          {/* ADDRESS OF INITIAL */}
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
                        // let d = dilutions;
                        // d.push({ from: initialShareHolders[0].address, amount: proposedShares[value], to: value });
                      }}
                      type="text"
                      placeholder="Address"
                      className="border-b-2 border-gray-500 px-4 py-2"
                    />
                  </td>
                )}
                {/* SHARE PERCENTAGE */}
                <td className="text-center">
                  {shareHolder.amount}
                  {/* {(shareHolder.amount / totalCapital) * 100} */}
                </td>
                {/* PROPED AMOUNT */}
                <td className="text-center">
                  <input
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setProposedShareHolders((prev) => {
                        prev[shareHolder.id].amount = value;
                        return prev;
                      });
                    }}
                    type="number"
                    placeholder="Final Share"
                    className="border-b-2 border-gray-500 px-4 py-2"
                  />
                </td>
                {/* DILUTIONS */}
                <td>
                  {shareHolder.id >= initialShareHolders.length && (
                    <select
                      onChange={(val) => {
                        setProposedShareHolders((prev) => {
                          prev[shareHolder.id].dilutedFrom = val.target.value;
                          return prev;
                        });
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
                dilutedFrom: initialShareHolders[0].address,
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
