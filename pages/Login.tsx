
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useApp();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = login(email, password);
      if (success) {
        navigate('/dashboard'); // Will redirect based on role in App or component
      } else {
        setError('Email hoặc mật khẩu không đúng!');
      }
    } else {
      if (!name || !email || !password) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }
      const success = register(name, email, password, role);
      if (success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
        setPassword('');
      } else {
        setError('Email đã tồn tại!');
      }
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-brand-600 p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">LHP LMS</h2>
        <p className="text-brand-100">Trường THPT Lê Hồng Phong</p>
      </div>
      
      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
        </h3>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bạn là ai?</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value={Role.STUDENT}>Học sinh</option>
                <option value={Role.TEACHER}>Giáo viên</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors shadow-md mt-6"
          >
            {isLogin ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-brand-600 hover:text-brand-800 text-sm font-medium"
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
