// src/App.jsx
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import Clubs from './components/Clubs'; // Ruta correcta para src/components/Clubs.jsx
import RankingGlobal from './components/RankingGlobal'; // Ruta correcta para src/components/RankingGlobal.jsx
import Categories from './components/Categories'; // Ruta correcta para src/components/Categories.jsx
import InternalRanking from './components/InternalRanking'; // Ruta correcta para src/components/InternalRanking.jsx
import Tournaments from './components/Tournaments'; // Nuevo componente
import './index.css'; // Ruta correcta para src/index.css

// Main App component for Padel Pro Bahia
function App() {
    // Console log para depuración inicial: Verifica si el componente App se renderiza
    console.log("App component is rendering.");

    // Firebase states (initialization and auth)
    const [firebaseInstances, setFirebaseInstances] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // View management states
    // 'home': Shows Clubs and Global Ranking. Categories are hidden.
    // 'categories': Shows Clubs, Categories (for selected club), and Global Ranking. Internal Ranking is hidden.
    // 'internalRanking': Shows Clubs, Categories (for selected club), and Internal Ranking. Global Ranking is hidden.
    // 'tournaments': Shows only Tournaments list. All other sections are hidden.
    const [currentView, setCurrentView] = useState('home'); 

    // Data states for selected items
    const [selectedClub, setSelectedClub] = useState(null); 
    const [selectedCategory, setSelectedCategory] = useState(null); 

    // Effect to initialize Firebase and handle authentication
    useEffect(() => {
        const initializeFirebaseAndAuth = async () => {
            try {
                const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

                const app = initializeApp(firebaseConfig, appId);
                const auth = getAuth(app);
                const db = null; 

                setFirebaseInstances({ app, auth, db });

                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        console.log("User authenticated:", user.uid);
                    } else {
                        if (typeof __initial_auth_token === 'undefined') {
                            await signInAnonymously(auth);
                            console.log("Signed in anonymously.");
                        } else {
                            try {
                                await signInWithCustomToken(auth, __initial_auth_token);
                                console.log("Signed in with custom token.");
                            } catch (error) {
                                console.error("Error signing in with custom token:", error);
                                await signInAnonymously(auth);
                                console.log("Signed in anonymously as fallback.");
                            }
                        }
                    }
                    setIsAuthReady(true);
                });

                if (typeof __initial_auth_token !== 'undefined') {
                    await signInWithCustomToken(auth, __initial_auth_token);
                }

            } catch (error) {
                console.error("Error initializing Firebase or authentication:", error);
                setIsAuthReady(true);
            }
        };

        initializeFirebaseAndAuth();
    }, []); 

    // Handler when a club is selected: show categories and keep global ranking visible
    const handleClubSelect = (club) => {
        setSelectedClub(club);
        setSelectedCategory(null); // Clear any previously selected category
        setCurrentView('categories'); 
        console.log("Navigating to categories view for club:", club.nombre);
    };

    // Handler when a category is selected: show internal ranking, hide global ranking
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCurrentView('internalRanking'); 
        console.log("Navigating to internal ranking for category:", category.nombre);
    };

    // Handler to navigate to tournaments view
    const handleViewTournaments = () => {
        setCurrentView('tournaments');
        setSelectedClub(null); // Clear club/category selection when viewing tournaments
        setSelectedCategory(null);
        console.log("Navigating to tournaments view.");
    };

    // Handler to go back to the home view (Clubs + Global Ranking)
    const handleBackToHome = () => {
        setSelectedClub(null);
        setSelectedCategory(null);
        setCurrentView('home');
        console.log("Navigating back to home view.");
    };

    // Handler to go back from internal ranking to categories view (Clubs + Categories + Global Ranking)
    const handleBackToCategories = () => {
        setSelectedCategory(null); 
        setCurrentView('categories'); 
        console.log("Navigating back to categories view.");
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center sm:py-12">
            {/* Contenido de prueba para depuración inicial: Si ves esto, App.jsx se está renderizando. */}
            <p className="text-xl text-blue-800 font-bold mb-4">¡App Padel Pro Bahía en funcionamiento!</p>

            <div className="relative py-3 w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-10 md:p-16 lg:p-20">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8 tracking-tight">
                        Padel Pro Bahía
                    </h1>

                    {/* Button to navigate to Tournaments view, always visible unless in tournaments view */}
                    {currentView !== 'tournaments' && (
                        <div className="mb-8 text-center">
                            <button
                                onClick={handleViewTournaments}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-300 transform hover:scale-105 font-bold"
                            >
                                Ver Torneos
                            </button>
                        </div>
                    )}

                    {currentView === 'tournaments' ? (
                        <>
                           <button
                                    onClick={handleBackToHome}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 font-bold"
                                >
                                    Volver a Inicio
                                </button>
                            <Tournaments />
                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleBackToHome}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 font-bold"
                                >
                                    Volver a Inicio
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Clubs component is always visible when not in 'tournaments' view */}
                            <div className="mb-8 sm:mb-12">
                                <Clubs onSelectClub={handleClubSelect} />
                            </div>

                            {/* Categories component visible when a club is selected AND NOT in internalRanking view */}
                            {(currentView === 'categories' || currentView === 'internalRanking') && selectedClub && (
                                <div className="mb-8 sm:mb-12">
                                    <Categories 
                                        club={selectedClub} 
                                        onSelectCategory={handleCategorySelect} 
                                        onBack={handleBackToHome} // This button in Categories now goes back to Home (clubs + global ranking)
                                    />
                                </div>
                            )}

                            {/* Conditionally render Global Ranking or Internal Ranking */}
                            {currentView !== 'internalRanking' ? (
                                // Show Global Ranking if no internal ranking is active
                                <div>
                                    <RankingGlobal />
                                </div>
                            ) : (
                                // Show Internal Ranking if a category is selected
                                selectedCategory && (
                                    <InternalRanking
                                        category={selectedCategory}
                                        onBack={handleBackToCategories} // This button in InternalRanking goes back to Categories
                                    />
                                )
                            )}

                            {/* Button to go back to Global Ranking (visible only when Internal Ranking is shown) */}
                             {currentView === 'internalRanking' && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={handleBackToHome} // Directly back to global view
                                        className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 font-bold"
                                    >
                                        Volver al Ranking Global
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
