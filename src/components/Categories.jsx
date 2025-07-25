// src/components/Categories.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Categories() {
    const { clubId } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [clubData, setClubData] = useState(null);
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
                    setClubData(clubDataRes.data[0]);
                } else {
                    setError("Club no encontrado.");
                    setLoading(false);
                    return;
                }

                // 2. Fetch Ranking Categories for the specific club
                // We populate 'categoria' to get category details
                const rankingCategoriesResponse = await fetch(
                    `${API_BASE}api/ranking-categorias?populate=categoria&filters[club][documentId][$eq]=${clubId}`
                );
                if (!rankingCategoriesResponse.ok) {
                    throw new Error(`HTTP error! status: ${rankingCategoriesResponse.status} fetching ranking categories`);
                }
                const rankingCategoriesData = await rankingCategoriesResponse.json();

                // Extract unique categories from the ranking_categorias entries
                const uniqueCategories = [];
                const seenCategoryIds = new Set();

                rankingCategoriesData.data.forEach(rc => {
                    if (rc.categoria && !seenCategoryIds.has(rc.categoria.id)) {
                        uniqueCategories.push({
                            id: rc.categoria.id,
                            documentId: rc.categoria.documentId, // Assuming 'documentId' is the correct ID to use for navigation
                            nombre: rc.categoria.nombre,
                            // Add other category properties if needed
                        });
                        seenCategoryIds.add(rc.categoria.id);
                    }
                });

                // Sort categories by nombre for consistent display (optional)
                uniqueCategories.sort((a, b) => a.nombre.localeCompare(b.nombre));

                setCategories(uniqueCategories);

            } catch (e) {
                console.error("Error fetching club or categories:", e);
                setError("Error al cargar las categorías del club. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchClubAndCategories();
    }, [API_BASE, clubId]);

    if (loading) {
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