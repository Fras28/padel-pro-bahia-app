// src/components/SponsorBanner.jsx
import React from 'react';

/**
 * Componente SponsorBanner para mostrar imágenes de patrocinadores.
 * Muestra una marquesina desplazable en todas las pantallas (escritorio y móvil/tableta).
 *
 * @param {object} props - Las propiedades del componente.
 * @param {Array<object>} props.sponsorImages - Un array de objetos, donde cada objeto tiene
 * { src: string, url: string, blurred: boolean }.
 */
const SponsorBanner = ({ sponsorImages }) => {
    // Duplicar las imágenes para crear un efecto de desplazamiento continuo en la marquesina.
    // Se duplican tres veces para asegurar un bucle suave.
    const duplicatedImages = [...sponsorImages, ...sponsorImages, ...sponsorImages];

    return (
        <div className="mb-6">
            {/* Marquesina para todas las pantallas */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-4 rounded-lg shadow-inner overflow-hidden">
                {/* Estilos CSS específicos para la animación de la marquesina. */}
                <style jsx>{`
                    /* Define la animación de desplazamiento de la marquesina */
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    /* Contenedor principal de la marquesina */
                    .marquee-container {
                        display: flex;
                        width: fit-content;
                        animation: marquee 30s linear infinite;
                        will-change: transform;
                    }
                    /* Estilo para cada elemento de la marquesina (cada imagen) */
                    .marquee-item {
                        flex-shrink: 0;
                        margin-right: 2rem;
                    }
                    .marquee-item img {
                        height: 60px;
                        width: auto;
                        object-fit: contain;
                        filter: grayscale(100%); /* Opcional: convierte los logos a escala de grises */
                        transition: filter 0.3s ease-in-out; /* Transición suave para el efecto hover y blur */
                    }

                    /* Clase para aplicar el efecto de desenfoque */
                    .marquee-item img.blurred {
                        filter: blur(5px) grayscale(100%); /* Aplica blur y mantiene grayscale */
                    }
                    /* NOTA: Se ha eliminado la regla .marquee-item img.blurred:hover
                             para que el blur no se desactive con el hover. */


                    /* Ajustes para pantallas pequeñas (móviles) */
                    @media (max-width: 768px) {
                        .marquee-item {
                            margin-right: 1rem;
                        }
                        .marquee-item img {
                            height: 40px;
                        }
                        .marquee-container {
                            animation-duration: 20s;
                        }
                    }

                    .marquee-item img:hover:not(.blurred) { /* Solo aplica el hover si NO está blureado inicialmente */
                        filter: grayscale(0%); /* Vuelve al color original al pasar el ratón */
                    }
                `}</style>
                <div className="marquee-container">
                    {/* Renderiza las imágenes duplicadas para el efecto de marquesina */}
                    {duplicatedImages.map((sponsor, index) => (
                        <div key={index} className="marquee-item">
                            <a href={sponsor.url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={sponsor.src}
                                    alt={`Sponsor ${index}`}
                                    // Aplica la clase 'blurred' si sponsor.blurred es true
                                    className={`rounded-md ${sponsor.blurred ? 'blurred' : ''}`}
                                    // Manejo de errores si la imagen no se carga
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x50/CCCCCC/666666?text=Error'; }}
                                />
                            </a>
                        </div>
                    ))}
                    {/* Mensaje si no hay sponsors */}
                    {sponsorImages.length === 0 && (
                        <p className="flex-shrink-0 text-center text-gray-500 text-xs self-center ml-4">No hay sponsors disponibles en este momento.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SponsorBanner;