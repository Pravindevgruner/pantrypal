import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('delivery@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      alert(err.message || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white max-w-md mx-auto flex flex-col justify-center p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-emerald-500 text-gray-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-3">
          <Truck className="w-9 h-9" />
        </div>
        <h1 className="text-2xl font-extrabold">Delivery Partner Portal</h1>
        <p className="text-xs text-gray-400 mt-1">PantryPal Express Delivery Logistics</p>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 mb-1">Partner Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 pl-9 pr-3 py-2.5 rounded-xl text-white focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 pl-9 pr-3 py-2.5 rounded-xl text-white focus:outline-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-gray-950 font-extrabold py-3 rounded-xl shadow-md hover:bg-emerald-400 transition flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Logging in...' : 'Sign In as Delivery Agent'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="bg-emerald-950/60 rounded-2xl p-4 border border-emerald-800/60 mt-4 text-xs space-y-2">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Demo Delivery Credentials</span>
        </div>
        <p className="text-gray-300 text-[11px]">
          Email: <span className="font-bold text-white">delivery@example.com</span> | Password: <span className="font-bold text-white">password123</span>
        </p>
      </div>
    </div>
  );
}
