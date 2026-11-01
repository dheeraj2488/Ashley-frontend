import {
  Box,
  Button,
  Container,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { services } from '../services';
import { clearCart } from '../redux/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';

type CheckoutFormState = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'COD' | 'RAZORPAY';
};

const initialForm: CheckoutFormState = {
  customerName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  paymentMethod: 'RAZORPAY',
};

const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    const existing = document.getElementById('razorpay-checkout');
    if (existing) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((state) => state.cart.items);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!items.length) {
      navigate('/', { replace: true });
    }
  }, [items.length, navigate]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const shippingFee = useMemo(
    () => items.reduce((sum, item) => sum + (item.shippingCharge ?? 0) * item.quantity, 0),
    [items],
  );
  const total = subtotal + shippingFee;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!items.length) {
      toast.error('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const response = await services.orderService.createGuestCheckout({
        ...form,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
            shippingCharge: item.shippingCharge ?? 0,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
        })),
      });

      const order = response.data;

      if (form.paymentMethod === 'RAZORPAY' && order?.razorpayOrder) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !(window as any).Razorpay) {
          dispatch(clearCart());
          navigate(`/order/success/${order.id}`, { state: { order, paymentMode: 'demo' } });
          toast.info('Razorpay is not available in this environment, so the order was recorded in demo mode.');
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.razorpayOrder.amount,
          currency: order.razorpayOrder.currency,
          name: 'Ashley Atelier',
          description: 'Premium clothing checkout',
          order_id: order.razorpayOrder.id,
          prefill: {
            name: form.customerName,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: '#7c4f32',
          },
          handler: async (paymentResponse: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            await services.orderService.verifyRazorpayPayment({
              orderId: order.id,
              paymentId: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
            });

            dispatch(clearCart());
            navigate(`/order/success/${order.id}`, { state: { order: { ...order, status: 'PAID' } } });
            toast.success('Payment confirmed');
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
        return;
      }

      dispatch(clearCart());
      navigate(`/order/success/${order.id}`, { state: { order } });
      toast.success('Order placed successfully');
    } catch (error) {
      toast.error('Checkout failed');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.4fr) minmax(0, 0.9fr)' } }}>
        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 5, boxShadow: 'var(--shadow)' }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h3" sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
                Guest checkout
              </Typography>
              <Typography sx={{ color: 'var(--muted)' }}>
                No account required. Place the order and pay with COD or Razorpay.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } }}>
                <TextField fullWidth required label="Full name" name="customerName" value={form.customerName} onChange={handleChange} />
                <TextField fullWidth required label="Email address" type="email" name="email" value={form.email} onChange={handleChange} />
                <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} />
                <TextField
                  fullWidth
                  required
                  select
                  label="Payment method"
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                >
                  <MenuItem value="RAZORPAY">Razorpay</MenuItem>
                  <MenuItem value="COD">Cash on delivery</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={3}
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  sx={{ gridColumn: '1 / -1' }}
                />
                <TextField fullWidth required label="City" name="city" value={form.city} onChange={handleChange} />
                <TextField fullWidth required label="State" name="state" value={form.state} onChange={handleChange} />
                <TextField fullWidth required label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={1.2}>
                <Button
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={submitting}
                  sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-strong)' } }}
                >
                  {submitting ? 'Placing order...' : `Place order · ${formatPrice(total)}`}
                </Button>
                <Typography variant="caption" sx={{ color: 'var(--muted)' }}>
                  Shipping becomes free above ₹5,000.
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 5, boxShadow: 'var(--shadow)', position: 'sticky', top: 32, alignSelf: 'start' }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Order summary
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {items.map((item) => (
              <Stack key={item.productId} direction="row" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                    Qty {item.quantity}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--muted)' }}>
                    Shipping {item.shippingCharge ? formatPrice(item.shippingCharge * item.quantity) : 'Free'}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 800 }}>{formatPrice(item.price * item.quantity)}</Typography>
              </Stack>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={1.3}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="var(--muted)">Subtotal</Typography>
              <Typography sx={{ fontWeight: 700 }}>{formatPrice(subtotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="var(--muted)">Shipping</Typography>
              <Typography sx={{ fontWeight: 700 }}>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography sx={{ fontWeight: 900 }}>{formatPrice(total)}</Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default CheckoutPage;
