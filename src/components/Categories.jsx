// src/components/Categories.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useParams y useNavigate

function Categories() {
    const { clubId } = useParams(); // Obtiene el clubId de los parámetros de la URL
    const navigate = useNavigate(); // Hook para navegar programáticamente

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE;

    // Función para manejar el clic en una categoría
    const handleCategoryClick = useCallback((categoryId) => {
        // Navega a la ruta del ranking interno, incluyendo clubId y categoryId en la URL
        navigate(`/clubs/${clubId}/categories/${categoryId}/ranking`);
    }, [clubId, navigate]);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!clubId) {
                setError("No se ha proporcionado un ID de club en la URL.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch the club to get its categories (assuming categories are nested under club in API)
                // Or, if categories are top-level and linked by club ID, adjust the URL accordingly.
                // For this example, let's assume we fetch categories associated with the club.
                const response = await fetch(`${API_BASE}api/clubs/${clubId}?populate=categorias`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(`Datos de categorías para club ${clubId}:`, data.data);

                if (data.data && data.data.attributes && data.data.attributes.categorias && Array.isArray(data.data.attributes.categorias.data)) {
                    setCategories(data.data.attributes.categorias.data);
                } else {
                    setCategories([]);
                }
            } catch (e) {
                console.error("Error fetching categories:", e);
                setError("Error al cargar las categorías. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [clubId, API_BASE]); // Dependencias: clubId y API_BASE

    if (loading) {
        return <div className="text-center py-4 text-gray-500">Cargando categorías...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">Error: {error}</div>;
    }

    if (categories.length === 0) {
        return <div className="text-center py-4 text-gray-600">No se encontraron categorías para este club.</div>;
    }

    return (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-inner mt-6">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
                Categorías del Club {clubId} {/* Podrías mostrar el nombre del club si lo obtienes */}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)} // Pasa el ID de la categoría
                        className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out text-center font-medium text-gray-800 border border-transparent hover:border-blue-500"
                    >
                        {category.attributes.nombre}
                    </button>
                ))}
            </div>
            {/* El botón "Volver al Inicio" se gestionaría con el MobileNavBar o un botón de navegación explícito */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => navigate('/')} // Navega a la raíz para "Volver al Inicio"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 text-sm"
                >
                    Volver a Clubes
                </button>
            </div>
        </div>
    );
}

export default Categories;