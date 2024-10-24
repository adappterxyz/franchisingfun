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
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

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


function WalletConnectComponent() {
  const { activate, active, account, library, deactivate, setError } = useWeb3React();
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState("");
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
  // Load token addresses from local storage on component mount
  useEffect(() => {
    const storedAddresses = JSON.parse(localStorage.getItem("tokenAddresses")) || [];
    setTokenAddresses(storedAddresses);
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

  // Connect MetaMask wallet
  const connectWallet = async () => {
    try {
      await activate(injected);
      setIsConnected(true);
    } catch (ex) {
      console.log("Connection Error: ", ex);
    }
  };

  // Disconnect MetaMask wallet
  const disconnectWallet = () => {
    try {
      deactivate();
      setBalance(null);
      setIsConnected(false);
    } catch (ex) {
      console.log("Disconnection Error: ", ex);
    }
  };

  // Fetch balance once connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (active && account && library) {
        try {
          const balance = await library.getBalance(account);
          setBalance(ethers.utils.formatEther(balance));
        } catch (err) {
          console.error("Balance Fetch Error: ", err);
        }
      }
    };
    fetchBalance();
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
        ticker: tokenTicker
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

  const buyToken = async () => {
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
    
    console.log("111111",amountInWei);
    const Tx = await BondingCurve.buyTokens(amountInWei, selectedTokenAddress);
    
    await Tx.wait(); // Wait for the approval transaction to complete
      console.log(`Swap successful for ${stablecoinAmount} USDC`);
   
    } catch (error) {
      
      console.error(error);
    }
  };
  const sellToken = async () => {
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
        newBalances[token.address] = "Error";
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 3, borderRadius: 1 }}>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="h5" component="h1">
              Franchising Platform
            </Typography>
            
            {!isConnected ? (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={connectWallet}
                startIcon={<AccountBalanceWallet />}
              >
                Connect MetaMask
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </Typography>
                  <Typography variant="body2">
                    {balance !== null ? `${Number(balance).toFixed(4)} ETH` : "Loading..."}
                  </Typography>
                  <Typography variant="body2">
                    {stablecoinBalance !== null ? `${Number(stablecoinBalance).toFixed(2)} USDC` : "Loading..."}
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={disconnectWallet}
                  size="small"
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
              <Box>
                <Typography variant="h4" sx={{ mb: 3 }}>Available Tokens</Typography>
                <Grid container spacing={3}>
                  {tokenAddresses.map((token) => (
                    <Grid item xs={12} sm={6} md={4} key={token.address}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{token.name}</Typography>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              display: 'inline-block',
                              bgcolor: 'action.hover',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1
                            }}
                          >
                            {token.ticker}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            variant="contained" 
                            onClick={() => {
                              setSelectedTokenAddress(token.address);
                              setSelectedTokenTicker(token.ticker);
                              setActiveTab('buy');
                            }}
                          >
                            Buy
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => {
                              setSelectedTokenAddress(token.address);
                              setSelectedTokenTicker(token.ticker);
                              setActiveTab('sell');
                            }}
                          >
                            Sell
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {(activeTab === 'buy' || activeTab === 'sell') && (
              <Container maxWidth="sm">
                <Box sx={{ mb: 3 }}>
                  <Button 
                    startIcon={<ArrowBack />}
                    onClick={() => setActiveTab('marketplace')}
                    sx={{ mb: 2 }}
                  >
                    Back to Marketplace
                  </Button>
                  
                  <Typography variant="h4" gutterBottom>
                    {tradeMode === 'buy' ? 'Buy' : 'Sell'} {selectedTokenTicker}
                  </Typography>

                  <ToggleButtonGroup
                    value={tradeMode}
                    exclusive
                    onChange={(e, newMode) => setTradeMode(newMode)}
                    sx={{ mb: 3 }}
                  >
                    <ToggleButton value="buy" aria-label="buy">
                      Buy
                    </ToggleButton>
                    <ToggleButton value="sell" aria-label="sell">
                      Sell
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Paper sx={{ p: 3, mt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        label={tradeMode === 'buy' ? 'USDC Amount' : `${selectedTokenTicker} Amount`}
                        type="number"
                        value={tradeMode === 'buy' ? stablecoinAmount : erc20tokenamount}
                        onChange={(e) => getQuote(tradeMode, e.target.value)}
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <Typography variant="body2" color="text.secondary">
                              {tradeMode === 'buy' ? 'USDC' : selectedTokenTicker}
                            </Typography>
                          ),
                        }}
                      />

                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'background.default',
                          textAlign: 'center'
                        }}
                      >
                        <Typography color="text.secondary" gutterBottom>
                          You will receive approximately:
                        </Typography>
                        <Typography variant="h4" color="primary" gutterBottom>
                          {quotedVal} {tradeMode === 'buy' ? selectedTokenTicker : 'USDC'}
                        </Typography>
                      </Paper>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2">
                          Available Balance:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {tradeMode === 'buy' 
                            ? `${stablecoinBalance || '0.00'} USDC`
                            : `${tokenBalances[selectedTokenAddress] || '0.00'} ${selectedTokenTicker}`
                          }
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={tradeMode === 'buy' ? buyToken : sellToken}
                        disabled={
                          tradeMode === 'buy' 
                            ? !stablecoinAmount || stablecoinAmount <= 0
                            : !erc20tokenamount || erc20tokenamount <= 0
                        }
                      >
                        {tradeMode === 'buy' ? 'Buy' : 'Sell'} {selectedTokenTicker}
                      </Button>
                    </Box>
                  </Paper>

                  {/* Transaction Status */}
                  {status && (
                    <Paper 
                      sx={{ 
                        mt: 2, 
                        p: 2, 
                        bgcolor: status.includes('Error') ? 'error.dark' : 'success.dark'
                      }}
                    >
                      <Typography color="white">
                        {status}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Container>
            )}

            {activeTab === 'portfolio' && (
              <Container>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Your Portfolio</Typography>
                    <Button 
                      startIcon={<Refresh />}
                      onClick={fetchTokenBalances}
                      variant="outlined"
                    >
                      Refresh Balances
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    {/* USDC Balance Card */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>USDC Balance</Typography>
                          <Typography variant="h4" color="primary">
                            {stablecoinBalance ? Number(stablecoinBalance).toFixed(2) : '0.00'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* ETH Balance Card */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>ETH Balance</Typography>
                          <Typography variant="h4" color="primary">
                            {balance ? Number(balance).toFixed(4) : '0.0000'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Token Holdings */}
                    {tokenAddresses.map((token) => (
                      tokenBalances[token.address] && Number(tokenBalances[token.address]) > 0 ? (
                        <Grid item xs={12} sm={6} md={4} key={token.address}>
                          <Card sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>{token.name}</Typography>
                              <Typography variant="h4" color="primary">
                                {Number(tokenBalances[token.address]).toFixed(4)}
                              </Typography>
                              <Typography variant="subtitle2" color="text.secondary">
                                {token.ticker}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button 
                                size="small" 
                                variant="contained"
                                onClick={() => {
                                  setSelectedTokenAddress(token.address);
                                  setSelectedTokenTicker(token.ticker);
                                  setActiveTab('buy');
                                }}
                              >
                                Buy More
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => {
                                  setSelectedTokenAddress(token.address);
                                  setSelectedTokenTicker(token.ticker);
                                  setActiveTab('sell');
                                }}
                              >
                                Sell
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ) : null
                    ))}
                  </Grid>

                  {tokenAddresses.every(token => !tokenBalances[token.address] || Number(tokenBalances[token.address]) === 0) && (
                    <Paper sx={{ p: 3, mt: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary" gutterBottom>
                        No tokens in your portfolio yet
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => setActiveTab('marketplace')}
                        startIcon={<ShoppingCart />}
                        sx={{ mt: 2 }}
                      >
                        Go to Marketplace
                      </Button>
                    </Paper>
                  )}
                </Box>
              </Container>
            )}

            {activeTab === 'create' && (
  <Container maxWidth="md">
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create a new Franchise Campaign
      </Typography>
      
      <Grid container spacing={4}>
        {/* Token Creation Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Token Details
            </Typography>
            
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Token Name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                fullWidth
                required
                helperText="Enter the full name of your token (e.g., 'My Custom Token')"
                variant="outlined"
                error={tokenName.length > 0 && tokenName.length < 3}
              />
              
              <TextField
                label="Token Symbol"
                value={tokenTicker}
                onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
                fullWidth
                required
                helperText="Enter a symbol for your token (3-5 characters, e.g., 'MCT')"
                variant="outlined"
                error={tokenTicker.length > 0 && (tokenTicker.length < 3 || tokenTicker.length > 5)}
                inputProps={{ 
                  style: { textTransform: 'uppercase' },
                  maxLength: 5 
                }}
              />

              {/* New Brand Details Section */}
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Brand Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    fullWidth
                    value={brandDetails.country}
                    onChange={(e) => setBrandDetails({...brandDetails, country: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    fullWidth
                    value={brandDetails.city}
                    onChange={(e) => setBrandDetails({...brandDetails, city: e.target.value})}
                    required
                  />
                </Grid>
              </Grid>

              <TextField
                label="Website"
                fullWidth
                value={brandDetails.website}
                onChange={(e) => setBrandDetails({...brandDetails, website: e.target.value})}
                type="url"
                helperText="Enter your brand's official website"
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={brandDetails.description}
                onChange={(e) => setBrandDetails({...brandDetails, description: e.target.value})}
                helperText="Describe your brand and franchise opportunity"
              />

              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={brandDetails.industry}
                  onChange={(e) => setBrandDetails({...brandDetails, industry: e.target.value})}
                  label="Industry"
                >
                  <MenuItem value="food">Food & Beverage</MenuItem>
                  <MenuItem value="retail">Retail</MenuItem>
                  <MenuItem value="services">Services</MenuItem>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Year Established"
                    fullWidth
                    type="number"
                    value={brandDetails.yearEstablished}
                    onChange={(e) => setBrandDetails({...brandDetails, yearEstablished: e.target.value})}
                    InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Number of Outlets"
                    fullWidth
                    type="number"
                    value={brandDetails.outlets}
                    onChange={(e) => setBrandDetails({...brandDetails, outlets: e.target.value})}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
              </Grid>

              <FormControl component="fieldset">
                <FormLabel component="legend">Authorization Status</FormLabel>
                <FormControlLabel
                  control={
                    <Switch
                      checked={brandDetails.isAuthorized}
                      onChange={(e) => setBrandDetails({...brandDetails, isAuthorized: e.target.checked})}
                    />
                  }
                  label="I am authorized to represent this brand"
                />
              </FormControl>

              {brandDetails.isAuthorized && (
                <>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                >
                  Upload Authorization Documents
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setBrandDetails({...brandDetails, documents: e.target.files[0]})}
                  />
                </Button>
                 <TextField
                 label="Investment Required (USD)"
                 fullWidth
                 type="number"
                 value={brandDetails.investmentRequired}
                 onChange={(e) => setBrandDetails({...brandDetails, investmentRequired: e.target.value})}
                 InputProps={{
                   startAdornment: <InputAdornment position="start">$</InputAdornment>,
                 }}
               />
               </>
              )}

             

              {/* Existing deploy button */}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => deployToken(tokenName, tokenTicker)}
                  disabled={
                    !tokenName || 
                    !tokenTicker || 
                    tokenName.length < 3 || 
                    tokenTicker.length < 3 || 
                    tokenTicker.length > 5 ||
                    !brandDetails.country ||
                    !brandDetails.description
                  }
                  startIcon={<Add />}
                >
                  Deploy Token
                </Button>
              </Box>

              {/* Existing status alert */}
            </Box>
          </Paper>
        </Grid>

        {/* Information Panel */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Deployment Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <InfoOutlined color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Network"
                  secondary="Base Sepolia Testnet"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccountBalanceWallet color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Treasury Address"
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        wordBreak: 'break-all',
                        color: 'text.secondary' 
                      }}
                    >
                      {process.env.REACT_APP_TREASURY_ADDRESS}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ShowChart color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Bonding Curve"
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        wordBreak: 'break-all',
                        color: 'text.secondary' 
                      }}
                    >
                      {process.env.REACT_APP_BONDING_CURVE_ADDRESS}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Paper>

          {/* Recently Created Tokens */}
          {tokenAddresses.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Recent Tokens
              </Typography>
              <List dense>
                {tokenAddresses.slice(-3).reverse().map((token) => (
                  <ListItem
                    key={token.address}
                    secondaryAction={
                      <Chip 
                        label={token.ticker} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    }
                  >
                    <ListItemText
                      primary={token.name}
                      secondary={
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            wordBreak: 'break-all',
                            color: 'text.secondary' 
                          }}
                        >
                          {token.address}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Deployment Guide */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Token Deployment Guide
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                1. Enter Token Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Provide a name and symbol for your token. The symbol should be 3-5 characters.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                2. Deploy Token
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click deploy and confirm the transaction in your wallet. Gas fees will apply.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                3. Start Trading
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Once deployed, your token will appear in the marketplace for trading.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  </Container>
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
