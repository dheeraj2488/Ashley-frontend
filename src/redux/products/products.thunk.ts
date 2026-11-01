import {createAsyncThunk } from '@reduxjs/toolkit';
import {services} from '../../services/index';


export const fetchProducts = createAsyncThunk(
    'products/fetch',
    async () => {
      
        const res = await services.productService.getAllProducts();
        console.log("all prodcs " , res.data)
        return res.data;
     
    },
  );

export const fetchAdminProducts = createAsyncThunk(
  'products/fetchAdmin',
  async () => {
    const res = await services.productService.getAdminProducts();
    return res.data;
  },
);
  
  export const createProduct = createAsyncThunk(
    'products/create',
    async (data: any) => {

        const res = await services.productService.createProduct( data);
        return res.data;
    },
  );

  export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, data }: { id: string; data: any }) => {
      const res = await services.productService.updateProduct(id, data);
      return res.data;
    },
  );

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string) => {
    const res = await services.productService.deleteProduct(id);
    return res.data;
  },
);