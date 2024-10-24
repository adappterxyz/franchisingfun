import React from "react";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../connectors"; // Assuming you have a connectors.js file for injected connector (e.g., MetaMask)

export const WalletConnect = () => {
  const { activate, account } = useWeb3React();

  const connectWallet = async () => {
    // Logic to connect to the wallet
    // For example, using MetaMask
    if (window.ethereum) {
      try {
        await activate(injected); // Assuming 'injected' is your connector
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      console.error("No wallet found");
    }
  };

  return (
    <div>
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};
