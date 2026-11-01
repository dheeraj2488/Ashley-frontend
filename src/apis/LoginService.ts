import http from './http';
import type { LoginDto } from "../redux/auth/dto/login.dto";

export class LoginService {
  async login(data: LoginDto) {
    try {
      const response = await http.post('/auth/admin/login', data);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async register(data: LoginDto) {
    try {
      const response = await http.post('/auth/admin/register', data);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }
}
