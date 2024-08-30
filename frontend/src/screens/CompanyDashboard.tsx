import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { ethers } from "ethers";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { COMPANY_TOKEN_CONTRACT_ABI } from "../utils/constants";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

type data = {
  name: string;
  symbol: string;
  owner: string;
  address: string;
  shareHolders: shareHolder[];
};

type shareHolder = {
  id: number;
  address: string;
  amount: number;
};

function CompanyDashboard() {
  const { walletProvider } = useWeb3ModalProvider();
  const { tokenAddress } = useParams();
  let { state } = useLocation();
  const [companyData, setCompanyData] = useState<data>();
  const [shareHoldersData, setShareHoldersData] = useState<shareHolder[]>();
  const [series, setSeries] = useState<number[]>([]);

  const options: ApexOptions = {
    chart: {
      width: 500,
      type: "pie",
    },
    colors: ["#FFCF00", "#FFC000"],

    labels: ["Team A", "Team B"],
    dataLabels: {
      enabled: true,
    },
    legend: {
      labels: {
        colors: ["#f00", "#0f0", "#00f"],
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 400,
          },
        },
      },
    ],
  };

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
    console.log(state);
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

    const shareHoldersAmount = shareHolders.map(
      (shareHolder) => shareHolder.amount
    );

    setSeries(shareHoldersAmount);
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <main className="flex flex-col justify-start items-start">
      {companyData && (
        <div>
          <section className="flex flex-col justify-start items-start">
            <h1>{companyData.name}</h1>
            <p>{companyData.address}</p>
          </section>
          <section>
            <p>asdfjkl;</p>
            <Chart
              options={options}
              series={series}
              height={300}
              width={300}
              type="pie"
            />
          </section>
        </div>
      )}
    </main>
  );
}

export default CompanyDashboard;
