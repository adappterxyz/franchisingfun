import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import TokenMintArtifact from './contracts/TokenMint.json'; 
import BondingCurveArtifact from './contracts/BondingCurve.json'; 
import { 
  AppBar, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Container, 
  Grid, 
  Paper, 
  Tab, 
  Tabs, 
  TextField, 
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  Stack,
  AlertTitle,
  Link,
  Snackbar,
  Slider,
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  Add, 
  Refresh, 
  ArrowBack,
  ShoppingCart,
  Sell,
  Dashboard,
  InfoOutlined,
  ShowChart,
  Gavel,
  Upload,
  HowToVote,
  LocalAtm,
  Description,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import BuySellTab from './components/BuySellTab';
import Marketplace from './components/Marketplace';
import Governance from './components/Governance';
import Portfolio from './components/Portfolio';
import CreateToken from './components/CreateToken';

// Update chain ID for your network (Sepolia example: 11155111)
const injected = new InjectedConnector({ supportedChainIds: [84532] });

// Function to initialize ethers provider with web3-react
function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

// Define the ERC20 ABI
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [
      { "name": "owner", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },

  // transfer function to send tokens to another address
  {
    "constant": false,
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // transferFrom function for transferring on behalf of another address
  {
    "constant": false,
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "value", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Add this near the top of your WalletConnectComponent
const DUMMY_TOKENS = [
  {
    address: "0x1234567890123456789012345678901234567890",
    name: "Burger Chain DAO",
    ticker: "BURGER"
  },
  {
    address: "0x2345678901234567890123456789012345678901",
    name: "Pizza Franchise DAO",
    ticker: "PIZZA"
  },
  {
    address: "0x3456789012345678901234567890123456789012",
    name: "Coffee Shop DAO",
    ticker: "COFFEE"
  }
];

// Add these constants for the bonding curve parameters
const MAX_SUPPLY = 1000000; // 1 million tokens
const CURVE_FACTOR = 0.000000009; // Adjusts the steepness of the curve
const INITIAL_PRICE = 0.1; // Starting price in USDC

// Add this helper function to calculate price using the bonding curve formula
const calculatePrice = (supply) => {
  return INITIAL_PRICE + Math.pow(supply, 2) * CURVE_FACTOR;
};

function WalletConnectComponent() {
  const { activate, active, account, library, deactivate, setError } = useWeb3React();
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState("");
  // Update isConnected state to use active from web3-react
  const [isConnected, setIsConnected] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenTicker, setTokenTicker] = useState("");
  const [stablecoinAmount, setStablecoinAmount] = useState(0);
  const [erc20tokenamount, setErc20tokenamount] = useState(0); // Added state for stablecoin amount
  const [tokenAddresses, setTokenAddresses] = useState([]); // Now will store array of token objects
  const [selectedTokenAddress, setSelectedTokenAddress] = useState(""); // Added state for selected token address
  const [selectedTokenTicker, setSelectedTokenTicker] = useState("");
  const [stablecoinBalance, setStablecoinBalance] = useState(null); // State to hold the stablecoin balance
  const [quotedVal, setquotedVal] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tradeMode, setTradeMode] = useState('buy');
  const [walletError, setWalletError] = useState(null);
  const [showWalletGuide, setShowWalletGuide] = useState(false);
  const [supplyData, setSupplyData] = useState([]);
  const [currentSupply, setCurrentSupply] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Add useEffect to sync isConnected with web3-react active state
  useEffect(() => {
    setIsConnected(active);
  }, [active]);

  // Add this new states

  // Add this helper function
  const getWalletErrorMessage = (error) => {
    if (!window.ethereum) {
      return {
        title: "Wallet Not Found",
        message: "Please install a Web3 wallet to continue.",
        action: "install"
      };
    }
    
    if (error?.code === 4001) {
      return {
        title: "Connection Rejected",
        message: "You rejected the connection request. Please try again.",
        action: "retry"
      };
    }

    if (error?.code === -32002) {
      return {
        title: "Connection Pending",
        message: "Please check your wallet for pending connection requests.",
        action: "check"
      };
    }

    return {
      title: "Connection Error",
      message: error?.message || "An unknown error occurred.",
      action: "retry"
    };
  };

  // Update your connect wallet function
  const connectWallet = async () => {
  
    if (!window.ethereum) {
      console.log("attempting...");
      setWalletError({
        title: "Wallet Not Found",
        message: "Please install a Web3 wallet to continue.",
        action: "install"
      });
      setShowWalletGuide(true);
      return;
    }

    try {
      setStatus("Connecting wallet...");
      await activate(injected);
      // Remove manual setIsConnected as it will be handled by the useEffect
      setStatus("Wallet connected!");
    } catch (error) {
      console.error("Connection Error: ", error);
      setWalletError(getWalletErrorMessage(error));
    }
  };

  // Update the useEffect for loading token addresses
  useEffect(() => {
    const loadTokens = async () => {
      try {
        // Try to get tokens from localStorage first
        const storedAddresses = JSON.parse(localStorage.getItem("tokenAddresses"));
        
        if (!storedAddresses || storedAddresses.length === 0) {
          // If localStorage is empty, try to fetch from Cloudflare
          try {
            const response = await fetch('https://your-cloudflare-worker.workers.dev/tokens');
            const cloudflareTokens = await response.json();
            setTokenAddresses(cloudflareTokens);
            // Optionally save to localStorage
            localStorage.setItem("tokenAddresses", JSON.stringify(cloudflareTokens));
          } catch (cloudflareError) {
            console.log("Cloudflare fetch failed, using dummy data:", cloudflareError);
            // If Cloudflare fetch fails, use dummy data
            setTokenAddresses(DUMMY_TOKENS);
            // Optionally save to localStorage
            localStorage.setItem("tokenAddresses", JSON.stringify(DUMMY_TOKENS));
          }
        } else {
          setTokenAddresses(storedAddresses);
        }
      } catch (error) {
        console.error("Error loading tokens:", error);
        // If all else fails, use dummy data
        setTokenAddresses(DUMMY_TOKENS);
      }
    };

    loadTokens();
  }, []);

  // Auto-connect to MetaMask if authorized
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await activate(injected);
            setIsConnected(true);
          }
        } catch (err) {
          console.error("Auto-connect failed: ", err);
          setError(err);
        }
      }
    };
    autoConnect();
  }, [activate, setError]);

  // Update disconnectWallet function
  const disconnectWallet = () => {
    try {
      deactivate();
      // Clear all relevant states
      setBalance(null);
      setStablecoinBalance(null);
      setTokenBalances({});
      setStatus("");
      // Clear any other relevant states you have
    } catch (ex) {
      console.log("Disconnection Error: ", ex);
    }
  };

  // Add useEffect to handle initial balance fetch
  useEffect(() => {
    if (active && account && library) {
      fetchEthBalance();
      fetchStablecoinBalance();
      fetchTokenBalances();
    }
  }, [active, account, library]);

  // Deploy TokenMint contract
  const deployToken = async (tokenName, tokenTicker) => {
    if (!library || !account) {
      setStatus("Please connect to a wallet first.");
      return;
    }
    const treasuryAddress = process.env.REACT_APP_TREASURY_ADDRESS;
    const bondingCurveAddress = process.env.REACT_APP_BONDING_CURVE_ADDRESS;
    const signer = library.getSigner(account);

    try {
      const TokenMint = new ethers.ContractFactory(
        TokenMintArtifact.abi,
        TokenMintArtifact.bytecode,
        signer
      );

      const tokenMint = await TokenMint.deploy(tokenName, tokenTicker, treasuryAddress, bondingCurveAddress);
      await tokenMint.deployTransaction.wait();
      setStatus(`TokenMint deployed at: ${tokenMint.address}`);

      // Create token object with all relevant information
      const tokenInfo = {
        address: tokenMint.address,
        name: tokenName,
        ticker: tokenTicker,
        datadump: brandDetails
      };

      // Store the deployed token info in local storage
      const updatedTokens = [...tokenAddresses, tokenInfo];
      setTokenAddresses(updatedTokens);
      localStorage.setItem("tokenAddresses", JSON.stringify(updatedTokens));
    } catch (error) {
      setStatus(`Failed to deploy: ${error.message}`);
    }
  };
