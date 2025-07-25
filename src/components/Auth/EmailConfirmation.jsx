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

        // **IMPORTANTE:** Si Strapi redirige en éxito, 'response.json()' fallará.
        // Aquí asumimos éxito si el estado HTTP es 2xx, sin necesidad de parsear JSON para el éxito.

        if (response.ok) { // Si el estado HTTP es 2xx (200, 201, etc.)
          setMessage('¡Tu correo electrónico ha sido confirmado exitosamente! Ahora puedes iniciar sesión.');
          setIsError(false);
          
          // Redirigir al login después de un breve retraso
          setTimeout(() => {
            navigate('/login');
          }, 3000);

        } else { // Si el estado HTTP NO es 2xx (hay un error del lado del servidor, ej. 400, 500)
          let errorData = null;
          try {
            // Intenta parsear JSON solo si el Content-Type de la respuesta es JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              errorData = await response.json();
            }
          } catch (jsonParseError) {
            console.warn("No se pudo parsear la respuesta de error como JSON. La respuesta puede no ser JSON o estar vacía:", jsonParseError);
          }
          
          // Usa el mensaje de error de Strapi si está disponible, o un mensaje genérico
          setMessage(errorData?.error?.message || 'Error al confirmar el correo electrónico. Por favor, intenta nuevamente.');
          setIsError(true);
        }
      } catch (error) {
        // Este bloque captura errores de red reales (ej. no hay conexión, CORS)
        // o fallos muy tempranos en la petición `fetch`.
        setMessage('Error de red al intentar confirmar el correo electrónico.');
        setIsError(true);
        console.error('Error durante la confirmación del correo electrónico:', error);
      }
    };

    confirmEmail();
  }, [location.search, API_BASE, navigate]); // Añadir navigate a las dependencias del useEffect

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
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Ir a Inicio de Sesión
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;