import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const order = (location.state as { order?: { orderNumber?: string; total?: number; customerName?: string; status?: string } } | null)?.order;

  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, textAlign: 'center', boxShadow: 'var(--shadow)' }}>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ width: 88, height: 88, borderRadius: '50%', bgcolor: 'rgba(47,125,79,0.12)', display: 'grid', placeItems: 'center' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 52, color: 'var(--success)' }} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
              Your order is confirmed
            </Typography>
            <Typography sx={{ color: 'var(--muted)', mt: 1 }}>
              {order?.customerName ? `${order.customerName}, your premium pieces are on the way.` : 'We have received your guest checkout.'}
            </Typography>
          </Box>

          <Stack spacing={1} sx={{ width: '100%', maxWidth: 420 }}>
            <Typography sx={{ fontWeight: 700 }}>Order reference</Typography>
            <Typography sx={{ color: 'var(--muted)' }}>{order?.orderNumber ?? orderId}</Typography>
            {order?.total ? (
              <Typography sx={{ color: 'var(--muted)' }}>Grand total: {formatPrice(order.total)}</Typography>
            ) : null}
            {order?.status ? <Typography sx={{ color: 'var(--muted)' }}>Status: {order.status}</Typography> : null}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-strong)' } }}>
              Back to shop
            </Button>
            <Button variant="outlined" onClick={() => navigate('/checkout')} sx={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              Review cart
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage;