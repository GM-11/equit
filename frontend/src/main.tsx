import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./screens/LandingPage.tsx";
import CreateCompany from "./screens/CreateCompany.tsx";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import AllCompanies from "./screens/AllCompanies.tsx";
import CompanyDashboard from "./screens/CompanyDashboard.tsx";

const router = createBrowserRouter([
  {
    path: "/",

    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/create",
        element: <CreateCompany />,
      },
      {
        path: "/companies",
        element: <AllCompanies />,
      },
      {
        path: "/company/:tokenAddress",
        element: <CompanyDashboard/>
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(<Root />);

function Root() {
  const projectId = "7594a316c1c467100dafe6fe766c3914";

  const anvil = {
    chainId: 31337,
    name: "Anvil",
    currency: "GO",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "http://127.0.0.1:8545",
  };

  const baseSepolia = {
    chainId: 84532,
    name: "Base Sepolia",
    currency: "ETH",
    rpcUrl: "https://chain-proxy.wallet.coinbase.com?targetName=base-sepolia",
    explorerUrl: "https://basescan.org/",
  };

  const coreTestnet = {
    chainId: 1115,
    name: "Core Blockchain TestNet",
    currency: "tCORE",
    rpcUrl: "https://scan.test.btcs.network/",
    explorerUrl: "https://rpc.test.btcs.network",
  };

  const metadata = {
    name: "EQUIT",
    description: "AppKit Example",
    url: "https://web3modal.com",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };

  const ethersConfig = defaultConfig({
    metadata,

    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: "...",
    defaultChainId: 1,
  });

  createWeb3Modal({
    ethersConfig,
    themeMode: "dark",
    themeVariables: {
      "--w3m-color-mix": "#708090",
    },
    defaultChain: baseSepolia,
    chains: [coreTestnet, baseSepolia, anvil],
    projectId,
    enableAnalytics: true,
  });

  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
