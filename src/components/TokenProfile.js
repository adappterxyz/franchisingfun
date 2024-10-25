import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
} from '@mui/material';
import {
  Language,
  LocationOn,
  Business,
  CalendarToday,
  Store,
  AttachMoney,
  Edit,
  Share,
} from '@mui/icons-material';

const TokenProfile = ({ token }) => {
  // Example token profile data structure
  const profile = {
    name: token?.name || 'Token Name',
    symbol: token?.symbol || 'TKN',
    brandDetails: {
      logo: token?.brandDetails?.logo || '/placeholder-logo.png',
      website: token?.brandDetails?.website || 'https://example.com',
      country: token?.brandDetails?.country || 'Country',
      city: token?.brandDetails?.city || 'City',
      industry: token?.brandDetails?.industry || 'Industry',
      yearEstablished: token?.brandDetails?.yearEstablished || '2024',
      outlets: token?.brandDetails?.outlets || '0',
      investmentRequired: token?.brandDetails?.investmentRequired || '0',
      description: token?.brandDetails?.description || 'Brand description...',
    },
    stats: {
      marketCap: token?.stats?.marketCap || '0',
      totalSupply: token?.stats?.totalSupply || '0',
      holders: token?.stats?.holders || '0',
      price: token?.stats?.price || '0',
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <CardMedia
              component="img"
              image={profile.brandDetails.logo}
              alt={profile.name}
              sx={{ 
                width: '100%', 
                height: 200, 
                objectFit: 'contain',
                borderRadius: 1 
              }}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {profile.name}
                </Typography>
                <Chip 
                  label={profile.symbol} 
                  color="primary" 
                  sx={{ mr: 1 }} 
                />
                <Chip 
                  label={profile.brandDetails.industry} 
                  variant="outlined" 
                />
              </Box>
              <Box>
                <IconButton>
                  <Edit />
                </IconButton>
                <IconButton>
                  <Share />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph>
                {profile.brandDetails.description}
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="action" />
                  <Typography variant="body2">
                    {profile.brandDetails.city}, {profile.brandDetails.country}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Language color="action" />
                  <Typography variant="body2" component="a" href={profile.brandDetails.website} target="_blank">
                    Website
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="action" />
                  <Typography variant="body2">
                    Est. {profile.brandDetails.yearEstablished}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Store color="action" />
                  <Typography variant="body2">
                    {profile.brandDetails.outlets} Outlets
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Market Cap
              </Typography>
              <Typography variant="h6">
                ${Number(profile.stats.marketCap).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Token Price
              </Typography>
              <Typography variant="h6">
                ${Number(profile.stats.price).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Treasury
              </Typography>
              <Typography variant="h6">
                {Number(profile.stats.totalSupply).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Holders
              </Typography>
              <Typography variant="h6">
                {Number(profile.stats.holders).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Investment Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Investment Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Initial Investment Required"
                  secondary={`$${Number(profile.brandDetails.investmentRequired).toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Token Price"
                  secondary={`$${Number(profile.stats.price).toLocaleString()} per token`}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<AttachMoney />}
              >
                Invest Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TokenProfile;
