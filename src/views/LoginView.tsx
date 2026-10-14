import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { DEMO_USER } from '../lib/seedData';
import { Logo } from '../components/Logo';

export const LoginView: React.FC = () => {
  const { login } = useInventory();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
    }, 200);
  };

  const fillDemo = () => {
    setUsername(DEMO_USER.username);
    setPassword(DEMO_USER.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f5ed] flex flex-col justify-center items-center p-4">
      {/* Centered Brand Lockup */}
      <div className="mb-6">
        <Logo size="lg" />
      </div>

      {/* Main Login Card (Matching Page 4 screenshot) */}
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-[#e5dfd2] p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#17211d]">Sign in</h2>
          <p className="text-xs text-[#6e7771] mt-1">
            Enter your credentials to access the inventory
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 text-xs text-[#991b1b] bg-[#fee2e2] border border-[#fca5a5] rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#37413b] mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-3 py-2 text-sm bg-[#faf9f5] border border-[#dcd6c7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 transition-colors text-[#17211d]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#37413b] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 text-sm bg-[#faf9f5] border border-[#dcd6c7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 transition-colors text-[#17211d]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#0f5b43] hover:bg-[#0b4835] active:bg-[#083627] disabled:opacity-70 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
              {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>

        {/* Demo credentials hint below form */}
        <div className="mt-6 pt-4 border-t border-[#f0ece1] text-center">
          <button
            type="button"
            onClick={fillDemo}
            className="text-[11px] text-[#6d7770] hover:text-[#0f5b43] transition-colors inline-flex items-center gap-1 font-mono"
          >
            <span>Demo:</span>
            <span className="font-semibold underline decoration-dotted">admin</span>
            <span>/</span>
            <span className="font-semibold underline decoration-dotted">admin123</span>
          </button>
        </div>
      </div>
    </div>
  );
};
