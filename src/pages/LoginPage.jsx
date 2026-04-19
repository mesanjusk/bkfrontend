import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'sanju', password: 'sanju' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="center">
      <form className="panel narrow" onSubmit={submit}>
        <h2>Login</h2>
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
        {error ? <div className="error">{error}</div> : null}
        <button type="submit">Login</button>
        <div className="small">Default super admin: sanju / sanju</div>
      </form>
    </div>
  );
}
