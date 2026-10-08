import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials, setLoading, setError } from '../features/auth/authSlice';
import api from '../utils/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await api.post('/users/login', { email, password });
      // Saving to localStorage and Redux state happens in setCredentials
      dispatch(setCredentials({ user: response.data, token: response.data.token }));
      dispatch(setLoading(false));
      navigate('/');
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to sign in'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface-light rounded-2xl p-8 w-full max-w-md shadow-xl shadow-primary-900/20">
        <h1 className="text-3xl font-bold text-center text-primary-300 mb-6">Sign In</h1>
        {error && (
          <div className="bg-danger-500/10 text-danger-500 p-3 rounded-md mb-6 text-center text-sm font-medium border border-danger-500/20">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full bg-surface-lighter text-slate-100 rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full bg-surface-lighter text-slate-100 rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 transition-colors mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