const getQuote = async (action,v) => {
  if(action=='buy'){
  setStablecoinAmount(v);
  try {
    // Only get quote if we have both a value and a selected token address
    if (v && selectedTokenAddress) {
      const quote = await getTokenQuote(v, selectedTokenAddress);
      // Convert the BigNumber to a human-readable format
      console.log(quote);
      const formattedQuote = ethers.utils.formatUnits(quote, 18);
      setquotedVal(formattedQuote);
    } else {
      setquotedVal(0);
    }
  } catch (error) {
    console.error("Error getting quote:", error);
    setquotedVal(0);
  }
}else{
  setErc20tokenamount(v);
  try {
    // Only get quote if we have both a value and a selected token address
    if (v && selectedTokenAddress) {
      const quote = await getStableQuote(v, selectedTokenAddress);
      // Convert the BigNumber to a human-readable format
      console.log(quote);
      const formattedQuote = ethers.utils.formatUnits(quote, 18);
      setquotedVal(formattedQuote);
    } else {
      setquotedVal(0);
    }
  } catch (error) {
    console.error("Error getting quote:", error);
    setquotedVal(0);
  }
}
};

  const buyToken = async (stablecoinAmount) => {
    if (!library || !account) {
      setStatus("Please connect to a wallet first.");
      return;
    }
  
    const signer = library.getSigner(account);
  
    try {
      // The stablecoin contract (e.g., USDC)
      const stablecoinAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Replace with actual stablecoin address
      const stablecoinContract = new ethers.Contract(stablecoinAddress, ERC20_ABI, signer);
  
      // The bonding curve contract address
      const bondingCurveAddress = process.env.REACT_APP_BONDING_CURVE_ADDRESS;
  
 
      // Check initial allowance before approval
      let initialAllowance = await stablecoinContract.allowance(account, bondingCurveAddress);
      console.log(100011); 
      const initallow =ethers.utils.formatUnits(initialAllowance, 6);
    console.log(111);
      const selling =ethers.utils.formatUnits(stablecoinAmount.toString(), 6);
      console.log(1134331);
      console.log('ONE:',initallow, 'TWO:', selling);
 if(initallow > selling){ 
  console.log(`Initial Allowance: ${initallow} USDC`);
  
 }else{

      // First, approve the bonding curve contract to spend the stablecoinAmount
      const approvalTx = await stablecoinContract.approve(bondingCurveAddress, ethers.constants.MaxUint256); // Assuming USDC has 6 decimals
      await approvalTx.wait(); // Wait for the approval transaction to complete
      console.log(`Approval successful for ${stablecoinAmount} USDC`);
    }
         console.log(111111); 
      // Now call the bonding curve contract to buy tokens
    const BondingCurve = new ethers.Contract(bondingCurveAddress, BondingCurveArtifact.abi, signer);
 
    const amountInWei = ethers.utils.parseUnits(stablecoinAmount, 6);
  console.log(stablecoinAmount,amountInWei);
    const Tx = await BondingCurve.buyTokens(amountInWei, selectedTokenAddress);
    
    await Tx.wait(); // Wait for the approval transaction to complete
      console.log(`Swap successful for ${stablecoinAmount} USDC`);
      fetchTokenBalances();
      fetchStablecoinBalance();
    } catch (error) {
      
      console.error(error);
    }
  };
  const sellToken = async (erc20tokenamount) => {
    if (!library || !account) {
      setStatus("Please connect to a wallet first.");
      return;
    }
  
    const signer = library.getSigner(account);
  
    try {
      // The stablecoin contract (e.g., USDC)
      const erc20token = new ethers.Contract(selectedTokenAddress, ERC20_ABI, signer);
  
      // The bonding curve contract address
      const bondingCurveAddress = process.env.REACT_APP_BONDING_CURVE_ADDRESS;
  
 
      // Check initial allowance before approval
      let initialAllowance = await erc20token.allowance(account, bondingCurveAddress);

      const initallow =ethers.utils.formatUnits(initialAllowance, 6);
   
      const selling =ethers.utils.parseUnits(stablecoinAmount.toString(), 6);
     
      console.log('ONE:',initallow, 'TWO:', selling);
      fetchTokenBalances();
      fetchStablecoinBalance();
 if(initallow > selling){ 
  console.log(`Initial Allowance: ${initallow} USDC`);
  
 }else{

      // First, approve the bonding curve contract to spend the stablecoinAmount
      const approvalTx = await erc20token.approve(bondingCurveAddress, ethers.constants.MaxUint256); // Assuming USDC has 6 decimals
      await approvalTx.wait(); // Wait for the approval transaction to complete
      console.log(`Approval successful for ${stablecoinAmount} USDC`);
    }
      // Now call the bonding curve contract to buy tokens
    const BondingCurve = new ethers.Contract(bondingCurveAddress, BondingCurveArtifact.abi, signer);
 
    const amountInWei = ethers.utils.parseUnits(erc20tokenamount, 18);
    
    const Tx = await BondingCurve.sellTokens(amountInWei, selectedTokenAddress);
    
    await Tx.wait(); // Wait for the approval transaction to complete
      console.log(`Swap successful for ${stablecoinAmount} USDC`);
   
    } catch (error) {
      
      console.error(error);
    }
  };
  async function getTokenQuote(stablecoinAmount, tokenAddress) {
    try {
     
      const signer = library.getSigner();
      const bondingCurveAddress = process.env.REACT_APP_BONDING_CURVE_ADDRESS;
 
      const BondingCurve = new ethers.Contract(bondingCurveAddress, BondingCurveArtifact.abi, signer);
     
      // Convert the stablecoinAmount to wei (or the appropriate decimal places)
      // Assuming stablecoinAmount is in USDC (6 decimals)
     
      const amountInWei = ethers.utils.parseUnits(stablecoinAmount, 6);
     
      // Call calculateTokens with the properly formatted amount
      const tokenAmount = await BondingCurve.calculateTokens(amountInWei, tokenAddress);
      console.log(tokenAmount);
      console.log(`Token Amount Quote: ${ethers.utils.formatUnits(tokenAmount, 18)}`);
      return tokenAmount
    } catch (error) {
      console.error("Failed to retrieve token quote:", error);
      throw error;
    }
}

