
// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = ({ API_BASE }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE}api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.');
      } else {
        const data = await response.json();
        setError(data.error?.message || 'Error al solicitar el restablecimiento de contraseña.');
      }
    } catch (err) {
      setError('Error de red. Inténtalo de nuevo más tarde.');
      console.error('Error al solicitar restablecimiento de contraseña:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-4 pt-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition duration-500 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">¿Olvidaste tu Contraseña?</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 text-black  block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300 ease-in-out"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Restablecer Contraseña
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
