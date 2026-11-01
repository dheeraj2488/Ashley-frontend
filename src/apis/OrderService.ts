import http from './http';

export class OrderService {
  async createGuestCheckout(data: {
    customerName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    paymentMethod: 'COD' | 'RAZORPAY';
    items: Array<{ productId: string; name: string; price: number; quantity: number; size?: string; color?: string; image?: string }>;
  }) {
    const response = await http.post('/orders/guest-checkout', data);
    return response.data;
  }

  async getAdminOrders() {
    const response = await http.get('/orders/admin');
    return response.data;
  }

  async getAnalytics() {
    const response = await http.get('/orders/admin/analytics');
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'SHIPPED' | 'DELIVERED') {
    const response = await http.patch(`/orders/admin/${orderId}/status`, { status });
    return response.data;
  }

  async verifyRazorpayPayment(data: { orderId: string; paymentId: string; signature: string }) {
    const response = await http.post('/orders/razorpay/verify', data);
    return response.data;
  }
}