// src/components/GlobalCategoriesList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GlobalCategoriesList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE;

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}api/categorias`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.data) {
                    // Sort by nombre for display consistency
                    const sortedCategories = data.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    setCategories(sortedCategories);
                } else {
                    setCategories([]);
                }
            } catch (e) {
                console.error("Error fetching global categories:", e);
                setError("Error al cargar las categorías globales.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [API_BASE]);

    if (loading) return <div className="text-center py-4">Cargando categorías...</div>;
    if (error) return <div className="text-center text-red-600 py-4">{error}</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h2 className="text-2xl font-semibold text-blue-900 mb-6 text-center">
                Seleccionar Categoría para Ranking Global
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => navigate(`/global-ranking/categories/${category.documentId}`)}
                            className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out text-center font-medium text-gray-800 border border-transparent hover:border-blue-500"
                        >
                            {category.nombre}
                        </button>
                    ))
                ) : (
                    <p className="px-6 py-4 text-center text-sm text-gray-600 col-span-full">No se encontraron categorías globales.</p>
                )}
            </div>
            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 text-sm"
                >
                    Volver a Clubes
                </button>
            </div>
        </div>
    );
}

export default GlobalCategoriesList;