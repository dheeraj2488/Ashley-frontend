import http from './http';

export class CategoryService {
  async getCategories() {
    const response = await http.get('/categories');
    return response.data;
  }

  async createCategory(data: { name: string; slug: string; description?: string; sortOrder?: number }) {
    const response = await http.post('/categories/admin', data);
    return response.data;
  }
}