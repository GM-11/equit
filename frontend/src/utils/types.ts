import { ApexOptions } from "apexcharts";

export type data = {
  name: string;
  symbol: string;
  owner: string;
  address: string;
  shareHolders: shareHolder[];
  proposals: proposal[];
  totalCapital: number
  minRequired: number;
};

export type shareHolder = {
  id: number;
  address: string;
  amount: number;
};

export type proposal = {
  id: number;
  owner: string;
  description: string;
  title: string;
  executed: boolean;
  timestamp: number;
  approvals: number;
  totalProposedDilutions: number;
};

export type dilution = {
  from: string;
  amount: number;
  to: string;
};

export const chartOptions: ApexOptions = {
  chart: {
    width: 400,
    type: "pie",
  },
  colors: ["#FFCF00", "#FFC000"],

  labels: ["Team A", "Team B"],
  dataLabels: {
    enabled: true,
  },
  legend: {
    show: false,
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