async function getStableQuote(tokenAmount, tokenAddress) {
  try {
   
    const signer = library.getSigner();
    const bondingCurveAddress = process.env.REACT_APP_BONDING_CURVE_ADDRESS;

    const BondingCurve = new ethers.Contract(bondingCurveAddress, BondingCurveArtifact.abi, signer);
   
    // Convert the stablecoinAmount to wei (or the appropriate decimal places)
    // Assuming stablecoinAmount is in USDC (6 decimals)
   
    const amountInWei = ethers.utils.parseUnits(tokenAmount, 6);
   
    // Call calculateTokens with the properly formatted amount
    const stableAmount = await BondingCurve.calculateStable(amountInWei, tokenAddress);
    console.log(tokenAmount);
    console.log(`Token Amount Quote: ${ethers.utils.formatUnits(stableAmount, 18)}`);
    return stableAmount
  } catch (error) {
    console.error("Failed to retrieve token quote:", error);
    throw error;
  }
}
  const fetchStablecoinBalance = async () => {
    if (!library) return;

    const stablecoinAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Stablecoin contract address
    const signer = library.getSigner();

    try {
        const stablecoinContract = new ethers.Contract(stablecoinAddress, ERC20_ABI, signer);
        const balance = await stablecoinContract.balanceOf(account); // Fetch balance for the connected account
        await setStablecoinBalance(ethers.utils.formatUnits(balance, 6)); // Assuming the stablecoin has 18 decimals
   console.log("usdc:", balance,stablecoinBalance);
      } catch (error) {
        console.error("Error fetching stablecoin balance: ", error);
    }
  };

  const fetchEthBalance = async () => {
    if (!library || !account) return;

    try {
        const balance = await library.getBalance(account); // Fetch ETH balance
        setBalance(ethers.utils.formatEther(balance)); // Convert to ETH
    } catch (error) {
        console.error("Error fetching ETH balance: ", error);
    }
  };

  useEffect(() => {
    fetchEthBalance(); // Fetch ETH balance
    fetchStablecoinBalance(); // Fetch stablecoin balance
  }, [account, library]);

  // Add new state for token balances
  const [tokenBalances, setTokenBalances] = useState({});

  // Add new function to fetch token balances
  const fetchTokenBalances = async () => {
    if (!library || !account || !tokenAddresses.length) return;
    
    const signer = library.getSigner();
    const newBalances = {};
    
    for (const token of tokenAddresses) {
      try {
        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
        const balance = await tokenContract.balanceOf(account);
        newBalances[token.address] = ethers.utils.formatUnits(balance, 18);
      } catch (error) {
        console.error(`Error fetching balance for token ${token.ticker}:`, error);
        // Find matching dummy token and use a random balance
        const dummyToken = DUMMY_TOKENS.find(dt => dt.address === token.address);
        if (dummyToken) {
          // Generate a random balance between 0 and 1000 for dummy data
          const dummyBalance = (Math.random() * 1000).toFixed(2);
          newBalances[token.address] = dummyBalance;
          console.log(`Using dummy balance for ${token.ticker}: ${dummyBalance}`);
        } else {
          newBalances[token.address] = "0";
        }
      }
    }
    
    setTokenBalances(newBalances);
  };
