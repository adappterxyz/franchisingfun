import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  Refresh,
  ShoppingCart,
  Info,
} from '@mui/icons-material';
import TokenProfile from './TokenProfile';
import { ethers } from 'ethers';

function Portfolio({ 
  tokenAddresses, 
  setSelectedTokenAddress, 
  setSelectedTokenTicker, 
  setActiveTab, 
  balance,
  stablecoinBalance
}) {
  // State management
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokenBalances, setTokenBalances] = useState({});

  // Handle profile dialog
  const handleProfileOpen = (token) => {
    setSelectedToken(token);
    setOpenProfile(true);
  };

  // Fetch balances
  const fetchTokenBalances = async () => {
    try {
      // Implement your balance fetching logic here
      // This should update tokenBalances, stablecoinBalance, and balance
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Fetch balances on component mount
  useEffect(() => {
    fetchTokenBalances();
  }, []);

  return (
    <Box>
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
                  ${Number(stablecoinBalance).toFixed(2)}
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
              tokenBalances[token.address] ? (
                <Grid item xs={12} sm={6} md={4} key={token.address}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>{token.name}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleProfileOpen(token)}
                          sx={{ ml: 1 }}
                        >
                          <Info />
                        </IconButton>
                      </Box>
                      <Typography variant="h4" color="primary">
                        {tokenBalances[token.address] 
                          ? Number(ethers.utils.formatUnits(tokenBalances[token.address], 18)).toFixed(4)
                          : '0.0000'
                        }
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

      {/* Token Profile Dialog */}
      <Dialog
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogContent>
          <TokenProfile token={selectedToken} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Portfolio;
