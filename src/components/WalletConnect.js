import React from "react";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../connectors"; // Assuming you have a connectors.js file for injected connector (e.g., MetaMask)
import { 
  Button, 
  Typography, 
  Box, 
  Alert, 
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
} from '@mui/material';
import { 
  AccountBalanceWallet,
  Circle,
  Download,
} from '@mui/icons-material';

export const WalletConnect = ({ 
  isConnected, 
  account, 
  balance, 
  chainId,
  onConnect, 
  onDisconnect 
}) => {
  const [showWalletGuide, setShowWalletGuide] = React.useState(false);

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const WalletGuideDialog = () => (
    <Dialog 
      open={showWalletGuide} 
      onClose={() => setShowWalletGuide(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet />
          Install a Web3 Wallet
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          To interact with the Franchise DAO platform, you'll need a Web3 wallet. We recommend using MetaMask.
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <Circle sx={{ width: 8, height: 8 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Install MetaMask"
              secondary={
                <Link 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Download from the official website
                </Link>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Circle sx={{ width: 8, height: 8 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Create or Import a Wallet"
              secondary="Follow MetaMask's setup guide to create a new wallet or import an existing one"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Circle sx={{ width: 8, height: 8 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Connect to Base Sepolia"
              secondary="Make sure to add and connect to the Base Sepolia test network"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Need Base Sepolia tokens?</AlertTitle>
          Visit the{' '}
          <Link 
            href="https://sepoliafaucet.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Base Sepolia Faucet
          </Link>
          {' '}to get test tokens.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          variant="contained"
          startIcon={<Download />}
        >
          Install MetaMask
        </Button>
        <Button onClick={() => setShowWalletGuide(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ mb: 4 }}>
      {!isConnected ? (
        <Button
          variant="contained"
          onClick={onConnect}
          startIcon={<AccountBalanceWallet />}
          disabled={!window.ethereum}
        >
          {!window.ethereum ? (
            <Box onClick={() => setShowWalletGuide(true)}>
              Install Wallet
            </Box>
          ) : (
            'Connect Wallet'
          )}
        </Button>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Connected Account
            </Typography>
            <Typography variant="body1">
              {formatAddress(account)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Balance
            </Typography>
            <Typography variant="body1">
              {parseFloat(balance).toFixed(4)} ETH
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        </Box>
      )}

      {isConnected && chainId !== '0x14A34' && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <AlertTitle>Wrong Network</AlertTitle>
          Please switch to Base Sepolia network to continue
          <Button
            size="small"
            sx={{ mt: 1 }}
            onClick={async () => {
              try {
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x14A34' }],
                });
              } catch (error) {
                if (error.code === 4902) {
                  try {
                    await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [{
                        chainId: '0x14A34',
                        chainName: 'Base Sepolia',
                        nativeCurrency: {
                          name: 'ETH',
                          symbol: 'ETH',
                          decimals: 18
                        },
                        rpcUrls: ['https://sepolia.base.org'],
                        blockExplorerUrls: ['https://sepolia.basescan.org']
                      }]
                    });
                  } catch (addError) {
                    console.error("Error adding network:", addError);
                  }
                }
              }
            }}
          >
            Switch Network
          </Button>
        </Alert>
      )}

      <WalletGuideDialog />
    </Box>
  );
};

export default WalletConnect;
