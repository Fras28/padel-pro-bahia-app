// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

const Login = ({ API_BASE, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.showConfirmationModal) {
      setShowConfirmationModal(true);
      setRegisteredEmail(location.state.registeredEmail || '');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE}api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        navigate('/');
      } else {
        setError(data.error?.message || 'Credenciales inválidas.');
      }
    } catch (err) {
      setError('Error de red. Inténtalo de nuevo más tarde.');
      console.error('Error de inicio de sesión:', err);
    }
  };

  const ConfirmationModal = ({ email, onClose }) => {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <h3 className="text-2xl font-bold text-blue-800 mb-4">¡Registro Exitoso!</h3>
          <p className="text-gray-700 mb-6">
            Por favor, revisa tu casilla de correo electrónico
            <span className="font-semibold text-blue-600"> {email} </span>
            para confirmar tu cuenta y activarla.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-4 pt-6 rounded-lg" >
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition duration-500 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="identifier">
              Email o Nombre de Usuario
            </label>
            <input
              type="text"
              id="identifier"
              className="mt-1 block w-full text-black px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300 ease-in-out"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="relative"> {/* Added relative for icon positioning */}
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'} 
              id="password"
              className="mt-1 block w-full px-4 py-2 text-black border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300 ease-in-out pr-10" // Added pr-10 for icon space
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center cursor-pointer" // Icon positioning
              onClick={() => setShowPassword(!showPassword)} // Toggle function
            >
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-500" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-500" />
              )}
            </span>
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Iniciar Sesión
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
            ¿Olvidaste tu contraseña?
          </Link>
          <p className="mt-2 text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {showConfirmationModal && (
        <ConfirmationModal
          email={registeredEmail}
          onClose={() => setShowConfirmationModal(false)}
        />
      )}
    </div>
  );
};

export default Login;