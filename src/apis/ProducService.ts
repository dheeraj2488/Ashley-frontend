import http from './http';

export class ProductService {
  async getAllProducts() {
    try {
      const response = await http.get('/products/getAllProducts');
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async createProduct(data: any) {
    try {
      const response = await http.post('/products/create-product', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAdminProducts() {
    try {
      const response = await http.get('/products/admin/products');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id: string, data: any) {
    try {
      const response = await http.put(`/products/admin/products/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      const response = await http.delete(`/products/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
