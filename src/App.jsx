// src/App.jsx
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import { Routes, Route, Link, useNavigate, NavLink } from "react-router-dom";

// Importaciones de Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTrophy,
  faUsers,
  faVolleyballBall,
  faQuestionCircle,
  faSignInAlt, // Icono para iniciar sesión
  faUserCircle, // Icono para el perfil de usuario (nuevo)
  faLightbulb, // <-- ¡NUEVA IMPORTACIÓN PARA SUGERENCIAS!
} from "@fortawesome/free-solid-svg-icons";

// Componentes de la aplicación
import Clubs from "./components/Clubs";
import RankingGlobal from "./components/RankingGlobal";
import Categories from "./components/Categories";
import InternalRanking from "./components/InternalRanking";
import Tournaments from "./components/Tournaments";
import TournamentMatches from "./components/TournamentMatches";
import AllPlayers from "./components/AllPlayers";
import CurrentMatches from "./components/CurrentMatches";
import SponsorBanner from "./components/SponsorBanner";
import Help from "./components/Help";

import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";

// Nuevos componentes de autenticación
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Profile from "./components/Auth/Profile"; 
import EmailConfirmation from "./components/Auth/EmailConfirmation"; 

// Componente Modal de Sugerencias
import FeedbackModal from "./components/FeedbackModal"; // <-- ¡NUEVA IMPORTACIÓN!

// Archivos CSS
import "./index.css";
import "./App.css";

// Imágenes de patrocinadores
import Dternera from "./assets/DeTernera.png";
import DonAlf from "./assets/donalf.jpg";
import Morton from "./assets/morton.png";
import Rucca from "./assets/ruca.png";
import PadelPro from "./assets/PadelProArg.png";
import CreatePair from "./components/CreatePair";
import MobileNavBarAlt from "./components/NavBar/MobileNavBarAlt";
import PrivacyPolicy from "./components/Auth/PrivacyPolicy";

