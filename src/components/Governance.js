import React from 'react';
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
  Radio
} from '@mui/material';
import {
  HowToVote,
  LocalAtm,
  Description
} from '@mui/icons-material';

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
  getDAODetails
}) {
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
                  {stakedAmount} {selectedTokenTicker || 'Tokens'}
                </Typography>
              </Box>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<LocalAtm />}
                  onClick={() => setOpenStakeDialog(true)}
                  fullWidth
                >
                  Stake Tokens
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LocalAtm />}
                  onClick={() => setOpenUnstakeDialog(true)}
                  fullWidth
                >
                  Unstake Tokens
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
                <Button
                  variant="contained"
                  startIcon={<Description />}
                  onClick={() => setOpenProposalDialog(true)}
                >
                  Create Proposal
                </Button>
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
