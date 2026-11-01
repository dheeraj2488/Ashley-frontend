import { type FormEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import  { adminLogin } from '../redux/auth/auth.thunk';
import {toast} from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const AdminLogin = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(
        adminLogin({
          email,
          password,
        })
      ).unwrap(); // ✅ waits for success
  
      toast.success('Login successful');
      navigate('/admin/dashboard'); 
    } catch (err: any) {
      toast.error(err || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-300 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Welcome , Aashna
        </h2>
        <p className="text-sm text-gray-500 text-center mt-1">
          Login to manage products
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-100 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
