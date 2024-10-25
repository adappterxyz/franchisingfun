import React from 'react';
import {
  Box,
  Grid,
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
  Button,
} from '@mui/material';
import { Upload } from '@mui/icons-material';

const TokenBrandDetails = ({ brandDetails, setBrandDetails }) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 2 }}>
        Brand Details
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Country"
            fullWidth
            value={brandDetails.country}
            onChange={(e) => setBrandDetails({...brandDetails, country: e.target.value})}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="City"
            fullWidth
            value={brandDetails.city}
            onChange={(e) => setBrandDetails({...brandDetails, city: e.target.value})}
            required
          />
        </Grid>
      </Grid>

      <TextField
        label="Website"
        fullWidth
        value={brandDetails.website}
        onChange={(e) => setBrandDetails({...brandDetails, website: e.target.value})}
        type="url"
        helperText="Enter your brand's official website"
        sx={{ mb: 2 }}
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={4}
        value={brandDetails.description}
        onChange={(e) => setBrandDetails({...brandDetails, description: e.target.value})}
        helperText="Describe your brand and franchise opportunity"
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Industry</InputLabel>
        <Select
          value={brandDetails.industry}
          onChange={(e) => setBrandDetails({...brandDetails, industry: e.target.value})}
          label="Industry"
        >
          <MenuItem value="food">Food & Beverage</MenuItem>
          <MenuItem value="retail">Retail</MenuItem>
          <MenuItem value="services">Services</MenuItem>
          <MenuItem value="education">Education</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Year Established"
            fullWidth
            type="number"
            value={brandDetails.yearEstablished}
            onChange={(e) => setBrandDetails({...brandDetails, yearEstablished: e.target.value})}
            InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Number of Outlets"
            fullWidth
            type="number"
            value={brandDetails.outlets}
            onChange={(e) => setBrandDetails({...brandDetails, outlets: e.target.value})}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
      </Grid>

      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Authorization Status</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={brandDetails.isAuthorized}
              onChange={(e) => setBrandDetails({...brandDetails, isAuthorized: e.target.checked})}
            />
          }
          label="I am authorized to represent this brand"
        />
      </FormControl>

      {brandDetails.isAuthorized && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload />}
            sx={{ mb: 2 }}
          >
            Upload Authorization Documents
            <input
              type="file"
              hidden
              onChange={(e) => setBrandDetails({...brandDetails, documents: e.target.files[0]})}
            />
          </Button>
          <TextField
            label="Investment Required (USD)"
            fullWidth
            type="number"
            value={brandDetails.investmentRequired}
            onChange={(e) => setBrandDetails({...brandDetails, investmentRequired: e.target.value})}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Box>
      )}
    </>
  );
};

export default TokenBrandDetails;
