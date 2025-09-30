// src/components/FeedbackModal.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Íconos usados
import { faTimes, faLightbulb, faBug, faMagic, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

// Tipos de sugerencia (Valores ajustados para coincidir con el 'enum' de Strapi)
const SUGGESTION_TYPES = [
    { value: 'nueva_funcionalidad', label: 'Idea/Nueva Funcionalidad', icon: faMagic }, // Coincide con el enum
    { value: 'mejora_general', label: 'Dificultad de Uso (UX)', icon: faLightbulb }, // Coincide con el enum
    { value: 'error_reportado', label: 'Reporte de Error', icon: faBug }, // Coincide con el enum
];

const FeedbackModal = ({ API_BASE, user, isOpen, onClose }) => {

    // Inicializamos el estado del formulario con el valor 'mejora_general'
    const [formData, setFormData] = useState({
        detalle: '',
        tipo_sugerencia: 'mejora_general', // Valor inicial corregido
        email_contacto: user ? user.email : '',
        contexto_pagina: window.location.pathname, // Se mantiene en el estado, pero no se envía a Strapi
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Sincroniza el email y el contexto de la página al abrir la modal
    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                contexto_pagina: window.location.pathname, // Actualiza el contexto
                email_contacto: user ? user.email : prev.email_contacto // Sincroniza el email
            }));
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const isFormValid = formData.detalle.length >= 10 && formData.detalle.length <= 300;
        if (!isFormValid) {
            setMessage({ type: 'error', text: 'El detalle de la sugerencia debe tener entre 10 y 300 caracteres.' });
            setLoading(false);
            return;
        }

        // EL PAYLOAD CORREGIDO: Los nombres de las claves coinciden con tu schema.json
        const payload = {
            data: {
                // Mapea 'detalle' (del formulario) a 'mensaje' (de Strapi)
                mensaje: formData.detalle,

                // Coincide: tipo_sugerencia
                tipo_sugerencia: formData.tipo_sugerencia,

                // Mapea 'email_contacto' (del formulario) a 'email_usuario' (de Strapi)
                email_usuario: formData.email_contacto,

                // Campo de relación con el usuario
                users_permissions_user: user ? user.id : null,

                // **IMPORTANTE**: Eliminados 'contexto_pagina' y 'estado_gestion' para pasar la validación de Strapi.
            }
        };

        try {
            // Define los headers sin el encabezado Authorization (para endpoints públicos)
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            const response = await fetch(`${API_BASE}api/sugerencias`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: '¡Gracias! Tu sugerencia ha sido enviada con éxito. Revisaremos tu idea pronto.' });

                // Limpiar el formulario y reajustar los valores por defecto
                setFormData(prev => ({
                    detalle: '',
                    tipo_sugerencia: 'mejora_general', // Vuelve al valor inicial corregido
                    email_contacto: user ? user.email : '',
                    contexto_pagina: window.location.pathname,
                }));
                setTimeout(onClose, 3000);
            } else {
                const errorData = await response.json();
                const errorMsg = errorData.error?.message || 'Error desconocido al enviar la sugerencia.';
                setMessage({ type: 'error', text: `Error al enviar: ${errorMsg}. Verifica que el backend tenga los permisos y campos requeridos.` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de red. Asegúrate de tener conexión e inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    // Verifica si el campo de texto es válido para habilitar el botón
    const isFormValid = formData.detalle.length >= 10 && formData.detalle.length <= 300;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-70" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-auto flex flex-col overflow-hidden transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-blue-800 flex items-center">
                        <FontAwesomeIcon icon={faPenToSquare} className="mr-2 text-yellow-500" />
                        ¡Déjanos tu Sugerencia!
                    </h2>
                    <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors bg-gray-100 border-solid border-2 border-red">
                        <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                    </button>
                </div>

                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tipo de Sugerencia */}
                    <div>
                        <label htmlFor="tipo_sugerencia" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            Categoría del feedback
                        </label>
                        <select
                            id="tipo_sugerencia"
                            name="tipo_sugerencia"
                            value={formData?.tipo_sugerencia}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full text-black pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm border"
                        >
                            {SUGGESTION_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Detalle */}
                    <div>
                        <label htmlFor="detalle" className="block  font-medium text-gray-700 mb-1 text-left">
                            Describe tu idea o problema
                        </label> 
                        <textarea
                            id="detalle"
                            name="detalle"
                            value={formData.detalle}
                            onChange={handleInputChange}
                            rows="4"
                            maxLength="300"
                            required
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md border p-2 resize-none text-black"
                            placeholder="Ej: La tabla de ranking interno es confusa en móvil."
                        ></textarea>
                        <p className={`text-right text-xs mt-1 ${formData.detalle.length > 300 || formData.detalle.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                            {formData.detalle.length} / 300
                        </p>
                    </div>

                    {/* Email de Contacto (mapea a email_usuario en Strapi) */}
                    <div>
                        <label htmlFor="email_contacto" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            Email de Contacto ({user ? 'Tu cuenta' : 'Opcional'})
                        </label>
                        <input
                            type="email"
                            id="email_contacto"
                            name="email_contacto"
                            value={formData.email_contacto}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black"
                            placeholder="email@ejemplo.com"
                        />
                    </div>

                    {/* <p className="text-xs text-gray-500">
                        Contexto de la página: <code>{formData.contexto_pagina}</code>
                    </p> */}


                    {/* Botón de Enviar */}
                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading || !isFormValid
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            } transition-colors duration-200`}
                    >
                        {loading ? 'Enviando...' : 'Enviar Sugerencia'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;