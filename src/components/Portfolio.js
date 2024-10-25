import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Refresh,
  ShoppingCart
} from '@mui/icons-material';

function Portfolio({
  tokenAddresses,
  tokenBalances,
  stablecoinBalance,
  balance, // ETH balance
  fetchEthBalance,
  fetchStablecoinBalance,
  fetchTokenBalances,
  setSelectedTokenAddress,
  setSelectedTokenTicker,
  setActiveTab
}) {
  const handleRefresh = () => {
    fetchEthBalance();
    fetchStablecoinBalance();
    fetchTokenBalances();
  };

  return (
    <Box>
      <Container>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Your Portfolio</Typography>
            <Button 
              startIcon={<Refresh />}
              onClick={handleRefresh}
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
    </Box>
  );
}

export default Portfolio;
