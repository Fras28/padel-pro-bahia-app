// src/components/Categories.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Categories() {
    const { clubId } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE;

    const handleCategoryClick = useCallback((categoryId) => {
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
                // MODIFIED: Fetch from the 'api/categorias' endpoint, filtering by clubId
                const response = await fetch(`${API_BASE}api/categorias?filters[club][documentId][$eq]=${clubId}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Datos de categorías para club", clubId, ":", data.data); // Log data.data directly

                if (data.data && Array.isArray(data.data)) {
                    setCategories(data.data); // data.data should directly be the array of categories
                } else {
                    setCategories([]);
                }
                setLoading(false);
            } catch (e) {
                console.error("Error fetching categories:", e);
                setError("Error al cargar las categorías. Inténtalo de nuevo más tarde.");
                setLoading(false);
            }
        };
        fetchCategories();
    }, [API_BASE, clubId]);

    if (loading) {
        return (
            <div className="text-center py-4 text-gray-600">Cargando categorías...</div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-4 text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
                Categorías del Club {clubId}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.documentId)} // Pass documentId if routing by it
                            className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out text-center font-medium text-gray-800 border border-transparent hover:border-blue-500"
                        >
                            {category?.nombre}
                        </button>
                    ))
                ) : (
                    <p className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron categorías para este club.</p>
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

export default Categories;