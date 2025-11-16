import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Logo from "../../assets/LogoPPR.png";

// IMÁGENES ESTÁTICAS CORREGIDAS
import bgHero1 from "../../assets/bgHero.png"; // Fondo estático del Hero
import historicalImage from "../../assets/Historia/historia2.jpg"; // Imagen estática para "Sobre Nosotros"

// Componente para animación de conteo de números (Sin cambios)
const NumberCounter = ({ target, duration = 2000 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(target, 10);
    const increment = end / (duration / 10);
    const timer = setInterval(() => {
      start += increment;
      setCount(Math.floor(start));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, 10);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}</span>;
};

// Función para iconos (Sin cambios)
const Icon = ({ name, className }) => {
  let svgPath = '';
  switch (name) {
    case 'CalendarCheck':
      svgPath = 'M21 4V2h-3v2H8V2H5v2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM4 6h16v2H4V6zm16 14H4V10h16v10zM9 14l2 2 4-4';
      break;
    case 'LineChart':
      svgPath = 'M3 3v18h18M18 10l-4 4-2-2-6 6';
      break;
    case 'Wallet':
      svgPath = 'M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M10 7h4M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z';
      break;
    case 'Rocket':
      svgPath = 'M15 13l2 2m5-7-2-2M15 2h-2v2h2v-2zM4 14v2h2v-2H4zm14 0v2h2v-2h-2zM12 2a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1zM5 7a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2H5zM9 13v2h2v-2H9zm4 0v2h2v-2h-2z';
      break;
    case 'UserCog2':
      svgPath = 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 4 4 4 4 0 0 0-4-4zM19.7 17.3l-1.4 1.4a2 2 0 0 1-2.8 0l-1.4-1.4a2 2 0 0 1 0-2.8l1.4-1.4a2 2 0 0 1 2.8 0l1.4 1.4a2 2 0 0 1 0 2.8zM21 12a1 1 0 0 0-2 0 1 1 0 0 0 2 0zM17 19a1 1 0 0 0 0-2 1 1 0 0 0 0 2z';
      break;
    case 'Heart':
      svgPath = 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
      break;
    case 'Mail':
      svgPath = 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6';
      break;
    case 'Phone':
      svgPath = 'M22 16.92v3.06a2 2 0 0 1-2.22 2 15.08 15.08 0 0 1-13.6-13.6A2 2 0 0 1 4.02 2H7.08a2 2 0 0 1 2 1.73A14.07 14.07 0 0 0 10.4 7a1 1 0 0 1-.22 1.58l-1.8 1.8a12.9 12.9 0 0 0 6.64 6.64l1.8-1.8A1 1 0 0 1 17 13.6a14.07 14.07 0 0 0 3.26 1.32A2 2 0 0 1 22 16.92z';
      break;
    case 'Instagram':
      svgPath = 'M18 2h-12a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4zM12 17.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM18.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z';
      break;
    case 'Trophy':
      svgPath = 'M6 9H4V2h2v7zm14 0h-2V2h2v7zm-8 4H10l2 7 2-7zm-4-4h2V2h-2v7zm8 0h2V2h-2v7zM12 21l-3-3H6a2 2 0 0 1-2-2v-4h16v4a2 2 0 0 1-2 2h-3l-3 3z';
      break;
    case 'Users2':
      svgPath = 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 4 4 4 4 0 0 0-4-4zM22 16c0-1.5-.5-2.8-1.4-3.8A4 4 0 0 0 18 10a4 4 0 0 0-1.6 3.2 4 4 0 0 0-1.4 3.8h7zm-4-9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
      break;
    default:
      svgPath = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';
      break;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={svgPath} />
    </svg>
  );
};

const LandingPagePadelPro = () => {
  // Lógica de estado y efecto del carrusel eliminada.
  
  // Clase CSS para el fondo estático del Hero (restaurada)
  const styles = `
    :root {
      --color-primary: #1D4ED8; /* Azul oscuro/deportivo */
      --color-secondary: #FBBF24; /* Amarillo brillante */
      --color-dark: #0F172A; /* Slate 900 */
    }
    .text-dark {
      color: var(--color-dark);
    }
    .bg-dark {
      background-color: var(--color-dark);
    }
    .text-primary {
      color: var(--color-primary);
    }
    .bg-primary {
      background-color: var(--color-primary);
    }
    .text-secondary {
      color: var(--color-secondary);
    }
    .bg-secondary {
      background-color: var(--color-secondary);
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8f8f8; /* Fondo claro general */
    }
    .bg-hero {
      background-color: var(--color-dark);
      /* Usamos la imagen estática bgHero1.jpg con un overlay */
      background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgHero1}); 
      background-size: cover;
      background-position: center;
    }
  `;

  // Variants para animaciones generales (Sin cambios)
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <>
      <style>{styles}</style>

      {/* Header (sin cambios) */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2">
              <img src={Logo} alt="Logo" width="40px" />
              <a href="#" className="text-2xl font-extrabold text-dark tracking-tight hover:text-primary transition">Padel Pro Ranking</a>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6 font-medium text-gray-600">
            <a href="#solucion" className="hover:text-primary transition">Solución Integral</a>
            <a href="#numeros" className="hover:text-primary transition">Nuestros Números</a>
            <a href="#beneficios" className="hover:text-primary transition">Beneficios Clubes</a>
            <a href="#about-us" className="hover:text-primary transition">Sobre Nosotros</a>
          </nav>
          <a href="https://www.padelproranking.com" target="_blank" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105">
            Iniciar Ahora
          </a>
        </div>
      </header>

      <main>
        {/* Hero Restaurado a Fondo Estático */}
        <motion.section
          className="bg-hero text-white text-center py-20 md:py-32" // Clase bg-hero restaurada
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.h1
              className="text-4xl sm:text-6xl font-extrabold mb-4 leading-tight"
              variants={cardVariants}
            >
              <span className="text-secondary">Padel Pro Ranking:</span> La Plataforma Definitiva para la Gestión de Torneos.
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl font-light mb-8 opacity-90"
              variants={cardVariants}
            >
              Optimizá la administración de tu club, brindá rankings y estadísticas en tiempo real, y <span className="font-semibold">elevá la experiencia de tus jugadores al siguiente nivel.</span>
            </motion.p>
            <motion.a
              href="https://www.padelproranking.com"
              target="_blank"
              className="inline-block px-10 py-4 bg-secondary text-dark font-bold text-lg rounded-full shadow-2xl hover:bg-yellow-400 transition duration-300 transform hover:-translate-y-1 hover:shadow-yellow-500/50"
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
            >
              ¡Llevá tu Gestión al Profesionalismo!
            </motion.a>
          </div>
        </motion.section>

        {/* Sección Solución Integral (sin cambios) */}
        <motion.section
          id="solucion"
          className="py-16 md:py-24 bg-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-dark"
              variants={cardVariants}
            >
              Una <span className="text-primary">Solución Integral</span> para tu Club
            </motion.h2>
            <motion.p
              className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto"
              variants={cardVariants}
            >
              Cubrimos cada aspecto de la administración de torneos: desde el registro hasta la publicación de resultados y estadísticas.
            </motion.p>

            <motion.div
              className="grid md:grid-cols-4 gap-8"
              variants={staggerContainer}
            >
              {/* Característica 1 */}
              <motion.div variants={cardVariants} className="p-6 bg-gray-50 rounded-xl shadow-lg border-t-4 border-primary hover:shadow-xl transition duration-300">
                <Icon name="CalendarCheck" className="text-5xl text-primary mx-auto mb-4 h-12 w-12 stroke-1" />
                <h3 className="text-xl font-bold mb-3 text-dark">Gestión Total de Torneos</h3>
                <p className="text-gray-600 text-sm">Creación de cuadros, control de partidos, y asignación de horarios de forma rápida y automatizada.</p>
              </motion.div>

              {/* Característica 2 */}
              <motion.div variants={cardVariants} className="p-6 bg-gray-50 rounded-xl shadow-lg border-t-4 border-secondary hover:shadow-xl transition duration-300">
                <Icon name="Trophy" className="text-5xl text-secondary mx-auto mb-4 h-12 w-12 stroke-1" />
                <h3 className="text-xl font-bold mb-3 text-dark">Ranking Automático</h3>
                <p className="text-gray-600 text-sm">Actualización inmediata y transparente del ranking de jugadores tras cada partido. ¡Cero errores manuales!</p>
              </motion.div>

              {/* Característica 3 */}
              <motion.div variants={cardVariants} className="p-6 bg-gray-50 rounded-xl shadow-lg border-t-4 border-primary hover:shadow-xl transition duration-300">
                <Icon name="LineChart" className="text-5xl text-primary mx-auto mb-4 h-12 w-12 stroke-1" />
                <h3 className="text-xl font-bold mb-3 text-dark">Estadísticas Detalladas</h3>
                <p className="text-gray-600 text-sm">Visualizá el rendimiento, la progresión de categorías y el historial de partidos para jugadores y clubes.</p>
              </motion.div>

              {/* Característica 4 */}
              <motion.div variants={cardVariants} className="p-6 bg-gray-50 rounded-xl shadow-lg border-t-4 border-secondary hover:shadow-xl transition duration-300">
                <Icon name="Users2" className="text-5xl text-secondary mx-auto mb-4 h-12 w-12 stroke-1" />
                <h3 className="text-xl font-bold mb-3 text-dark">Registro y Notificación Pro</h3>
                <p className="text-gray-600 text-sm">Sistema de inscripción sencillo para jugadores y notificaciones automáticas (horarios, resultados, cambios).</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* SECCIÓN SOBRE NOSOTROS (UX/UI Mejorado y con Imagen Estática) */}
        <motion.section
          id="about-us"
          className="py-16 md:py-24 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl sm:text-4xl font-extrabold text-center mb-12 text-dark"
              variants={cardVariants}
            >
              Nuestra Historia: Aprendiendo de la Lección de los '90
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Columna 1: Narrativa */}
              <motion.div variants={staggerContainer} className="space-y-6 text-left">
                
                <motion.p
                  className="text-xl text-gray-700 font-medium"
                  variants={cardVariants}
                >
                  Padel Pro Ranking no nació de la nada. **Nació de la experiencia, aquí en Bahía Blanca.** Recordamos el *boom* del pádel en los años 90: canchas llenas, entusiasmo desbordado y una generación que dio grandes figuras al deporte.
                </motion.p>
                
                {/* CAJA DE ÉNFASIS PARA EL PROBLEMA (UX/UI Mejorado) */}
                <motion.div 
                  variants={cardVariants} 
                  className="bg-red-50 border-l-4 border-red-500 p-6 shadow-md"
                >
                  <p className="text-xl font-bold text-red-700 mb-2">
                    El Declive: Un Error que No Se Repite.
                  </p>
                  <p className="text-lg text-gray-800 italic">
                    "El pádel fue tratado como un **negocio fácil antes que como un deporte**." La falta de una **gestión seria**, el pobre seguimiento al jugador (*el semillero*), y la ausencia de rankings y estadísticas profesionales desincentivaron la competencia.
                  </p>
                </motion.div>
                
                <motion.p
                  className="text-xl text-gray-700"
                  variants={cardVariants}
                >
                  El jugador no tenía un espejo profesional donde verse, y la *fiebre* se apagó abruptamente en la región.
                </motion.p>

                {/* SEPARADOR Y MISIÓN (UX/UI Mejorado) */}
                <motion.div variants={cardVariants} className="pt-6 border-t border-gray-300 mt-6">
                     <p className="text-3xl font-extrabold text-primary flex items-center space-x-3">
                        <Icon name="Rocket" className="h-8 w-8 text-secondary stroke-2" />
                        <span><span className="text-secondary">Nuestra Misión:</span> Profesionalización Total.</span>
                     </p>
                </motion.div>
                
                <motion.p
                  className="text-xl text-gray-700"
                  variants={cardVariants}
                >
                  Hoy, Padel Pro Ranking ofrece la plataforma integral que faltó en esa época: **profesionalización total.** Brindamos a clubes y jugadores rankings automáticos, estadísticas transparentes y un seguimiento digital que convierte la pasión por el pádel en una carrera deportiva sostenible.
                </motion.p>
              </motion.div>

              {/* Columna 2: Imagen Histórica Estática */}
              <motion.div 
                className="relative p-4 md:p-8 bg-dark rounded-xl shadow-2xl"
                variants={cardVariants}
              >
                <img 
                  src={historicalImage} 
                  alt="Cancha de pádel antigua de los 90s en Bahía Blanca" 
                  className="w-full h-auto object-cover rounded-lg transform rotate-1 transition duration-500 ease-in-out hover:rotate-0 hover:scale-[1.02]"
                />
                <div className="absolute top-2 left-4 text-xs font-bold text-secondary bg-dark/70 px-2 py-1 rounded-sm shadow-md italic">
                    Bahía Blanca, Años '90
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
        {/* FIN SECCIÓN SOBRE NOSOTROS */}

        {/* Sección Nuestros Números (sin cambios) */}
        <motion.section
          id="numeros"
          className="py-16 md:py-24 bg-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              className="text-3xl sm:text-4xl font-extrabold mb-12 text-dark"
              variants={cardVariants}
            >
              Nuestros Números
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
            >
              <motion.div variants={cardVariants} className="p-6 bg-gray-100 rounded-lg shadow-lg">
                <h3 className="text-4xl font-bold text-primary"><NumberCounter target="600" />+</h3>
                <p className="text-gray-600">Jugadores Activos</p>
              </motion.div>
              <motion.div variants={cardVariants} className="p-6 bg-gray-100 rounded-lg shadow-lg">
                <h3 className="text-4xl font-bold text-primary"><NumberCounter target="50" />+</h3>
                <p className="text-gray-600">Torneos Gestionados</p>
              </motion.div>
              <motion.div variants={cardVariants} className="p-6 bg-gray-100 rounded-lg shadow-lg">
                <h3 className="text-4xl font-bold text-primary"><NumberCounter target="4" />+</h3>
                <p className="text-gray-600">Clubes Asociados</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Beneficios con stagger y scale (sin cambios) */}
        <motion.section
          id="beneficios"
          className="py-16 md:py-24 bg-gray-100"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl sm:text-4xl font-extrabold text-center mb-12 text-dark"
              variants={cardVariants}
            >
              Beneficios Estratégicos: Convierte la Gestión en Ganancia Neta
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div
                className="space-y-6"
                variants={staggerContainer}
              >
                <motion.div variants={cardVariants} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-xl border-l-4 border-green-600">
                  <Icon name="Wallet" className="text-3xl text-green-600 mt-1 h-8 w-8 stroke-2" />
                  <div>
                    <h4 className="text-xl font-bold text-dark">¡Ingreso Neto Comprobado! (Modelo Ganar-Ganar)</h4>
                    <p className="text-gray-600">
                      Padel Pro Ranking no es un gasto, es una inversión que se autosustenta...
                    </p>
                  </div>
                </motion.div>
                {/* Repite motion.div para cada beneficio */}
                <motion.div variants={cardVariants} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-xl border-l-4 border-primary">
                  <Icon name="Rocket" className="text-3xl text-primary mt-1 h-8 w-8 stroke-2" />
                  <div>
                    <h4 className="text-xl font-bold text-dark">Posicionamiento de Marca y Profesionalismo</h4>
                    <p className="text-gray-600">
                      Asociá tu club con la **innovación y tecnología**...
                    </p>
                  </div>
                </motion.div>
                <motion.div variants={cardVariants} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-xl border-l-4 border-secondary">
                  <Icon name="UserCog2" className="text-3xl text-secondary mt-1 h-8 w-8 stroke-2" />
                  <div>
                    <h4 className="text-xl font-bold text-dark">Acceso a un Público Hiper-Segmentado</h4>
                    <p className="text-gray-600">
                      Conectá con jugadores de pádel activos...
                    </p>
                  </div>
                </motion.div>
                <motion.div variants={cardVariants} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-xl border-l-4 border-red-500">
                  <Icon name="Heart" className="text-3xl text-red-500 mt-1 h-8 w-8 stroke-2" />
                  <div>
                    <h4 className="text-xl font-bold text-dark">Fidelización y Experiencia del Jugador</h4>
                    <p className="text-gray-600">
                      La facilidad de inscripción...
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden rounded-xl shadow-2xl"
                variants={cardVariants}
              >
                <img src="https://placehold.co/600x400/1D4ED8/FFFFFF?text=Tu+Gestion+Sin+Complicaciones" alt="Panel Administrativo" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-primary bg-opacity-80 flex flex-col justify-center items-center p-6 text-center">
                  <h4 className="text-3xl font-bold text-white mb-4">¡Dejá de Gestionar, Empezá a Liderar!</h4>
                  <p className="text-lg text-white mb-6 font-light">Contactanos hoy mismo por WhatsApp...</p>
                  <a href="https://wa.me/5492915729501" target="_blank" className="px-8 py-3 bg-secondary text-dark font-bold rounded-full hover:bg-yellow-400 transition duration-300 transform hover:scale-105">
                    Contactar por WhatsApp
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer (sin cambios) */}
      <motion.footer
    className="bg-dark text-white py-12"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={sectionVariants}
