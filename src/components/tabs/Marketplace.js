import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button 
} from '@mui/material';

function Marketplace({ 
  tokenAddresses, 
  setSelectedTokenAddress, 
  setSelectedTokenTicker, 
  setActiveTab 
}) {
  return (
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
  );
}

export default Marketplace;