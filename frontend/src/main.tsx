import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./screens/LandingPage.tsx";
import CreateCompany from "./screens/CreateCompany.tsx";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import AllCompanies from "./screens/AllCompanies.tsx";

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
    ],
  },
]);

createRoot(document.getElementById("root")!).render(<Root />);

function Root() {
  // 1. Your WalletConnect Cloud project ID
  const projectId = "7594a316c1c467100dafe6fe766c3914";

  // 2. Set chains
  const mainnet = {
    chainId: 1,
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "https://cloudflare-eth.com",
  };

  const anvil = {
    chainId: 31337,
    name: "Anvil",
    currency: "GO",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "http://127.0.0.1:8545",
  };

  // 3. Create a metadata object
  const metadata = {
    name: "EQUIT",
    description: "AppKit Example",
    url: "https://web3modal.com", // origin must match your domain & subdomain
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };

  // 4. Create Ethers config
  const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
    rpcUrl: "...", // used for the Coinbase SDK
    defaultChainId: 1, // used for the Coinbase SDK
  });

  // 5. Create a Web3Modal instance
  createWeb3Modal({
    ethersConfig,
    themeMode: "dark",
    themeVariables: {
      "--w3m-color-mix": "#708090",
    },
    defaultChain: anvil,
    chains: [mainnet, anvil],
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
  });

  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
