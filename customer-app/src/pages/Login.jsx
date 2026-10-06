import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col justify-center p-6">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md mb-3">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Pantry<span className="text-emerald-600">Pal</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Smart Grocery Delivery & Expiry Tracker</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-900 text-base">Sign In to Your Account</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-emerald-500"
                placeholder="customer@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-emerald-700 transition flex items-center justify-center space-x-2 text-xs"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>

      {/* Quick Demo Credentials Assistant */}
      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mt-4 text-xs space-y-2">
        <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Quick 1-Click Demo Login</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 pt-1">
          <button
            onClick={() => fillDemoAccount('customer@example.com')}
            className="text-left bg-white p-2 rounded-xl border border-emerald-200 font-medium hover:bg-emerald-100 flex justify-between"
          >
            <span>Customer: customer@example.com</span>
            <span className="font-bold text-emerald-600">Select</span>
          </button>
        </div>
      </div>
    </div>
  );
}
