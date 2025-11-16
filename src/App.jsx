// src/App.jsx
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";

// Componentes
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

// Auth
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Profile from "./components/Auth/Profile";
import EmailConfirmation from "./components/Auth/EmailConfirmation";

// Otros
import FeedbackModal from "./components/FeedbackModal";
import CreatePair from "./components/CreatePair";
import MobileNavBarAlt from "./components/NavBar/MobileNavBarAlt";
import PrivacyPolicy from "./components/Auth/PrivacyPolicy";

// Landing
import LandingPagePadelPro from "./components/LandingPage/LandingPagePadelPro";
import LandingLayout from "./components/LandingPage/LandingLayout";

// Assets
import PadelPro from "./assets/PadelProArg.png";
import Dternera from "./assets/DeTernera.png";
import DonAlf from "./assets/donalf.jpg";
import Morton from "./assets/morton.png";
import Rucca from "./assets/ruca.png";

// CSS
import "./index.css";
import "./App.css";

// LAYOUT PRINCIPAL DE LA APP (con diseño actual)
const AppLayout = ({ children, sponsorImages, handleLogoDoubleClick }) => {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center sm:py-12 pb-20">
      <div className="relative py-3 w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-yellow-600 to-yellow-300 shadow-lg transform skew-y-6 sm:skew-y-0 sm:-rotate-3 sm:rounded-3xl"></div>

        <div className="relative bg-white shadow-lg sm:rounded-3xl p-4 sm:p-8">
          <SponsorBanner sponsorImages={sponsorImages} />
          <div className="flex justify-center">
  <NavLink to="/" onDoubleClick={handleLogoDoubleClick}>
    <img src={PadelPro} alt="Padel Pro" width="108px" />
  </NavLink>
</div>

<h1 className="text-2xl md:text-3xl text-blue-900 font-bold mb-2 mt-3 text-center">
  Ranking Bahía Blanca
</h1>

{/* BOTÓN NUEVO: Ir a Landing Page */}
<div className="flex justify-center mt-4">
  <NavLink
    to="/LandingPage"
    className="inline-flex items-center px-6 py-3 bg-blue-400 text-black font-bold text-lg rounded-full shadow-lg  hover:bg-blue-800 transform hover:scale-105 transition duration-300 hover:text-white"
  >
    <span className="mr-2 ">Sobre nosotros</span>
  </NavLink>
</div>

          {children}
        </div>
      </div>

      <Footer />
      <MobileNavBarAlt />
    </div>
  );
};

// COMPONENTE PRINCIPAL
function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAltNavBarActive, setIsAltNavBarActive] = useState(false);
  const [user, setUser] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE;

  const sponsorImages = [
    { src: Dternera, url: "https://www.deternera.com.ar/", blurred: false },
    { src: DonAlf, url: "https://www.instagram.com/donalfredocentro/", blurred: false },
    { src: Morton, url: "https://www.morton.com.ar/", blurred: false },
    { src: Rucca, url: "https://www.ruccabahia.com/", blurred: false },
  ];

  // === FIREBASE & AUTH ===
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

        onAuthStateChanged(auth, async (firebaseUser) => {
          if (!firebaseUser) {
            if (!import.meta.env.VITE_INITIAL_AUTH_TOKEN) {
              await signInAnonymously(auth);
            } else {
              try {
                await signInWithCustomToken(auth, import.meta.env.VITE_INITIAL_AUTH_TOKEN);
              } catch {
                await signInAnonymously(auth);
              }
            }
          }
          setIsAuthReady(true);
        });

        // Cargar usuario de Strapi
        const storedUser = localStorage.getItem("user");
        const storedJwt = localStorage.getItem("jwt");
        if (storedUser && storedJwt) {
          try {
            const userResponse = await fetch(
              `${API_BASE}api/users/me?populate[jugador][populate]=*`,
              { headers: { Authorization: `Bearer ${storedJwt}` } }
            );
            const userData = await userResponse.json();
            if (userResponse.ok) setUser(userData);
            else throw new Error();
          } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("jwt");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Firebase init error:", error);
        setIsAuthReady(true);
      }
    };

    initializeFirebaseAndAuth();
  }, [API_BASE]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    navigate("/profile");
  };

  const handleLogoDoubleClick = () => {
    setIsAltNavBarActive((prev) => !prev);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-lg text-gray-700">Cargando autenticación...</div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* === LANDING PAGE: Pantalla completa, sin layout === */}
        <Route
          path="/LandingPage"
          element={
            <LandingLayout>
              <LandingPagePadelPro />
            </LandingLayout>
          }
        />

        {/* === TODAS LAS DEMÁS RUTAS: Dentro del layout de la app === */}
        <Route
          path="/*"
          element={
            <AppLayout
              sponsorImages={sponsorImages}
              handleLogoDoubleClick={handleLogoDoubleClick}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <Clubs />
                      <RankingGlobal />
                    </>
                  }
                />
                <Route path="/clubs/:clubId/categories" element={<Categories />} />
                <Route path="/clubs/:clubId/categories/:categoryId/ranking" element={<InternalRanking />} />
                <Route path="/global-ranking/categories/:categoryId" element={<RankingGlobal />} />
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/tournaments/:tournamentId/matches" element={<TournamentMatches API_BASE={API_BASE} />} />
                <Route path="/players" element={<AllPlayers />} />
                <Route path="/current-matches" element={<CurrentMatches API_BASE={API_BASE} />} />
                <Route path="/help" element={<Help />} />

                {/* Auth */}
                <Route path="/register" element={<Register API_BASE={API_BASE} />} />
                <Route path="/login" element={<Login API_BASE={API_BASE} onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/forgot-password" element={<ForgotPassword API_BASE={API_BASE} />} />
                <Route path="/profile" element={<Profile API_BASE={API_BASE} user={user} setUser={setUser} />} />
                <Route path="/confirm-email" element={<EmailConfirmation API_BASE={API_BASE} />} />
                <Route path="/create-pair" element={<CreatePair API_BASE={API_BASE} user={user} />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                <Route path="*" element={<div className="text-center text-red-500">Página no encontrada.</div>} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>

      {/* === BOTONES FLOTANTES: SOLO EN LA APP (no en landing) === */}
      {window.location.pathname !== "/LandingPage" && (
        <>
          {/* Sugerencias */}
          <div className="fixed bottom-48 right-0 z-50 mr-4">
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="flex items-center justify-center p-3 bg-yellow-500 hover:bg-yellow-600 rounded-full shadow-lg text-white transition w-12 h-12"
              title="Sugerencias"
            >
              <FontAwesomeIcon icon={faLightbulb} className="text-lg" />
            </button>
          </div>

          {/* Ayuda */}
          <div className="fixed bottom-36 right-0 z-50 mr-4">
            <button
              onClick={() => navigate("/help")}
              className="flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg text-white transition w-12 h-12"
              title="Ayuda"
            >
              <FontAwesomeIcon icon={faQuestionCircle} className="text-lg" />
            </button>
          </div>
        </>
      )}

      {/* === MODAL DE FEEDBACK === */}
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