const tokenAddressChange = (v) => {
  setSelectedTokenAddress(v);
  // Find the token object with matching address and set its ticker
  const selectedToken = tokenAddresses.find(token => token.address === v);
  if (selectedToken) {
    setSelectedTokenTicker(selectedToken.ticker);
  }
};
  // Add useEffect to fetch balances when account or tokens change
  useEffect(() => {
    fetchTokenBalances();
  }, [account, tokenAddresses, library]);

  // Update tab state
  const [activeTab, setActiveTab] = useState('marketplace');

  // Add these new state variables at the beginning of WalletConnectComponent
  const [brandDetails, setBrandDetails] = useState({
    country: "",
    city: "",
    description: "",
    website: "",
    isAuthorized: false,
    documents: null,
    currentScale: "",
    outlets: "",
    isFranchised: false,
    yearEstablished: "",
    industry: "",
    revenueRange: "",
    investmentRequired: "",
  });

  // Add these new state variables in WalletConnectComponent
  const [stakedAmount, setStakedAmount] = useState('0');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [voteValue, setVoteValue] = useState('');
  const [openStakeDialog, setOpenStakeDialog] = useState(false);
  const [openUnstakeDialog, setOpenUnstakeDialog] = useState(false);
  const [openProposalDialog, setOpenProposalDialog] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [selectedDAO, setSelectedDAO] = useState('');
  const [daoDetails, setDaoDetails] = useState(null);

  // Add this helper function to get DAO details
  const getDAODetails = (tokenAddress) => {
    // Find the token info from tokenAddresses
    const tokenInfo = tokenAddresses.find(token => token.address === tokenAddress);
    return {
      name: tokenInfo?.name || 'Unknown DAO',
      ticker: tokenInfo?.ticker || '',
      address: tokenAddress,
      // You can add more DAO specific details here
    };
  };

  // Add these handler functions
  const handleStake = async () => {
    if (!library || !account) {
      setStatus("Please connect to a wallet first.");
      return;
    }

    try {
      const signer = library.getSigner();
      // Add your staking contract interaction here
      // Example:
      // const stakingContract = new ethers.Contract(stakingAddress, stakingABI, signer);
      // await stakingContract.stake(ethers.utils.parseEther(stakeAmount));
      
      setOpenStakeDialog(false);
      setStakeAmount('');
      // Update staked amount
      // fetchStakedAmount();
    } catch (error) {
      console.error("Staking failed:", error);
    }
  };

  const handleUnstake = async () => {
    if (!library || !account) {
      setStatus("Please connect to a wallet first.");
      return;
    }

    try {
      const signer = library.getSigner();
      // Add your unstaking contract interaction here
      
      setOpenUnstakeDialog(false);
      setUnstakeAmount('');
      // Update staked amount
      // fetchStakedAmount();
    } catch (error) {
      console.error("Unstaking failed:", error);
    }
  };

  const handleCreateProposal = async () => {
    if (!library || !account) {
      setStatus("Please connect to a wallet first.");
      return;
    }

    try {
      const signer = library.getSigner();
      // Add your proposal creation contract interaction here
      
      // For demo purposes, adding to local state
      setProposals([
        ...proposals,
        {
          title: proposalTitle,
          description: proposalDescription,
          votesFor: 0,
          votesAgainst: 0,
        }
      ]);
      
      setOpenProposalDialog(false);
      setProposalTitle('');
      setProposalDescription('');
    } catch (error) {
      console.error("Proposal creation failed:", error);
    }
  };

  const handleVote = async () => {
    if (!library || !account || !selectedProposal || !voteValue) {
      setStatus("Please connect to a wallet and select a vote option.");
      return;
    }

    try {
      const signer = library.getSigner();
      // Add your voting contract interaction here
      
      // For demo purposes, updating local state
      setProposals(proposals.map(p => 
        p.title === selectedProposal.title
          ? {
              ...p,
              votesFor: voteValue === 'for' ? p.votesFor + 1 : p.votesFor,
              votesAgainst: voteValue === 'against' ? p.votesAgainst + 1 : p.votesAgainst,
            }
          : p
      ));
      
      setSelectedProposal(null);
      setVoteValue('');
    } catch (error) {
      console.error("Voting failed:", error);
    }
  };

  // Add this helper function to generate curve data
  const generateCurveData = async (tokenAddress) => {
    try {
      // Mock current supply (random between 10% and 30% of max supply)
      const mockCurrentSupply = Math.floor(MAX_SUPPLY * (0.1 + Math.random() * 0.2));
      setCurrentSupply(mockCurrentSupply);
//bonding curve missing getsupply for now.
      // Calculate current price based on supply
      const mockCurrentPrice = calculatePrice(mockCurrentSupply);
      setCurrentPrice(mockCurrentPrice);

      // Generate curve data points
      const dataPoints = [];
      const steps = 50; // Number of points on the curve
      
      for (let i = 0; i <= steps; i++) {
        const supply = (MAX_SUPPLY * i) / steps;
        const price = calculatePrice(supply);
        dataPoints.push({ 
          supply: Math.round(supply), 
          price: price
        });
      }

      console.log("Generated curve data:", {
        currentSupply: mockCurrentSupply,
        currentPrice: mockCurrentPrice,
        samplePoints: dataPoints.length
      });

      setSupplyData(dataPoints);

    } catch (error) {
      console.error("Error generating curve data:", error);
    }
  };

  // Add useEffect to update curve when token changes
  useEffect(() => {
    if (selectedTokenAddress && library) {
      generateCurveData(selectedTokenAddress);
    }
  }, [selectedTokenAddress, library]);

  // Add this component
  const BondingCurveChart = ({ data, currentSupply, currentPrice }) => {
    // Format large numbers for display
    const formatSupply = (value) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toFixed(0);
    };

    const formatPrice = (value) => {
      return `$${value.toFixed(2)}`;
    };

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Token Bonding Curve
        </Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="supply"
                tickFormatter={formatSupply}
                label={{ 
                  value: 'Token Supply', 
                  position: 'bottom',
                  offset: -5
                }}
              />
              <YAxis
                tickFormatter={formatPrice}
                label={{ 
                  value: 'Price (USDC)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -5
                }}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === 'price' ? formatPrice(value) : formatSupply(value),
                  name === 'price' ? 'Price' : 'Supply'
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                dot={false}
                strokeWidth={2}
              />
              {currentSupply && currentPrice && (
                <ReferenceDot
                  x={currentSupply}
                  y={currentPrice}
                  r={5}
                  fill="red"
                  stroke="none"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Add stats below the chart */}
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Supply
                </Typography>
                <Typography variant="h6">
                  {formatSupply(currentSupply)} / {formatSupply(MAX_SUPPLY)}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(currentSupply / MAX_SUPPLY) * 100}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Price
                </Typography>
                <Typography variant="h6">
                  {formatPrice(currentPrice)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Next token: {formatPrice(calculatePrice(currentSupply + 1))}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    );
  };

  // Add a price impact calculator
  const calculatePriceImpact = (amount, action) => {
    if (!amount) return 0;
    
    const currentPrice = calculatePrice(currentSupply);
    let targetSupply;
    
    if (action === 'buy') {
      targetSupply = currentSupply + Number(amount);
    } else {
      targetSupply = Math.max(0, currentSupply - Number(amount));
    }
    
    const targetPrice = calculatePrice(targetSupply);
    const impact = ((targetPrice - currentPrice) / currentPrice) * 100;
    
    return action === 'buy' ? impact : -impact;
  };

  // Add this component
  const PriceRangeSlider = ({ min, max, value, onChange }) => {
    return (
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Amount Range
        </Typography>
        <Slider
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={(max - min) / 100}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value.toFixed(2)} USDC`}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {min.toFixed(2)} USDC
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {max.toFixed(2)} USDC
          </Typography>
        </Box>
      </Box>
    );
  };

  // Add these handler functions
  const handleBuy = async (amount) => {
    if (!library || !account) {
      setStatus("Please connect to a wallet first.");
      return;
    }

    try {
      const signer = library.getSigner();
      const bondingContract = new ethers.Contract(
        process.env.REACT_APP_BONDING_CURVE_ADDRESS,
        ['function buy(address _token) payable'],
        signer
      );
      
      const tx = await bondingContract.buyTokens(ethers.utils.parseUnits(amount.toString(), 6),selectedTokenAddress)
      
      await tx.wait();
      
      // Update balances
      fetchTokenBalances();
      fetchStablecoinBalance();
    } catch (error) {
      console.error("Buy failed:", error);
      throw error;
    }
  };

  const handleSell = async (amount) => {
    if (!library || !account) {
      setStatus("Please connect to a wallet first.");
      return;
    }

    try {
      const signer = library.getSigner();
      const bondingContract = new ethers.Contract(
        process.env.REACT_APP_BONDING_CURVE_ADDRESS,
        ['function sell(uint256 _tokenAmount, address _token)'],
        signer
      );
      
      const tx = await bondingContract.sellTokens(
        ethers.utils.parseUnits(amount.toString(), 18),
        selectedTokenAddress
      );
      await tx.wait();
      
      // Update balances
      fetchTokenBalances();
      fetchStablecoinBalance();
    } catch (error) {
      console.error("Sell failed:", error);
      throw error;
    }
  };

  const handleQuote = async (action, amount) => {
    if (!library || !amount || !selectedTokenAddress) return '0';
    
    try {
      const signer = library.getSigner();
      const bondingContract = new ethers.Contract(
        process.env.REACT_APP_BONDING_CURVE_ADDRESS,
        [
          'function calculateTokens(uint256 _stableAmount, address _token) view returns (uint256)',
          'function calculateStable(uint256 _tokenAmount, address _token) view returns (uint256)'
        ],
        signer
      );

      let quote;
      if (action === 'buy') {
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 6); // USDC has 6 decimals
        quote = await bondingContract.calculateTokens(amountInWei, selectedTokenAddress);
        return ethers.utils.formatUnits(quote, 18); // Token has 18 decimals
      } else {
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 18); // Token has 18 decimals
        quote = await bondingContract.calculateStable(amountInWei, selectedTokenAddress);
        return ethers.utils.formatUnits(quote, 6); // USDC has 6 decimals
      }
    } catch (error) {
      console.error("Quote error:", error);
      return '0';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Add this near the top of your return statement */}
      <Snackbar 
        open={walletError !== null} 
        autoHideDuration={6000} 
        onClose={() => setWalletError(null)}
      >
        <Alert 
          severity="error" 
          onClose={() => setWalletError(null)}
          sx={{ width: '100%' }}
        >
          <AlertTitle>{walletError?.title}</AlertTitle>
          {walletError?.message}
          {walletError?.action === 'install' && (
            <Button
              color="inherit"
              size="small"
              href="https://metamask.io/download/"
              target="_blank"
              sx={{ mt: 1 }}
            >
              Install MetaMask
            </Button>
          )}
        </Alert>
      </Snackbar>

      <AppBar position="static" sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            p: { xs: 1.5, sm: 2 }
          }}>
            <Box sx={{
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <img 
                src="/ff.png" 
                alt="Logo"
                style={{
                  maxHeight: '40px',
                  width: 'auto'
                }}
              />
            </Box>
            
            {!isConnected ? (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={connectWallet}
                startIcon={<AccountBalanceWallet />}
                fullWidth={isMobile}
                sx={{
                  py: { xs: 1, sm: 'inherit' }
                }}
              >
                Connect MetaMask
              </Button>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 1, sm: 2 },
                width: '100%'
              }}>
                <Box sx={{ 
                  textAlign: { xs: 'center', sm: 'right' },
                  width: '100%'
                }}>
                  <Typography variant="body2" noWrap>
                    {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                  </Typography>
                  <Typography variant="body2" noWrap>
                    {balance !== null ? `${Number(balance).toFixed(4)} ETH` : "Loading..."}
                  </Typography>
                  <Typography variant="body2" noWrap>
                    {stablecoinBalance !== null ? `${Number(stablecoinBalance).toFixed(2)} USDC` : "Loading..."}
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={disconnectWallet}
                  size="small"
                  fullWidth={isMobile}
                  sx={{
                    mt: { xs: 1, sm: 0 }
                  }}
                >
                  Disconnect
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </AppBar>

      {isConnected && (
        <Container>
          <Paper sx={{ mb: 3 }}>
            
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              centered={!isMobile}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
            >
              <Tab 
                label="Marketplace" 
                value="marketplace" 
                icon={<ShoppingCart />} 
                iconPosition="start"
              />
              <Tab 
                label="Portfolio" 
                value="portfolio" 
                icon={<Dashboard />} 
                iconPosition="start"
              />
             
              <Tab 
                label="Governance" 
                value="governance" 
                icon={<Gavel />} 
                iconPosition="start"
              />
               <Tab 
                label="Create" 
                value="create" 
                icon={<Add />} 
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          <Box sx={{ py: 3 }}>
            {activeTab === 'marketplace' && (
              <Marketplace 
                tokenAddresses={tokenAddresses}
                setSelectedTokenAddress={setSelectedTokenAddress}
                setSelectedTokenTicker={setSelectedTokenTicker}
                setActiveTab={setActiveTab}
              />
            )}

            {(activeTab === 'buy' || activeTab === 'sell') && (
              <BuySellTab
                selectedTokenAddress={selectedTokenAddress}
                selectedTokenTicker={selectedTokenTicker}
                library={library}
                account={account}
                stablecoinBalance={stablecoinBalance}
                tokenBalances={tokenBalances}
                onBack={() => setActiveTab('marketplace')}
                currentPrice={currentPrice}
                currentSupply={currentSupply}
                supplyData={supplyData}
                handleBuy={buyToken}
                handleSell={sellToken}
                handleQuote={handleQuote}
               
              />
            )}

            {activeTab === 'portfolio' && (
              <Portfolio
                tokenAddresses={tokenAddresses}
                tokenBalances={tokenBalances}
                stablecoinBalance={stablecoinBalance}
                balance={balance}
                fetchEthBalance={fetchEthBalance}
                fetchStablecoinBalance={fetchStablecoinBalance}
                fetchTokenBalances={fetchTokenBalances}
                setSelectedTokenAddress={setSelectedTokenAddress}
                setSelectedTokenTicker={setSelectedTokenTicker}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'create' && (
              <CreateToken
                tokenName={tokenName}
                setTokenName={setTokenName}
                tokenTicker={tokenTicker}
                setTokenTicker={setTokenTicker}
                brandDetails={brandDetails}
                setBrandDetails={setBrandDetails}
                deployToken={deployToken}
                tokenAddresses={tokenAddresses}
              />
            )}

            {activeTab === 'governance' && (
              <Governance
                tokenAddresses={tokenAddresses}
                selectedDAO={selectedDAO}
                setSelectedDAO={setSelectedDAO}
                daoDetails={daoDetails}
                setDaoDetails={setDaoDetails}
                proposals={proposals}
                selectedTokenTicker={selectedTokenTicker}
                stakedAmount={stakedAmount}
                openStakeDialog={openStakeDialog}
                setOpenStakeDialog={setOpenStakeDialog}
                openUnstakeDialog={openUnstakeDialog}
                setOpenUnstakeDialog={setOpenUnstakeDialog}
                openProposalDialog={openProposalDialog}
                setOpenProposalDialog={setOpenProposalDialog}
                selectedProposal={selectedProposal}
                setSelectedProposal={setSelectedProposal}
                stakeAmount={stakeAmount}
                setStakeAmount={setStakeAmount}
                unstakeAmount={unstakeAmount}
                setUnstakeAmount={setUnstakeAmount}
                proposalTitle={proposalTitle}
                setProposalTitle={setProposalTitle}
                proposalDescription={proposalDescription}
                setProposalDescription={setProposalDescription}
                voteValue={voteValue}
                setVoteValue={setVoteValue}
                handleStake={handleStake}
                handleUnstake={handleUnstake}
                handleCreateProposal={handleCreateProposal}
                handleVote={handleVote}
                getDAODetails={getDAODetails}
              />
            )}
          </Box>
        </Container>
      )}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Web3ReactProvider getLibrary={getLibrary}>
        <WalletConnectComponent />
      </Web3ReactProvider>
    </ThemeProvider>
  );
}

export default App;