// Componente principal de la aplicación
function App() {
  console.log("App component is rendering.");

  const [firebaseInstances, setFirebaseInstances] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAltNavBarActive, setIsAltNavBarActive] = useState(false);
  const [user, setUser] = useState(null); // Estado para el usuario autenticado (Strapi)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false); // <-- ¡NUEVO ESTADO PARA LA MODAL!
  const navigate = useNavigate(); // Hook useNavigate para usar en App

  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const API_BASE =
    import.meta.env.VITE_API_BASE ;

  const sponsorImages = [
    { src: Dternera, url: "https://www.deternera.com.ar/", blurred: false },
    {
      src: DonAlf,
      url: "https://www.instagram.com/donalfredocentro/",
      blurred: false,
    },
    { src: Morton, url: "https://www.morton.com.ar/", blurred: false },
    { src: Rucca, url: "https://www.ruccabahia.com/", blurred: false },
  ];

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
          measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = null; 

        setFirebaseInstances({ app, auth, db });

        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            console.log("Firebase User authenticated:", firebaseUser.uid);
          } else {
            if (!import.meta.env.VITE_INITIAL_AUTH_TOKEN) {
              await signInAnonymously(auth);
              console.log("Signed in anonymously with Firebase.");
            } else {
              try {
                await signInWithCustomToken(
                  auth,
                  import.meta.env.VITE_INITIAL_AUTH_TOKEN
                );
                console.log("Signed in with custom token with Firebase.");
              } catch (error) {
                console.error(
                  "Error signing in with custom token with Firebase:",
                  error
                );
                await signInAnonymously(auth);
                console.log("Signed in anonymously as fallback with Firebase.");
              }
            }
          }
          setIsAuthReady(true);
        });

        // Cargar usuario de Strapi si existe en localStorage
        const storedUser = localStorage.getItem("user");
        const storedJwt = localStorage.getItem("jwt"); 
        if (storedUser && storedJwt) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("App.jsx: User found in localStorage:", parsedUser);
            console.log(
              "App.jsx: JWT found in localStorage (first 10 chars):",
              storedJwt.substring(0, 10) + "..."
            );

            // Fetch the user again with populate to get the latest player data
            const userResponse = await fetch(
              `${API_BASE}api/users/me?populate[jugador][populate]=*`,
              {
                headers: {
                  Authorization: `Bearer ${storedJwt}`,
                },
              }
            );
            const userData = await userResponse.json();
            if (userResponse.ok) {
              setUser(userData);
              console.log(
                "App.jsx: Populated user data fetched successfully:",
                userData
              );
            } else {
              console.error(
                "App.jsx: Error fetching populated user data:",
                userResponse.status,
                userData.error?.message
              );
              localStorage.removeItem("jwt");
              localStorage.removeItem("user");
              setUser(null);
            }
          } catch (e) {
            console.error(
              "App.jsx: Error parsing stored user or fetching populated data:",
              e
            );
            localStorage.removeItem("user"); // Clear corrupted data
            localStorage.removeItem("jwt");
            setUser(null);
          }
        } else {
          console.log(
            "App.jsx: No user or JWT found in localStorage on initial load."
          );
        }

        if (import.meta.env.VITE_INITIAL_AUTH_TOKEN) {
          await signInWithCustomToken(
            auth,
            import.meta.env.VITE_INITIAL_AUTH_TOKEN
          );
        }
      } catch (error) {
        console.error(
          "App.jsx: Error initializing Firebase or authentication:",
          error
        );
        setIsAuthReady(true);
      }
    };

    initializeFirebaseAndAuth();
  }, []); 

  // Función para manejar el éxito del login de Strapi
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    console.log("App.jsx: Login successful, user set:", loggedInUser);
    const jwt = localStorage.getItem("jwt");
    console.log(
      "App.jsx: JWT after login (first 10 chars):",
      jwt
        ? jwt.substring(0, 10) + "..."
        : "No JWT found immediately after login"
    );
    navigate("/profile"); // Redirigir al perfil después del login exitoso
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-lg text-gray-700">
          Cargando autenticación...
        </div>
      </div>
    );
  }

  // Function to handle the "secret switch" (double-click on PadelPro logo)
  const handleLogoDoubleClick = () => {
    setIsAltNavBarActive((prevState) => !prevState);
    console.log(
      "MobileNavBar toggled:",
      !isAltNavBarActive ? "Alt" : "Default"
    );
  };

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center sm:py-12 pb-20">
        <div className="relative py-3 w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-yellow-600 to-yellow-300 shadow-lg transform skew-y-6 sm:skew-y-0 sm:-rotate-3 sm:rounded-3xl"></div>

          <div className="relative bg-white shadow-lg sm:rounded-3xl p-4 sm:p-8">
            <SponsorBanner sponsorImages={sponsorImages} />
            <div className="flex justify-center">
              <NavLink to="/" onDoubleClick={handleLogoDoubleClick}>
                <img src={PadelPro} alt="Pelota" width="108px" />
              </NavLink>
            </div>
            <p className="text-xl text-blue-900 font-bold mb-4 mt-3">
              Ranking Bahia Blanca
            </p>

            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Clubs onSelectClub={setSelectedClub} />
                    <RankingGlobal />
                  </>
                }
              />
              <Route
                path="/clubs/:clubId/categories"
                element={<Categories />}
              />
              <Route
                path="/clubs/:clubId/categories/:categoryId/ranking"
                element={<InternalRanking />}
              />
              <Route
                path="/global-ranking/categories/:categoryId"
                element={<RankingGlobal />}
              />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route
                path="/tournaments/:tournamentId/matches"
                element={<TournamentMatches API_BASE={API_BASE} />}
              />
              <Route path="/players" element={<AllPlayers />} />
              <Route
                path="/current-matches"
                element={<CurrentMatches API_BASE={API_BASE} />}
              />
              <Route path="/help" element={<Help />} />
              {/* Rutas de autenticación */}
              <Route
                path="/register"
                element={<Register API_BASE={API_BASE} />}
              />
              <Route
                path="/login"
                element={
                  <Login
                    API_BASE={API_BASE}
                    onLoginSuccess={handleLoginSuccess}
                  />
                }
              />
              <Route
                path="/forgot-password"
                element={<ForgotPassword API_BASE={API_BASE} />}
              />
              <Route
                path="/profile"
                element={
                  <Profile API_BASE={API_BASE} user={user} setUser={setUser} />
                }
              />
              <Route
                path="/confirm-email"
                element={<EmailConfirmation API_BASE={API_BASE} />}
              />
              {/* NEW ROUTE FOR CREATE PAIR */}
              <Route
                path="/create-pair"
                element={<CreatePair API_BASE={API_BASE} user={user} />}
              />
              <Route
                path="*"
                element={
                  <div className="text-center text-lg text-red-500">
                    Página no encontrada.
                  </div>
                }
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>
          </div>
        </div>
      </div>
      
      {/* Footer (Va en la parte inferior del contenido scrollable) */}
      <Footer />

      {/* Mobile NavBar (Va en bottom-0) */}
      <MobileNavBarAlt user={user} />
      
      {/* -----------------------------------------------------------------
        BOTONES FLOTANTES Y MODAL: Movidos al final para el correcto Z-INDEX 
        -----------------------------------------------------------------
      */}
      
      {/* Botón de SUGERENCIAS flotante (NUEVO) - bottom-48 */}
      <div className="fixed bottom-48 right-0 z-50 mr-4"> 
          <button
              onClick={() => setIsFeedbackModalOpen(true)} // <-- ACTIVA LA MODAL
              className="flex flex-col items-center justify-center p-3 bg-yellow-500 hover:bg-yellow-600 rounded-full shadow-lg text-white transition duration-300 text-xs w-12 h-12 opacity-90"
              title="¡Déjanos tu idea o sugerencia!"
          >
              <FontAwesomeIcon icon={faLightbulb} className="text-lg" />
          </button>
      </div>

      {/* Botón de Ayuda flotante (EXISTENTE) - bottom-36 */}
      <div className="fixed bottom-36 right-0 z-50 mr-4">
        <button
          onClick={() => navigate("/help")}
          className="flex flex-col items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg text-white transition duration-300 text-xs w-12 h-12 opacity-80"
          title="Ayuda / Preguntas Frecuentes"
        >
          <FontAwesomeIcon icon={faQuestionCircle} className="text-lg" />
        </button>
      </div>
      
      {/* MODAL: Último elemento para asegurar que esté sobre todo. */}
      <FeedbackModal 
          API_BASE={API_BASE}
          user={user}
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)} 
      />

    </>
  );
}

export default App;