>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* grid-cols-1 para mobile (apilado y centrado) | md:grid-cols-3 para desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-700 pb-8 mb-8 space-y-8 md:space-y-0">
            
            {/* Columna 1: Info Empresa */}
            <div className="text-center md:text-left">
                <h5 className="text-xl font-bold text-secondary mb-3">Padel Pro Ranking</h5>
                <p className="text-gray-400 text-sm">Innovación y profesionalismo en la gestión de torneos de pádel en Argentina.</p>
            </div>
            
            {/* Columna 2: Explorar */}
            <div className="text-center md:text-left">
                <h5 className="text-lg font-bold mb-3">Explorar</h5>
                <ul className="space-y-2 text-sm"> 
                    <li><a href="#about-us" className="text-gray-400 hover:text-white transition">Sobre Nosotros</a></li>
                    <li><a href="#solucion" className="text-gray-400 hover:text-white transition">Características</a></li>
                    <li><a href="#numeros" className="text-gray-400 hover:text-white transition">Estadísticas</a></li>
                    <li><a href="https://www.padelproranking.com" target="_blank" className="text-gray-400 hover:text-white transition">Ayuda / FAQ</a></li>
                </ul>
            </div>
            
            {/* Columna 3: Contacto */}
            <div className="text-center md:text-left">
                <h5 className="text-lg font-bold mb-3">Contacto</h5>
                {/* justify-center centra el contenido flex en mobile */}
                <p className="text-gray-400 text-sm flex items-center justify-center md:justify-start">
                    <Icon name="Mail" className="h-4 w-4 mr-2 stroke-2" /> info@padelproranking.com
                </p>
                <p className="text-gray-400 text-sm flex items-center justify-center md:justify-start">
                    <Icon name="Phone" className="h-4 w-4 mr-2 stroke-2" /> +54 9 291 5729501
                </p>
                <p className="text-gray-400 text-sm mt-3">¡Seguinos en redes!</p>
                <div className="flex space-x-4 mt-2 justify-center md:justify-start">
                    <a href="https://www.instagram.com/padelproranking/" target="_blank" className="text-gray-400 hover:text-white transition"><Icon name="Instagram" className="text-xl h-6 w-6 stroke-2" /></a>
                </div>
            </div>
        </div>
        <div className="text-center text-sm text-gray-500">
            &copy; 2024 Padel Pro Ranking. Todos los derechos reservados.
        </div>
    </div>
</motion.footer>
    </>
  );
};

export default LandingPagePadelPro;