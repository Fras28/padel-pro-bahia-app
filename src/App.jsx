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
import Profile from "./components/Auth/Profile"; // Importación del componente Profile
import EmailConfirmation from "./components/Auth/EmailConfirmation"; // Importa el nuevo componente de confirmación de email

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
        const db = null; // No se está utilizando Firestore en este punto en App.jsx, así que se deja como null.

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
        const storedJwt = localStorage.getItem("jwt"); // Obtener el JWT también
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
  }, []); // Se ejecuta solo una vez al montar el componente

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

  // Componente para la barra de navegación inferior (MobileNavBar - Default L-shaped)
  // const MobileNavBar = ({ user }) => {
  //   const navigate = useNavigate(); // Usa useNavigate directamente aquí

  //   // Clases base para los botones pequeños
  //   const baseButtonClasses =
  //     "flex flex-col items-center justify-center p-3 mb-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full shadow-md text-white transition duration-300 text-xs w-20 h-20 flex-shrink-0";
  //   // Clases para el texto de los botones pequeños
  //   const baseTextClasses = "whitespace-nowrap";

  //   return (
  //     // Contenedor principal para la barra en forma de L, fijado en la esquina inferior derecha
  //     <div className="fixed bottom-0 right-0 z-50 p-4 flex flex-col items-end">
  //       {/* Parte vertical de la L (botones apilados) */}
  //       <button
  //         onClick={() => navigate("/tournaments")}
  //         className={baseButtonClasses}
  //       >
  //         <FontAwesomeIcon icon={faTrophy} className="text-lg" />
  //         <span className={baseTextClasses}>Torneos</span>
  //       </button>
  //       <button
  //         onClick={() => navigate("/players")}
  //         className={baseButtonClasses}
  //       >
  //         <FontAwesomeIcon icon={faUsers} className="text-lg" />
  //         <span className={baseTextClasses}>Jugadores</span>
  //       </button>

  //       {/* Parte horizontal de la L (botones en fila, con Inicio en el centro y más grande) */}
  //       <div className="flex items-end justify-end space-x-2">
  //         <button
  //           onClick={() => navigate("/current-matches")}
  //           className={`${baseButtonClasses} mb-0`}
  //         >
  //           {/* SVG para el icono de partidos */}
  //           <svg
  //             fill="currentColor"
  //             width="25px"
  //             height="25px"
  //             viewBox="0 0 24 24"
  //             version="1.1"
  //             xml:space="preserve"
  //             xmlns="http://www.w3.org/2000/svg"
  //             xmlns:xlink="http://www.w3.org/1999/xlink"
  //           >
  //             <g id="Guides" />
  //             <g id="_x32_0" />
  //             <g id="_x31_9" />
  //             <g id="_x31_8" />
  //             <g id="_x31_7" />
  //             <g id="_x31_6" />
  //             <g id="_x31_5" />
  //             <g id="_x31_4" />
  //             <g id="_x31_3" />
  //             <g id="_x31_2" />
  //             <g id="_x31_1" />
  //             <g id="_x31_0" />
  //             <g id="_x30_9" />
  //             <g id="_x30_8" />
  //             <g id="_x30_7" />
  //             <g id="_x30_6" />
  //             <g id="_x30_5" />
  //             <g id="_x30_4" />
  //             <g id="_x30_3" />
  //             <g id="_x30_2" />
  //             <g id="_x30_1">
  //               <path d="M19.7802124,5.7133098c-0.2210693-0.2739258-0.4575806-0.5372925-0.7089233-0.7886353   c-1.953186-1.9531863-4.6278687-3.0106204-7.3812256-2.9090579c-0.0794678,0.0026245-0.1583862-0.0037231-0.237915,0.0008545   C8.9912109,2.1473305,6.6738281,3.1795571,4.9287109,4.9246745S2.1513672,8.987174,2.0214844,11.4432287   c-0.0203857,0.354248-0.0216675,0.7076416-0.0043945,1.0587769c0.1036987,2.1073608,0.8760376,4.1328745,2.2026978,5.7766123   c0.2210693,0.2739258,0.4575806,0.5372925,0.7089233,0.7886353c1.8759766,1.8759766,4.4199219,2.9238281,7.0507813,2.9238281   c0.0006104,0,0.0012817-0.000061,0.0018921-0.000061c0.0003662,0,0.0006714,0.000061,0.0010376,0.000061   c0.0165405,0,0.0332031-0.0014038,0.0497437-0.0014648c0.171875-0.0007935,0.343811-0.0043945,0.515686-0.0141602   c2.4609375-0.1308594,4.7783203-1.1630859,6.5234375-2.9082031s2.7773438-4.062501,2.9072266-6.5185556   c0.0203857-0.354248,0.0216675,0.7076416-0.0043945,1.0587769C21.8792114,9.3825598,21.1068115,7.3570476,19.7802124,5.7133098z    M12.6691284,4.033134c0.1068115,0.0088501,0.2131348,0.0213013,0.3192749,0.0343628   c0.1431885,0.0176392,0.2857056,0.0384521,0.4273682,0.0637817c0.1075439,0.0192871,0.2145996,0.0407104,0.321106,0.0643311   c0.1383667,0.0306396,0.2755127,0.0655518,0.4118652,0.1035156c0.1057129,0.0294189,0.2111206,0.0596313,0.3154297,0.0933228   c0.1347046,0.0435181,0.267395,0.0924072,0.3995361,0.1430054c0.1018677,0.0390015,0.2038574,0.0774536,0.3040771,0.1206055   c0.1317749,0.0567627,0.2606812,0.1199951,0.3893433,0.1838379c0.0958252,0.0475464,0.1925049,0.0932007,0.286438,0.1445923   c0.1312866,0.0718994,0.2584229,0.1513062,0.3857422,0.2305908c0.0856934,0.0533447,0.1731567,0.1035767,0.256897,0.1602173   c0.1380615,0.0934448,0.2704468,0.1957397,0.402832,0.2979736c0.0673828,0.052002,0.1375732,0.0997925,0.2034302,0.1541138   c0.1951904,0.1610107,0.3842163,0.3308105,0.5647583,0.5113525c0.1885986,0.1887207,0.3646851,0.3873901,0.5320435,0.5921021   c0.0523682,0.0640869,0.0993042,0.131897,0.1495361,0.1973877c0.1107178,0.1442871,0.218811,0.2901611,0.3190308,0.4411011   c0.0534668,0.0805664,0.1027832,0.1634521,0.1532593,0.2457275c0.0874634,0.1427612,0.1714478,0.287231,0.2496338,0.434875   c0.0466919,0.0881348,0.0914307,0.1772461,0.1347656,0.2670288c0.0726929,0.1506958,0.1397705,0.303772,0.2028809,0.4586182   c0.0360107,0.0883789,0.0726318,0.1763916,0.1054688,0.2659912c0.0622559,0.170105,0.1162109,0.3430176,0.1668091,0.5170898   c0.0223389,0.0769043,0.0480957,0.15271,0.0681763,0.2303467c0.0641479,0.2483521,0.1184692,0.4996338,0.1585083,0.7539673   c0.0006104,0.0039063,0.001709,0.0077515,0.0023193,0.0116577c0.0378418,0.243042,0.0599976,0.4890137,0.0752563,0.7358398   c-1.9275513-0.1203613-3.7643433-0.9401855-5.1467896-2.3226318c-1.3814697-1.3814692-2.2009277-3.2166743-2.3222046-5.1427608   C12.5602417,4.0284343,12.6149292,4.0286784,12.6691284,4.033134z M10.8726196,19.9094772   c-0.1361694-0.0192261-0.2705078-0.0460815-0.4052734-0.0722656c-0.1483765-0.0288086-0.2971191-0.0561523-0.4432983-0.0932617   c-0.1254272-0.0319214-0.2483521-0.0722046-0.3720093-0.1101074c-0.1240234-0.0380249-0.2481079-0.0755615-0.3700562-0.1195679   c-0.1223145-0.0440674-0.2423706-0.093689-0.3623657-0.1437378c-0.1217041-0.0508423-0.2424927-0.1035767-0.3616333-0.1604004   c-0.1130981-0.053833-0.2249756-0.1102295-0.3355103-0.1693726c-0.125-0.0670166-0.2475586-0.1385498-0.3690186-0.2122803   c-0.098999-0.0599976-0.1982422-0.1194458-0.2947388-0.1838379c-0.1374512-0.0918579-0.2703247-0.19104-0.4023438-0.291626   c-0.0750122-0.0571289-0.1522217-0.1108398-0.2253418-0.1707153c-0.203186-0.1665649-0.4006958-0.3415527-0.5882568-0.5291138   c-0.1887817-0.1888428-0.3649292-0.3876953-0.5323486-0.5925293c-0.0519409-0.0635376-0.0983276-0.1306152-0.1481934-0.1955566   c-0.1110229-0.1447144-0.2195435-0.2911987-0.3200684-0.4425659c-0.0534058-0.0804443-0.1027222-0.163208-0.1530762-0.2454224   c-0.0876465-0.1430664-0.171875-0.2879038-0.2501831-0.435853c-0.0463867-0.0877075-0.0909424-0.1762085-0.1340332-0.2654419   c-0.072876-0.151062-0.1401367-0.3045654-0.2033691-0.4597778c-0.0359497-0.0881958-0.0725708-0.1761475-0.1053467-0.265564   c-0.062439-0.170105-0.1165771-0.3442993-0.1672974-0.5189819c-0.0220947-0.0761108-0.0476685-0.151123-0.0675049-0.2279053   c-0.06427-0.2486572-0.1186523-0.5001831-0.1586914-0.7547607c-0.0006104-0.0038452-0.001709-0.0076294-0.0023193-0.0115356   c-0.0378418-0.243042-0.0599976-0.4890137-0.0752563,0.7358398c1.9275513,0.1203613,3.7642822,0.9401855,5.1467285,2.3226318   c1.3829346,1.3829355,2.2029419,3.2204599,2.322876,5.1488657C11.2859497,19.9602585,11.0786133,19.9384079,10.8726196,19.9094772z    M17.6572266,17.6531906c-1.1448975,1.144104-2.5994263,1.897644-4.1729736,2.1919556   c-0.1506348-2.4103394-1.1702271-4.7070322-2.8983154-6.4351206c-1.7283325-1.7283325-4.0211182-2.7578735-6.4342651-2.9025269   C4.4457397,8.9372473,5.1990356,7.4832683,6.3427734,6.338737c1.1448975-1.144104,2.5994873-1.897644,4.1729736-2.1919556   c0.1506348,2.4103394,1.1702271,4.7070308,2.8983154,6.4351192c1.7285156,1.7285156,4.0255737,2.7426758,6.4360962,2.8931885   C19.5574341,15.0489416,18.8032227,16.5064011,17.6572266,17.6531906z" />
  //             </g>
  //           </svg>
  //           <span className={baseTextClasses}>Partidos</span>
  //         </button>
  //         {/* Botón de Inicio más grande y en el centro de la "L" */}
  //         <button
  //           onClick={() => navigate("/")}
  //           className="flex flex-col items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg text-white transition duration-300 text-sm font-bold scale-110 w-24 h-24" // Aumentado el tamaño del botón de inicio
  //         >
  //           <FontAwesomeIcon icon={faHome} className="text-xl" />
  //           <span className={baseTextClasses}>Inicio</span>
  //         </button>
  //         {/* Botón de Perfil/Login */}
  //         {user ? (
  //           <button
  //             onClick={() => navigate("/profile")} // Redirige al perfil si está logueado
  //             className={`${baseButtonClasses} mb-0`}
  //           >
  //             <FontAwesomeIcon icon={faUserCircle} className="text-lg" />
  //             <span className={baseTextClasses}>
  //               {user.jugador?.nombre.split(" ")[0] ||
  //                 user.username.split(" ")[0]}{" "}
  //               {/* Muestra nombre del jugador o username */}
  //             </span>
  //           </button>
  //         ) : (
  //           <button
  //             onClick={() => navigate("/login")} // Redirige directamente al login
  //             className={`${baseButtonClasses} mb-0`}
  //           >
  //             <FontAwesomeIcon icon={faSignInAlt} className="text-lg" />
  //             <span className={baseTextClasses}>Entrar</span>
  //           </button>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  // // Componente para la barra de navegación inferior (MobileNavBarAlt - Horizontal)
  // const MobileNavBarAlt = ({ user }) => {
  //   const navigate = useNavigate(); // Usa useNavigate directamente aquí

  //   return (
  //     <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-3 z-50 flex justify-around items-center border-t border-gray-200">
  //       <button
  //         onClick={() => navigate("/")}
  //         className="flex flex-col items-center bg-slate-100 text-gray-700 hover:text-blue-900 transition duration-300 text-xs"
  //       >
  //         <FontAwesomeIcon icon={faHome} className="text-lg mb-1" />
  //         Inicio
  //       </button>
  //       <button
  //         onClick={() => navigate("/tournaments")}
  //         className="flex flex-col items-center bg-slate-100 text-gray-700 hover:text-blue-900 transition duration-300 text-xs"
  //       >
  //         <FontAwesomeIcon icon={faTrophy} className="text-lg mb-1" />
  //         Torneos
  //       </button>
  //       <button
  //         onClick={() => navigate("/players")}
  //         className="flex flex-col items-center bg-slate-100 text-gray-700 hover:text-blue-900 transition duration-300 text-xs"
  //       >
  //         <FontAwesomeIcon icon={faUsers} className="text-lg mb-1" />
  //         Jugadores
  //       </button>
  //       <button
  //         onClick={() => navigate("/current-matches")}
  //         className="flex flex-col items-center bg-slate-100 text-gray-700 hover:text-blue-900 transition duration-300 text-xs"
  //       >
  //         <img width={20} src={Pelota} alt="Pelota" />
  //         Partidos
  //       </button>
  //       {/* El botón de Ayuda se ha movido fuera de la barra de navegación */}
  //       {user ? (
  //         <button
  //           onClick={() => navigate("/profile")} // Redirige al perfil si está logueado
  //           className="flex flex-col items-center bg-slate-100 text-gray-700 hover:text-blue-900 transition duration-300 text-xs"
  //         >
  //           <FontAwesomeIcon icon={faUserCircle} className="text-lg mb-1" />
  //           {user.jugador?.nombre.split(" ")[0] ||
  //             user.username.split(" ")[0]}{" "}
  //           {/* Muestra nombre del jugador o username */}
  //         </button>
  //       ) : (
  //         <button
  //           onClick={() => navigate("/login")} // Redirige directamente al login
  //           className="flex flex-col items-center bg-slate-100 text-gray-700 hover:text-blue-900 transition duration-300 text-xs"
  //         >
  //           <FontAwesomeIcon icon={faSignInAlt} className="text-lg mb-1" />
  //           Entrar
  //         </button>
  //       )}
  //     </div>
  //   );
  // };

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
      {" "}
      {/* Fragmento para envolver el contenido */}
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
            <p className="text-xl text-blue-900 font-bold mb-4">
              Ranking Bahia Blanca
            </p>

            <Routes>
              {" "}
              {/* Routes debe estar dentro de Router */}
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
              {/* Profile ya no recibe onLogout directamente */}
              <Route
                path="/profile"
                element={
                  <Profile API_BASE={API_BASE} user={user} setUser={setUser} />
                }
              />
              {/* Nueva ruta para la confirmación de email */}
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
      {/* Botón de Ayuda flotante */}
      <div className="fixed bottom-24 right-4 z-50">
        {" "}
        {/* Ajusta 'bottom' para que esté encima del nav */}
        <button
          onClick={() => navigate("/help")}
          className="flex flex-col items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg text-white transition duration-300 text-xs w-12 h-12 opacity-80"
        >
          <FontAwesomeIcon icon={faQuestionCircle} className="text-lg" />
          <span className="whitespace-nowrap">Ayuda</span>
        </button>
      </div>
      <MobileNavBarAlt user={user} />
      <Footer />
    </>
  );
}

export default App;
