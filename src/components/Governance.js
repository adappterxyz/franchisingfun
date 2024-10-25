import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Stack,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  HowToVote,
  LocalAtm,
  Description,
  AdminPanelSettings,
  Close as CloseIcon,
  Upload,
  InfoOutlined
} from '@mui/icons-material';
import TokenBrandDetails from './TokenBrandDetails';


function Governance({
  tokenAddresses,
  selectedDAO,
  setSelectedDAO,
  daoDetails,
  setDaoDetails,
  selectedTokenTicker,
  proposals,
  stakedAmount,
  openStakeDialog,
  setOpenStakeDialog,
  openUnstakeDialog,
  setOpenUnstakeDialog,
  openProposalDialog,
  setOpenProposalDialog,
  selectedProposal,
  setSelectedProposal,
  stakeAmount,
  setStakeAmount,
  unstakeAmount,
  setUnstakeAmount,
  proposalTitle,
  setProposalTitle,
  proposalDescription,
  setProposalDescription,
  voteValue,
  setVoteValue,
  handleStake,
  handleUnstake,
  handleCreateProposal,
  handleVote,
  getDAODetails,




}) {
  // Component state
  const [openMFADialog, setOpenMFADialog] = useState(false);
  const [mfaOfferer, setMfaOfferer] = useState('');
  const [mfaTokenAmount, setMfaTokenAmount] = useState('');
  const [mfaVestingDuration, setMfaVestingDuration] = useState(24);
  const [mfaType, setMfaType] = useState('official'); // 'official' or 'alternative'
  const [brandDetails, setBrandDetails] = useState({
    website: '',
    documents: null,
    // ... other brand details
  });
  const [selectedGovernanceToken, setSelectedGovernanceToken] = useState(null);
  const handleTokenSelect = (value) => {
    const tokenAddress = value;
    const token = tokenAddresses.find(t => t.address === tokenAddress);
    setSelectedGovernanceToken(token);
    // ... rest of your existing handleTokenSelect logic
  };
  const handleInitializeMFA = async () => {
    try {
      // Create MFA proposal
      const proposal = {
        title: 'Master Franchise Agreement Token Transfer',
        description: `MFA Token Transfer Proposal:
          \nOfferer Address: ${mfaOfferer}
          \nToken Amount: ${mfaTokenAmount}
          \nVesting Duration: ${mfaVestingDuration} months`,
        type: 'MFA_TRANSFER',
        config: {
          offerer: mfaOfferer,
          amount: mfaTokenAmount,
          vestingDuration: parseInt(mfaVestingDuration) * 30 * 24 * 3600 // Convert months to seconds
        }
      };
      
      // Create proposal through standard governance
      await handleCreateProposal(proposal);
      setOpenMFADialog(false);
    } catch (error) {
      console.error('Error creating MFA proposal:', error);
    }
  };
  return (
    <Container>
    {/* DAO Selector */}
    <Paper sx={{ p: 3, mb: 3 }}>
      <FormControl fullWidth>
        <InputLabel>Select Franchise DAO</InputLabel>
        <Select
          value={selectedDAO}
          onChange={(e) => {
            setSelectedDAO(e.target.value);
            setDaoDetails(getDAODetails(e.target.value));
            handleTokenSelect(e.target.value);
          }}
          label="Select Franchise DAO"
        >
          {tokenAddresses.map((token) => (
            <MenuItem key={token.address} value={token.address}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{token.name}</Typography>
                <Chip 
                  label={token.ticker} 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>

    {selectedDAO ? (
      <>
        {/* DAO Info Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5">{daoDetails?.name}</Typography>
              <Typography color="text.secondary" gutterBottom>
                {daoDetails?.address}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Chip 
                  icon={<HowToVote />} 
                  label={`${proposals.length} Active Proposals`}
                />
                <Chip 
                  icon={<LocalAtm />} 
                  label={`${stakedAmount} ${daoDetails?.ticker} Staked`}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Staking Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Staking 
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Currently Staked
                </Typography>
                <Typography variant="h4">
                  {stakedAmount} {selectedGovernanceToken?.ticker || 'Tokens'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                    15% APR
                  </Typography>
                  <Tooltip title="Annual Percentage Rate for staking rewards">
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <InfoOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<LocalAtm />}
                  onClick={() => setOpenStakeDialog(true)}
                  fullWidth
                >
                  Stake {selectedTokenTicker}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LocalAtm />}
                  onClick={() => setOpenUnstakeDialog(true)}
                  fullWidth
                >
                  Unstake {selectedTokenTicker}
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Proposals Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Active Proposals
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {proposals.length === 0 && (
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<AdminPanelSettings />}
                      onClick={() => setOpenMFADialog(true)}
                    >
                      Initialize MFA
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<Description />}
                    onClick={() => setOpenProposalDialog(true)}
                  >
                    Create Proposal
                  </Button>
                </Box>
              </Box>
              
              {proposals.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No active proposals
                  </Typography>
                </Box>
              ) : (
                <List>
                  {proposals.map((proposal, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<HowToVote />}
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          Vote
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={proposal.title}
                        secondary={`Votes: For (${proposal.votesFor}) Against (${proposal.votesAgainst})`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Stake Dialog */}
        <Dialog open={openStakeDialog} onClose={() => setOpenStakeDialog(false)}>
          <DialogTitle>Stake Tokens</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Amount to Stake"
              type="number"
              fullWidth
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">{selectedTokenTicker || 'Tokens'}</InputAdornment>,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStakeDialog(false)}>Cancel</Button>
            <Button onClick={handleStake} variant="contained">Stake</Button>
          </DialogActions>
        </Dialog>

        {/* Unstake Dialog */}
        <Dialog open={openUnstakeDialog} onClose={() => setOpenUnstakeDialog(false)}>
          <DialogTitle>Unstake Tokens</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Amount to Unstake"
              type="number"
              fullWidth
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">{selectedTokenTicker || 'Tokens'}</InputAdornment>,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUnstakeDialog(false)}>Cancel</Button>
            <Button onClick={handleUnstake} variant="contained">Unstake</Button>
          </DialogActions>
        </Dialog>

        {/* Create Proposal Dialog */}
        <Dialog 
          open={openProposalDialog} 
          onClose={() => setOpenProposalDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Proposal Title"
                fullWidth
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                sx={{ mb: 3 }}
              />
              <TextField
                label="Proposal Description"
                fullWidth
                multiline
                rows={4}
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProposalDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateProposal} variant="contained">Create Proposal</Button>
          </DialogActions>
        </Dialog>

        {/* Vote Dialog */}
        <Dialog 
          open={Boolean(selectedProposal)} 
          onClose={() => setSelectedProposal(null)}
        >
          <DialogTitle>{selectedProposal?.title}</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Your Vote</FormLabel>
              <RadioGroup
                value={voteValue}
                onChange={(e) => setVoteValue(e.target.value)}
              >
                <FormControlLabel value="for" control={<Radio />} label="For" />
                <FormControlLabel value="against" control={<Radio />} label="Against" />
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedProposal(null)}>Cancel</Button>
            <Button onClick={handleVote} variant="contained">Submit Vote</Button>
          </DialogActions>
        </Dialog>

        {/* MFA Initialization Dialog */}
        <Dialog 
          open={openMFADialog} 
          onClose={() => setOpenMFADialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { width: '100%', maxWidth: 'md' }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Master Franchise Agreement Initialization
              <IconButton onClick={() => setOpenMFADialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Alert severity="info">
                <AlertTitle>Master Franchise Agreement Proposal</AlertTitle>
                Create a proposal for a Master Franchise Agreement token transfer. All metadata and legal documentation will be stored on-chain.
              </Alert>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="1. Store Legal Documentation"
                    secondary="All MFA documentation and metadata will be stored on-chain"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="2. Token Transfer Configuration"
                    secondary="Set up the treasury transfer parameters and vesting schedule"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="3. Alternative Offering"
                    secondary="In the event where prospected brand is not available / interested, an alternative brand may reach out to appeal to the community for MFA swap."
                  />
                </ListItem>
              </List>
              
              <FormControl fullWidth   >
                <InputLabel>Proposal Type</InputLabel>
                <Select
                  value={mfaType}
                  onChange={(e) => setMfaType(e.target.value)}
                  label="Proposal Type"
                >
                  <MenuItem value="official">Official Brand Representative</MenuItem>
                  <MenuItem value="alternative">Alternative Brand Offering</MenuItem>
                </Select>
                  </FormControl>

              {mfaType === 'official' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Public announcement / Url for validation"
                    fullWidth
                    type="url"
                    value={brandDetails.website}
                    onChange={(e) => setBrandDetails({...brandDetails, website: e.target.value})}
                    helperText="To prove validity of provisional MFA interest, please include an official declaration of intent."
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                    fullWidth
                  >
                    Upload Official Documentation
                    <input
                      type="file"
                      hidden
                      onChange={(e) => setBrandDetails({...brandDetails, documents: e.target.files[0]})}
                    />
                  </Button>
                </Box>
              ) : (
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <TokenBrandDetails 
                    brandDetails={brandDetails}
                    setBrandDetails={setBrandDetails}
                  />
                </Paper>
              )}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Token Amount"
                  type="number"
                  fullWidth
                  value={mfaTokenAmount}
                  onChange={(e) => setMfaTokenAmount(e.target.value)}
                  helperText="Amount of tokens to be transferred"
                />
                
                <TextField
                  label="Vesting Duration (months)"
                  type="number"
                  fullWidth
                  value={mfaVestingDuration}
                  onChange={(e) => setMfaVestingDuration(e.target.value)}
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                  helperText="Duration over which the tokens will be vested"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenMFADialog(false)}>Cancel</Button>
            <Button 
              onClick={handleInitializeMFA} 
              variant="contained"
              color="warning"
              disabled={
                (mfaType === 'official' && (!brandDetails.website || !brandDetails.documents)) ||
                (mfaType === 'alternative' && (!brandDetails.country || !brandDetails.description)) ||
                !mfaTokenAmount ||
                !mfaVestingDuration
              }
            >
              Initialize MFA Transfer
            </Button>
          </DialogActions>
        </Dialog>
      </>
    ) : (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Please select a DAO to view governance details.
        </Typography>
      </Paper>
    )}
  </Container>
  );
}

export default Governance;
