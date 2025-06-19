// src/App.jsx
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import Clubs from './components/Clubs';
import RankingGlobal from './components/RankingGlobal';
import Categories from './components/Categories';
import InternalRanking from './components/InternalRanking';
import Tournaments from './components/Tournaments';
import TournamentMatches from './components/TournamentMatches'; // Import the new component
// Removed TournamentDetailModal import
import './index.css';

// Main App component for Padel Pro Bahia
function App() {
    console.log("App component is rendering.");

    // Firebase states (initialization and auth)
    const [firebaseInstances, setFirebaseInstances] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // View management states
    const [currentView, setCurrentView] = useState('home');

    // Data states for selected items
    const [selectedClub, setSelectedClub] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTournament, setSelectedTournament] = useState(null); // State for selected tournament

    // Effect to initialize Firebase and handle authentication
    useEffect(() => {
        const initializeFirebaseAndAuth = async () => {
            try {
                const firebaseConfig = {
                    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
                    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
                    appId: import.meta.env.VITE_FIREBASE_APP_ID,
                    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
                };

                const app = initializeApp(firebaseConfig);
                const auth = getAuth(app);
                const db = null; // Placeholder for Firestore if needed later

                setFirebaseInstances({ app, auth, db });

                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        console.log("User authenticated:", user.uid);
                    } else {
                        // Attempt anonymous sign-in if no custom token is provided
                        if (!import.meta.env.VITE_INITIAL_AUTH_TOKEN) {
                            await signInAnonymously(auth);
                            console.log("Signed in anonymously.");
                        } else {
                            try {
                                await signInWithCustomToken(auth, import.meta.env.VITE_INITIAL_AUTH_TOKEN);
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

                // If a custom token is provided, attempt to sign in with it immediately
                if (import.meta.env.VITE_INITIAL_AUTH_TOKEN) {
                    await signInWithCustomToken(auth, import.meta.env.VITE_INITIAL_AUTH_TOKEN);
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
        setSelectedTournament(null); // Clear selected tournament
        console.log("Navigating to tournaments view.");
    };

    // Handler to view matches for a specific tournament
    const handleViewMatches = (tournament) => {
        setSelectedTournament(tournament);
        setCurrentView('tournamentMatches');
        console.log("Navigating to matches for tournament:", tournament.nombre);
    };

    // Handler to go back to the home view (Clubs + Global Ranking)
    const handleBackToHome = () => {
        setSelectedClub(null);
        setSelectedCategory(null);
        setSelectedTournament(null);
        setCurrentView('home');
        console.log("Navigating back to home view.");
    };

    // Handler to go back from internal ranking to categories view (Clubs + Categories + Global Ranking)
    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setCurrentView('categories');
        console.log("Navigating back to categories view.");
    };

    // Handler to go back from tournament matches to the main tournaments list
    const handleBackToTournaments = () => {
        setSelectedTournament(null);
        setCurrentView('tournaments');
        console.log("Navigating back to tournaments list.");
    };

    // Conditional rendering based on authentication status and current view
    const renderContent = () => {
        if (!isAuthReady) {
            return (
                <div className="text-center text-lg text-gray-700">Cargando autenticación...</div>
            );
        }

        switch (currentView) {
            case 'home':
                return (
                    <>
                        <Clubs onSelectClub={handleClubSelect} />
                        <RankingGlobal onBack={handleBackToHome} />
                    </>
                );
            case 'categories':
                return (
                    <>
                        {selectedClub && (
                            <Categories
                                club={selectedClub}
                                onSelectCategory={handleCategorySelect}
                                onBack={handleBackToHome} // Go back to home (Clubs + Global)
                            />
                        )}
                        <RankingGlobal onBack={handleBackToHome} />
                    </>
                );
            case 'internalRanking':
                return (
                    <>
                        {selectedClub && selectedCategory && (
                            <InternalRanking
                                category={selectedCategory}
                                onBack={handleBackToCategories}
                            />
                        )}
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleBackToHome}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 font-bold"
                            >
                                Volver al Ranking Global
                            </button>
                        </div>
                    </>
                );
            case 'tournaments':
                return (
                    <Tournaments
                        onViewMatches={handleViewMatches} // Pass handler to view matches
                    />
                );
            case 'tournamentMatches':
                return (
                    selectedTournament && (
                        <TournamentMatches
                            tournament={selectedTournament} // Pass the entire tournament object
                            onBack={handleBackToTournaments}
                        />
                    )
                );
            default:
                return (
                    <div className="text-center text-lg text-red-500">Vista no reconocida.</div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center sm:py-12">
            <div className="relative py-3 w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
                <div className="relative bg-white shadow-lg sm:rounded-3xl p-4 sm:p-8">
            <p className="text-xl text-blue-800 font-bold mb-4">Ranking Padel Pro Bahia Blanca </p>
                    {/* Navigation Buttons at the top */}
                    <div className="mb-6 flex flex-wrap justify-center gap-4">
                        {currentView !== 'home' && (
                            <button
                                onClick={handleBackToHome}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 text-sm"
                            >
                                Inicio
                            </button>
                        )}
                        {currentView !== 'tournaments' && (
                            <button
                                onClick={handleViewTournaments}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 text-sm"
                            >
                                Ver Torneos
                            </button>
                        )}
                    </div>

                    {renderContent()}

                </div>
            </div>
        </div>
    );
}

export default App;