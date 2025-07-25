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

        // ****** ESTE ES EL CAMBIO CLAVE: YA NO INTENTAMOS PARSEAR response.json() AQUÍ *****
        // ****** Si response.ok es true, asumimos éxito y procedemos a la redirección. *****

        if (response.ok) { // Si el estado HTTP es 2xx (200, 201, 204, o una redirección 3xx seguida exitosamente)
          setMessage('¡Tu correo electrónico ha sido confirmado exitosamente! Ahora puedes iniciar sesión.');
          setIsError(false);
          
          // Redirigir al login después de un breve retraso
          setTimeout(() => {
            navigate('/login');
          }, 3000);

        } else { // Si el estado HTTP NO es 2xx (esto indica un error explícito del servidor, ej. 400, 500)
          let errorData = null;
          try {
            // Intentar parsear JSON solo si el encabezado Content-Type de la respuesta es 'application/json'
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              errorData = await response.json();
            }
          } catch (jsonParseError) {
            // Esto ocurre si la respuesta de error NO es JSON, o está vacía.
            console.warn("No se pudo parsear la respuesta de error como JSON. La respuesta de error puede no ser JSON o estar vacía:", jsonParseError);
          }
          
          // Usar el mensaje de error que venga de Strapi, o uno genérico si no hay JSON o es un error inesperado
          setMessage(errorData?.error?.message || 'Error al confirmar el correo electrónico. Por favor, intenta nuevamente.');
          setIsError(true);
        }
      } catch (error) {
        // Este bloque 'catch' maneja errores de red puros (ej. no hay conexión, error de CORS antes de recibir respuesta)
        // o problemas que impiden que la solicitud HTTP se complete.
        setMessage('Error de red al intentar confirmar el correo electrónico.');
        setIsError(true);
        console.error('Error durante la confirmación del correo electrónico:', error);
      }
    };

    confirmEmail();
  }, [location.search, API_BASE, navigate]); // Asegúrate de que todas las dependencias estén aquí

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