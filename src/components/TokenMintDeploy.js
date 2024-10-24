import React, { useState } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import TokenMintArtifact from './TokenMint.json'; // Replace this with the correct path to your ABI file

export function TokenMintDeploy() {
    const { library, account } = useWeb3React(); // Using the Web3 React context to get the connected provider and account
    const [status, setStatus] = useState("");

    const deployToken = async () => {
        if (!library) {
            setStatus("Please connect to a wallet first.");
            return;
        }

        const treasuryAddress = process.env.REACT_APP_TREASURY_ADDRESS;
        const bondingCurveAddress = process.env.REACT_APP_BONDING_CURVE_ADDRESS;

        if (!treasuryAddress || !bondingCurveAddress) {
            setStatus("Treasury or Bonding Curve address is not set.");
            return;
        }

        try {
            // Create a new instance of the contract factory with the ABI, bytecode, and the wallet signer
            const TokenMint = new ethers.ContractFactory(
                TokenMintArtifact.abi, // The ABI of your contract
                TokenMintArtifact.bytecode, // The bytecode of your contract
                library.getSigner(account) // The signer for deploying the contract
            );

            // Deploy the contract
            const tokenMint = await TokenMint.deploy(treasuryAddress, bondingCurveAddress);
            setStatus("Deploying TokenMint...");

            // Wait for the transaction to be mined
            await tokenMint.deployTransaction.wait();

            // Update the status with the deployed contract address
            setStatus(`TokenMint deployed at: ${tokenMint.address}`);
        } catch (error) {
            console.error("Error deploying contract:", error);
            setStatus(`Failed to deploy: ${error.message}`);
        }
    };

    return (
        <div>
            <button onClick={deployToken}>Deploy TokenMint</button>
            <p>{status}</p>
        </div>
    );
}
