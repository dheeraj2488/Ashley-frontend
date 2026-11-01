import {ProductService } from '../apis/ProducService';
import { LoginService } from '../apis/LoginService';
import { CategoryService } from '../apis/CategoryService';
import { OrderService } from '../apis/OrderService';

const productService = new ProductService(); 
const loginService = new LoginService();
const categoryService = new CategoryService();
const orderService = new OrderService();

export interface Services {
    productService: ProductService;
    loginService: LoginService;
    categoryService: CategoryService;
    orderService: OrderService;
}

export const services: Services = {
    productService,
    loginService,
    categoryService,
    orderService,
}
