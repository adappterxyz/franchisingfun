import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import { Info } from '@mui/icons-material';
import TokenProfile from './TokenProfile';

function Marketplace({ 
  tokenAddresses, 
  setSelectedTokenAddress, 
  setSelectedTokenTicker, 
  setActiveTab 
}) {
  const [selectedToken, setSelectedToken] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);

  const handleProfileOpen = (token) => {
    setSelectedToken(token);
    setOpenProfile(true);
  };

  const handleProfileClose = () => {
    setOpenProfile(false);
    setSelectedToken(null);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Available Tokens</Typography>
      <Grid container spacing={3}>
        {tokenAddresses.map((token) => (
          <Grid item xs={12} sm={6} md={4} key={token.address}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6">{token.name}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleProfileOpen(token)}
                    sx={{ ml: 1 }}
                  >
                    <Info />
                  </IconButton>
                </Box>
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

      {/* Token Profile Dialog */}
      <Dialog
        open={openProfile}
        onClose={handleProfileClose}
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

export default Marketplace;
