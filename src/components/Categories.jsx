// src/components/Categories.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Categories() {
    const { clubId } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [clubData, setClubData] = useState(null); // New state to store club details (name, logo)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE;

    const handleCategoryClick = useCallback((categoryId) => {
        navigate(`/clubs/${clubId}/categories/${categoryId}/ranking`);
    }, [clubId, navigate]);

    useEffect(() => {
        const fetchClubAndCategories = async () => {
            if (!clubId) {
                setError("No se ha proporcionado un ID de club en la URL.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 1. Fetch Club Details (including logo)
                const clubResponse = await fetch(`${API_BASE}api/clubs?filters[documentId][$eq]=${clubId}&populate=logo`);
                if (!clubResponse.ok) {
                    throw new Error(`HTTP error! status: ${clubResponse.status} fetching club data`);
                }
                const clubDataRes = await clubResponse.json();
                if (clubDataRes.data && clubDataRes.data.length > 0) {
                    setClubData(clubDataRes.data[0]); // Assuming the first item is the correct club
                } else {
                    setError("No se encontró información para el club.");
                }

                // 2. Fetch Categories for the Club
                const categoriesResponse = await fetch(`${API_BASE}api/categorias?filters[club][documentId][$eq]=${clubId}`);
                if (!categoriesResponse.ok) {
                    throw new Error(`HTTP error! status: ${categoriesResponse.status} fetching categories`);
                }
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData.data);

            } catch (e) {
                console.error("Error fetching data:", e);
                setError("Error al cargar la información del club o las categorías. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchClubAndCategories();
    }, [API_BASE, clubId]);

    if (loading) {
        return (
            <div className="text-center py-4 text-gray-600">
                Cargando categorías...
            </div>
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
            {/* Display Club Logo and Name */}
            <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-blue-200 pb-2 flex items-center justify-center sm:justify-start">
                {clubData?.logo?.url && (
                    <img
                        src={clubData.logo.url}
                        alt={`${clubData.nombre || 'Club'} Logo`}
                        className="h-10 w-10 mr-3 object-contain rounded-full bg-black"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/40x40?text=Club"; // Fallback image
                        }}
                    />
                )}
             Categorías
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.documentId)}
                            className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out text-center font-medium text-gray-800 border border-transparent hover:border-blue-500"
                        >
                            {category?.nombre}
                        </button>
                    ))
                ) : (
                    <p className="px-6 py-4 text-center text-sm text-gray-600 col-span-full">No se encontraron categorías para este club.</p>
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