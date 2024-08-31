import { ApexOptions } from "apexcharts";

export type data = {
  name: string;
  symbol: string;
  owner: string;
  address: string;

  shareHolders: shareHolder[];
};

export type shareHolder = {
  id: number;
  address: string;
  amount: number;
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
}