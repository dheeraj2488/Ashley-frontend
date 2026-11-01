import { createAsyncThunk } from '@reduxjs/toolkit';
import {services} from '../../services/index';
import type { LoginDto } from './dto/login.dto'
import { toast } from 'react-toastify';
export const adminLogin = createAsyncThunk(
    'auth/adminLogin',
    async (
      data: LoginDto
    ) => {
        return await services.loginService.login(data);
       
    },
  );

export const adminRegister = createAsyncThunk(
    'auth/adminRegister',
    async (
      data: LoginDto
    ) => {

        const res =  await services.loginService.register(data);
        if(!res.success){
            toast.error(res.message);
        }else{
            toast.success("Registration successful");
        }

        return res;
       
    },
  );  