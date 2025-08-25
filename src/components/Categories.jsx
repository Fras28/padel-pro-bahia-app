// src/components/Categories.jsx
import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoriesByClub, clearCategories } from '../features/categories/categoriesSlice'; // <-- Importa la nueva acción

function Categories() {
    const { clubId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { clubData, categories, loading, error } = useSelector(state => state.categories);

    const handleCategoryClick = useCallback((categoryId) => {
        navigate(`/clubs/${clubId}/categories/${categoryId}/ranking`);
    }, [clubId, navigate]);

    useEffect(() => {
        // Dispara la acción cada vez que el clubId cambia
        if (clubId) {
            // Limpia el estado antes de cada nueva carga
            dispatch(clearCategories()); 
            dispatch(fetchCategoriesByClub(clubId));
        }
    }, [clubId, dispatch]);

    if (loading === 'pending') {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-blue-500 text-lg">Cargando categorías...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                <p>{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
                >
                    Volver a Clubes
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h2 className="text-2xl font-semibold text-blue-900 mb-6 flex items-center justify-center">
                {clubData?.logo?.url && (
                    <img
                        src={clubData.logo.url}
                        alt={`Logo de ${clubData.nombre}`}
                        className="w-10 h-10 rounded-full mr-3 object-cover bg-black p-0.5"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/40x40?text=Club";
                        }}
                    />
                )}
                Categorías de {clubData?.nombre}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.documentId)}
                            className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transform transition-all duration-300 ease-in-out text-center font-medium text-gray-800 border border-transparent hover:border-blue-500"
                        >
                            {category?.nombre}
                        </button>
                    ))
                ) : (
                    <p className="px-6 py-4 text-center text-sm text-gray-600 col-span-full">No se encontraron categorías de ranking para este club.</p>
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