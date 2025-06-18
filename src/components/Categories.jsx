// src/components/Categories.jsx
import React from 'react';

function Categories({ club, onSelectCategory, onBack }) {
    // Ensure categories are available and are an array
    const categories = club.categorias || [];
    console.log(`Categorías para ${club.nombre}:`, categories);

    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <button
                onClick={onBack}
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
            >
                &larr; Volver al Ranking Global
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
                Categorías de {club.nombre}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {categories.length > 0 ? (
                    categories.map(category => (
                        <button
                            key={category.id}
                            className="flex items-center justify-center p-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105 text-base sm:text-lg font-bold"
                            onClick={() => onSelectCategory(category)}
                        >
                            {category.nombre}
                        </button>
                    ))
                ) : (
                    <p className="text-center text-gray-600 col-span-full">No se encontraron categorías para este club.</p>
                )}
            </div>
        </div>
    );
}

export default Categories;
