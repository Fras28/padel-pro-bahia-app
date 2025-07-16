// src/components/Auth/EmailConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EmailConfirmation = ({ API_BASE }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Confirmando tu correo electrónico...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      const params = new URLSearchParams(location.search);
      const confirmationToken = params.get('confirmation');

      if (!confirmationToken) {
        setMessage('Token de confirmación no encontrado.');
        setIsError(true);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}api/auth/email-confirmation?confirmation=${confirmationToken}`);
        const data = await response.json();

        if (response.ok) {
          setMessage('¡Tu correo electrónico ha sido confirmado exitosamente! Ahora puedes iniciar sesión.');
          setIsError(false);
          // Opcional: Redirigir al login después de un breve retraso
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setMessage(data.error?.message || 'Error al confirmar el correo electrónico.');
          setIsError(true);
        }
      } catch (error) {
        setMessage('Error de red al intentar confirmar el correo electrónico.');
        setIsError(true);
        console.error('Error during email confirmation:', error);
      }
    };

    confirmEmail();
  }, [location.search, API_BASE, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Confirmación de Correo</h2>
        <p className={`text-lg ${isError ? 'text-red-600' : 'text-gray-700'}`}>
          {message}
        </p>
        {!isError && (
          <p className="mt-4 text-sm text-gray-500">
            Serás redirigido a la página de inicio de sesión en breve.
          </p>
        )}
        {isError && (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-300"
          >
            Ir a Iniciar Sesión
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;
