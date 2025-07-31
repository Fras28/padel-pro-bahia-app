// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

const Register = ({ API_BASE }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for confirm password visibility
  const [acceptNotifications, setAcceptNotifications] = useState(true); // Nuevo estado para aceptar notificaciones, por defecto true
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // Step 1: Register the user with only username, email, and password
      const registerResponse = await fetch(`${API_BASE}api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          // Removed notifications_opt_in from here to avoid 400 Bad Request
        }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        setSuccess('¡Registro exitoso! Por favor, verifica tu correo para confirmar tu cuenta.');
        navigate('/login', { state: { registeredEmail: email, showConfirmationModal: true } });
      } else {
        // Log the full error object for more details if possible
        setError(registerData.error?.message || 'Error en el registro.');
        console.error('Registration error:', registerData); // Log the full error object for debugging
      }
    } catch (err) {
      setError('Error de red. Inténtalo de nuevo más tarde.');
      console.error('Error de registro:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-4 pt-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition duration-500 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">Registrarse</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block text-black w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300 ease-in-out"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block text-black  w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300 ease-in-out"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="mt-1 block text-black  w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300 ease-in-out pr-10" // Added pr-10 for icon space
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
          <div className="relative"> {/* Added relative for icon positioning */}
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="mt-1 block text-black  w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300 ease-in-out pr-10" // Added pr-10 for icon space
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center cursor-pointer" // Icon positioning
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle function
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-500" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-500" />
              )}
            </span>
          </div>

          {/* Checkbox para aceptar notificaciones */}
          <div className="flex items-center">
            <input
              id="acceptNotifications"
              name="acceptNotifications"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={acceptNotifications}
              onChange={(e) => setAcceptNotifications(e.target.checked)}
            />
            <label htmlFor="acceptNotifications" className="ml-2 block text-sm text-gray-900">
              Acepto recibir notificaciones por correo electrónico sobre mis partidos y torneos.
            </label>
          </div>

          {/* Enlace a la política de privacidad */}
          <p className="text-center text-sm text-gray-600">
            Al registrarte, aceptas nuestros{' '}
            <Link to="/privacy-policy" className="font-medium text-blue-600 hover:text-blue-500">
              Términos de Servicio y Política de Privacidad
            </Link>
            .
          </p>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Registrarse
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;