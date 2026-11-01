import { Box, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { services } from '../../services';

type Analytics = {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  revenue: number;
};

const AdminOverview = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    services.orderService.getAnalytics().then((response) => {
      if (response.success) {
        setAnalytics(response.data);
      }
    });
  }, []);

  const cards = [
    { label: 'Total orders', value: analytics.totalOrders },
    { label: 'Paid orders', value: analytics.paidOrders },
    { label: 'Pending', value: analytics.pendingOrders },
    { label: 'Revenue', value: `₹${analytics.revenue.toLocaleString('en-IN')}` },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
        Store analytics
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' } }}>
        {cards.map((card) => (
          <Box key={card.label}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                {card.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                {card.value}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>
    </Stack>
  );
};

export default AdminOverview;