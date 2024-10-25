import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  TextField,
  Button,
  InputAdornment,
  Grid,
  Alert,
  AlertTitle,
  Container,
  Divider,
} from '@mui/material';
import { 
  ToggleButton, 
  ToggleButtonGroup 
} from '@mui/material';
import { 
  ArrowBack,
  ShoppingCart,
  Sell,
} from '@mui/icons-material';
import { ethers } from 'ethers';
import BondingCurveChart from './BondingCurveChart';
import TokenProfile from './TokenProfile';

const BuySellTab = ({ 
  selectedTokenAddress,
  selectedTokenTicker = 'TOKEN',
  library,
  account,
  stablecoinBalance = '0',
  tokenBalances = {},
  onBack,
  currentPrice = 0,
  currentSupply = 0,
  supplyData = [],
  handleBuy,  // Changed from onBuy
  handleSell, // Changed from onSell
  handleQuote // Changed from onQuote
}) => {
  const [tradeMode, setTradeMode] = useState('buy');
  const [stablecoinAmount, setStablecoinAmount] = useState('');
  const [erc20tokenamount, setErc20tokenamount] = useState('');
  const [quotedVal, setQuotedVal] = useState('0');
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  
  // Handle quote updates
  const updateQuote = async (action, value) => {
    if (!value || isNaN(value) || Number(value) <= 0) {
      setQuotedVal('0');
      return;
    }

    try {
      const quote = await handleQuote(action, value);
      setQuotedVal(quote);
    } catch (error) {
      console.error("Quote error:", error);
      setQuotedVal('0');
      setStatus('Error getting quote');
    }
  };

  // Handle trade execution
  const executeTrade = async () => {
    try {
      if (tradeMode === 'buy') {
        await handleBuy(stablecoinAmount);
      } else {
        await handleSell(erc20tokenamount);
      }
    } catch (error) {
      console.error("Trade error:", error);
      setStatus('Error executing trade');
    }
  };

  // Reset values when trade mode changes
  useEffect(() => {
    setStablecoinAmount('');
    setErc20tokenamount('');
    setQuotedVal('0');
    setStatus('');
  }, [tradeMode]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ mb: 2 }}
        >
          Back to Marketplace
        </Button>

        <Grid container spacing={3}>
          {/* Left side - Trading Interface */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {tradeMode === 'buy' ? 'Buy' : 'Sell'} {selectedTokenTicker}
            </Typography>

            <ToggleButtonGroup
              value={tradeMode}
              exclusive
              onChange={(e, newMode) => newMode && setTradeMode(newMode)}
              sx={{ mb: 3 }}
            >
              <ToggleButton value="buy" aria-label="buy">
                <ShoppingCart sx={{ mr: 1 }} />
                Buy
              </ToggleButton>
              <ToggleButton value="sell" aria-label="sell">
                <Sell sx={{ mr: 1 }} />
                Sell
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Bonding Curve Chart */}
            <BondingCurveChart
              data={supplyData}
              currentSupply={currentSupply}
              currentPrice={currentPrice}
              tradeAmount={tradeMode === 'buy' ? Number(stablecoinAmount) : Number(erc20tokenamount)}
              tradeMode={tradeMode}
            />

            <Paper sx={{ p: 3, mt: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Input Field */}
                <TextField
                  fullWidth
                  label={`${tradeMode === 'buy' ? 'USDC' : selectedTokenTicker} Amount`}
                  value={tradeMode === 'buy' ? stablecoinAmount : erc20tokenamount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (tradeMode === 'buy') {
                      setStablecoinAmount(value);
                      updateQuote('buy', value);
                    } else {
                      setErc20tokenamount(value);
                      updateQuote('sell', value);
                    }
                  }}
                  type="number"
                  InputProps={{
                    startAdornment: tradeMode === 'buy' ? (
                      <InputAdornment position="start">$</InputAdornment>
                    ) : null,
                    inputProps: { 
                      min: 0,
                      step: "0.000001"
                    }
                  }}
                />

                {/* Quote Display */}
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
                    {Number(quotedVal).toFixed(6)} {tradeMode === 'buy' ? selectedTokenTicker : 'USDC'}
                  </Typography>
                </Paper>

                {/* Balance Display */}
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
                      ? `${Number(stablecoinBalance).toFixed(6)} USDC`
                      : `${Number(tokenBalances[selectedTokenAddress] || 0).toFixed(6)} ${selectedTokenTicker}`
                    }
                  </Typography>
                </Box>

                {/* Action Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={executeTrade}
                  disabled={
                    tradeMode === 'buy' 
                      ? !stablecoinAmount || Number(stablecoinAmount) <= 0
                      : !erc20tokenamount || Number(erc20tokenamount) <= 0
                  }
                >
                  {tradeMode === 'buy' ? 'Buy' : 'Sell'} {selectedTokenTicker}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right side - Comments */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Comments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Comments List */}
              <Box sx={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                mb: 2,
                pr: 1
              }}>
                {/* Placeholder for comments list */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    John Doe • 2h ago
                  </Typography>
                  <Typography variant="body2">
                    Great price point for entry!
                  </Typography>
                </Paper>
                {/* Add more comment placeholders as needed */}
              </Box>

              {/* Comment Input */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Your comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this trade..."
                sx={{ mb: 2 }}
              />
              
              <Button 
                variant="outlined"
                fullWidth
                disabled={!comment.trim()}
                onClick={() => {
                  // TODO: Implement comment submission
                  console.log('Comment submitted:', comment);
                  setComment('');
                }}
              >
                Post Comment
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Status display */}
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
  );
};

export default BuySellTab;
