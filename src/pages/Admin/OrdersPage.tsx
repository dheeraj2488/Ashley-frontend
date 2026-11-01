import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Chip, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { services } from '../../services';

type OrderRecord = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'SHIPPED' | 'DELIVERED';
  paymentMethod: 'COD' | 'RAZORPAY';
  createdAt: string;
};

const OrdersPage = () => {
  const [rows, setRows] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await services.orderService.getAdminOrders();
      setRows(response.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const columns: GridColDef[] = [
    { field: 'orderNumber', headerName: 'Order', flex: 1 },
    { field: 'customerName', headerName: 'Customer', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      valueFormatter: (value) => `₹${Number(value).toLocaleString('en-IN')}`,
    },
    {
      field: 'paymentMethod',
      headerName: 'Payment',
      width: 130,
      renderCell: (params) => <Chip label={params.value} size="small" />,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 220,
      renderCell: (params) => (
        <Select
          size="small"
          value={params.value}
          onChange={async (event) => {
            await services.orderService.updateOrderStatus(params.row.id, event.target.value as OrderRecord['status']);
            await loadOrders();
          }}
        >
          {['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'SHIPPED', 'DELIVERED'].map((status) => (
            <MenuItem value={status} key={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
        Orders
      </Typography>
      <Paper sx={{ height: 620, width: '100%', borderRadius: 4 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} getRowId={(row) => row.id} pageSizeOptions={[10, 25, 50]} />
      </Paper>
    </Stack>
  );
};

export default OrdersPage;