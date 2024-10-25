import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { Box, Paper, Typography, Grid, useTheme } from '@mui/material';

const BondingCurveChart = ({ 
  data = [], // This should be the full curve data points
  currentSupply = 0,
  currentPrice = 0,
  tradeAmount = 0,
  tradeMode = 'buy',
  newPrice = 0, // Add this prop for the calculated new price
  newSupply = 0  // Add this prop for the calculated new supply
}) => {
  const theme = useTheme();

  // Format tooltip values
  const formatTooltip = (value, name) => {
    if (name === 'price') {
      return [`${Number(value).toFixed(6)} USDC`, 'Price'];
    }
    return [`${Number(value).toFixed(6)}`, 'Supply'];
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: 300, 
        bgcolor: 'background.paper',
        borderRadius: 1,
        mb: 3
      }}
    >
          <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Current Supply
          </Typography>
          <Typography variant="h6">
            {Number(currentSupply).toFixed(6)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Last Price
          </Typography>
          <Typography variant="h6">
            {Number(currentPrice).toFixed(6)} USDC
          </Typography>
        </Grid>
      </Grid>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="supply" 
            type="number"
            domain={[0, 'auto']}
            label={{ value: 'Supply', position: 'bottom' }}
          />
          <YAxis
            type="number"
            domain={[0, 'auto']}
            label={{ value: 'Price (USDC)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={(value) => `Supply: ${Number(value).toFixed(6)}`}
          />
          
          {/* The Bonding Curve */}
          <Line
            type="monotone"
            dataKey="price"
            stroke={theme.palette.primary.main}
            dot={false}
            strokeWidth={2}
          />

          {/* Current Position (Last Traded) */}
          <ReferenceDot
            x={currentSupply}
            y={currentPrice}
            r={6}
            fill={theme.palette.secondary.main}
            stroke={theme.palette.secondary.dark}
          />

          {/* Trade Impact (Only show when there's a trade amount) */}
          {tradeAmount > 0 && newSupply > 0 && newPrice > 0 && (
            <>
              <ReferenceDot
                x={newSupply}
                y={newPrice}
                r={6}
                fill={tradeMode === 'buy' ? theme.palette.success.main : theme.palette.error.main}
                stroke={tradeMode === 'buy' ? theme.palette.success.dark : theme.palette.error.dark}
              />
              <Line
                type="linear"
                data={[
                  { supply: currentSupply, price: currentPrice },
                  { supply: newSupply, price: newPrice }
                ]}
                dataKey="price"
                stroke={tradeMode === 'buy' ? theme.palette.success.main : theme.palette.error.main}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </>
          )}
        </LineChart>
        
      </ResponsiveContainer>
    </Paper>
  );
};

export default BondingCurveChart;
