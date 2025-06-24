// src/App.jsx
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import Clubs from "./components/Clubs";
import RankingGlobal from "./components/RankingGlobal";
import Categories from "./components/Categories";
import InternalRanking from "./components/InternalRanking";
import Tournaments from "./components/Tournaments";
import TournamentMatches from "./components/TournamentMatches";
import AllPlayers from "./components/AllPlayers";
import SponsorBanner from "./components/SponsorBanner"; // Importa el nuevo componente SponsorBanner
import "./index.css"; // Estilos globales, incluyendo directivas de Tailwind y estilos de fuente raíz
import "./App.css"; // Estilos específicos de la aplicación, crucialmente incluyendo el estilo #root
import Dternera from "./assets/DeTernera.png";
import DonAlf from "./assets/donalf.jpg";
import Morton from "./assets/morton.png";
import Rucca from "./assets/ruca.png";
import ENA from "./assets/ENA.avif";
import ADN from "./assets/ADN.png";
import PadelPro from "./assets/PadelProLogo.png";

// Componente principal de la aplicación para Padel Pro Bahia
function App() {
  console.log("App component is rendering.");

  // Estados de Firebase (inicialización y autenticación)
  const [firebaseInstances, setFirebaseInstances] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Estados para la gestión de vistas
  const [currentView, setCurrentView] = useState("home");

  // Estados de datos para elementos seleccionados
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);

  // Imágenes de patrocinadores de ejemplo para demostración.
  // Reemplaza estas URLs con las URLs reales de tus patrocinadores.
  const sponsorImages = [
    { src: Dternera, url: 'https://www.deternera.com.ar/' }, // Replace with actual URL
    { src: DonAlf, url: 'https://www.donalf.com.ar/' },       // Replace with actual URL
    { src: Morton, url: 'https://www.morton.com.ar/' },       // Replace with actual URL
    { src: Rucca, url: 'https://www.ruccabahia.com/' },         // Replace with actual URL
    { src: ENA, url: 'https://www.enasport.com/' },             // Replace with actual URL
    { src: ADN, url: 'https://www.adn.com.ar/' },             // Replace with actual URL
];
  // Efecto para inicializar Firebase y manejar la autenticación
  useEffect(() => {
    const initializeFirebaseAndAuth = async () => {
      try {
        // Configuración de Firebase obtenida de variables de entorno
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
          measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = null; // Marcador de posición para Firestore si se necesita más adelante

        setFirebaseInstances({ app, auth, db });

        // Escucha cambios en el estado de autenticación
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            console.log("User authenticated:", user.uid);
          } else {
            // Intenta iniciar sesión anónimamente si no se proporciona un token personalizado
            if (!import.meta.env.VITE_INITIAL_AUTH_TOKEN) {
              await signInAnonymously(auth);
              console.log("Signed in anonymously.");
            } else {
              try {
                await signInWithCustomToken(
                  auth,
                  import.meta.env.VITE_INITIAL_AUTH_TOKEN
                );
                console.log("Signed in with custom token.");
              } catch (error) {
                console.error("Error signing in with custom token:", error);
                await signInAnonymously(auth);
                console.log("Signed in anonymously as fallback.");
              }
            }
          }
          setIsAuthReady(true); // Marca la autenticación como lista
        });

        // Si se proporciona un token personalizado, intenta iniciar sesión con él inmediatamente
        if (import.meta.env.VITE_INITIAL_AUTH_TOKEN) {
          await signInWithCustomToken(
            auth,
            import.meta.env.VITE_INITIAL_AUTH_TOKEN
          );
        }
      } catch (error) {
        console.error("Error initializing Firebase or authentication:", error);
        setIsAuthReady(true); // Asegura que el estado esté listo incluso en caso de error
      }
    };

    initializeFirebaseAndAuth();
  }, []);

  // Manejador cuando se selecciona un club: muestra categorías y mantiene visible el ranking global
  const handleClubSelect = (club) => {
    setSelectedClub(club);
    setSelectedCategory(null); // Borra cualquier categoría seleccionada previamente
    setCurrentView("categories");
    console.log("Navigating to categories view for club:", club.nombre);
  };

  // Manejador cuando se selecciona una categoría: muestra el ranking interno, oculta el ranking global
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentView("internalRanking");
    console.log(
      "Navigating to internal ranking for category:",
      category.nombre
    );
  };

  // Manejador para navegar a la vista de torneos
  const handleViewTournaments = () => {
    setCurrentView("tournaments");
    setSelectedClub(null); // Borra la selección de club/categoría al ver torneos
    setSelectedCategory(null);
    setSelectedTournament(null); // Borra el torneo seleccionado
    console.log("Navigating to tournaments view.");
  };

  // Manejador para navegar a la vista de todos los jugadores
  const handleViewAllPlayers = () => {
    setCurrentView("allPlayers");
    setSelectedClub(null);
    setSelectedCategory(null);
    setSelectedTournament(null);
    console.log("Navigating to all players view.");
  };

  // Manejador para ver partidos de un torneo específico
  const handleViewMatches = (tournament) => {
    setSelectedTournament(tournament);
    setCurrentView("tournamentMatches");
    console.log("Navigating to matches for tournament:", tournament.nombre);
  };

  // Manejador para volver a la vista de inicio (Clubes + Ranking Global)
  const handleBackToHome = () => {
    setSelectedClub(null);
    setSelectedCategory(null);
    setSelectedTournament(null);
    setCurrentView("home");
    console.log("Navigating back to home view.");
  };

  // Manejador para volver del ranking interno a la vista de categorías (Clubes + Categorías + Ranking Global)
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCurrentView("categories");
    console.log("Navigating back to categories view.");
  };

  // Manejador para volver de los partidos del torneo a la lista principal de torneos
  const handleBackToTournaments = () => {
    setSelectedTournament(null);
    setCurrentView("tournaments");
    console.log("Navigating back to tournaments list.");
  };

  // Renderizado condicional basado en el estado de autenticación y la vista actual
  const renderContent = () => {
    if (!isAuthReady) {
      return (
        <div className="text-center text-lg text-gray-700">
          Cargando autenticación...
        </div>
      );
    }

    switch (currentView) {
      case "home":
        return (
          <>
            <Clubs onSelectClub={handleClubSelect} />
            <RankingGlobal onBack={handleBackToHome} />
          </>
        );
      case "categories":
        return (
          <>
            {selectedClub && (
              <Categories
                club={selectedClub}
                onSelectCategory={handleCategorySelect}
                onBack={handleBackToHome}
              />
            )}
            <RankingGlobal onBack={handleBackToHome} />
          </>
        );
      case "internalRanking":
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
      case "tournaments":
        return <Tournaments onViewMatches={handleViewMatches} />;
      case "tournamentMatches":
        return (
          selectedTournament && (
            <TournamentMatches
              tournament={selectedTournament}
              onBack={handleBackToTournaments}
            />
          )
        );
      case "allPlayers":
        return <AllPlayers />;
      default:
        return (
          <div className="text-center text-lg text-red-500">
            Vista no reconocida.
          </div>
        );
    }
  };

  return (
    // El div más externo maneja la altura completa del viewport y el fondo.
    // También usa flexbox para centrar su contenido, que es el contenedor principal de la tarjeta.
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center sm:py-12">
      {/* Este div es el contenedor principal de la tarjeta que tiene los anchos máximos responsivos específicos.
                'w-full' asegura que siempre ocupe todo el ancho disponible hasta el ancho máximo establecido por los breakpoints.
                'mx-auto' lo centra horizontalmente.
            */}
      <div className="relative py-3 w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Efecto de fondo decorativo inclinado */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-red-800 to-red-900 shadow-lg transform skew-y-6 sm:skew-y-0 sm:-rotate-3 sm:rounded-3xl"></div>


        {/* Tarjeta de contenido real con fondo blanco, sombra y relleno */}
        <div className="relative bg-white shadow-lg sm:rounded-3xl p-4 sm:p-8">
          {/* Banner de patrocinadores en la parte superior de la tarjeta de contenido principal */}
          <SponsorBanner sponsorImages={sponsorImages} />
          <div className="flex justify-center">
            <img src={PadelPro} alt="" width='108px'/>
          </div>
          <p className="text-xl text-blue-900 font-bold mb-4">
            Ranking Bahia Blanca
          </p>

          {/* Botones de navegación en la parte superior */}
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            {currentView !== "home" && (
              <button
                onClick={handleBackToHome}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 text-sm"
              >
                Inicio
              </button>
            )}
            {currentView !== "tournaments" && (
              <button
                onClick={handleViewTournaments}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 text-sm"
              >
                Ver Torneos
              </button>
            )}
            {currentView !== "allPlayers" && (
              <button
                onClick={handleViewAllPlayers}
                className="px-4 py-2 bg-red-700 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300 text-sm"
              >
                Ver Jugadores
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
