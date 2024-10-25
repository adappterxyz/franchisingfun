import React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Add,
  Upload,
  InfoOutlined,
  AccountBalanceWallet,
  ShowChart,
} from '@mui/icons-material';
import TokenBrandDetails from './TokenBrandDetails';

const CreateToken = ({
  tokenName,
  setTokenName,
  tokenTicker,
  setTokenTicker,
  brandDetails,
  setBrandDetails,
  deployToken,
  tokenAddresses
}) => {
  return (
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

                <TokenBrandDetails 
                  brandDetails={brandDetails}
                  setBrandDetails={setBrandDetails}
                />

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
  );
};

export default CreateToken;
