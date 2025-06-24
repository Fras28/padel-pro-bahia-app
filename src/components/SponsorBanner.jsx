// src/components/SponsorBanner.jsx
import React from 'react';

/**
 * Componente SponsorBanner para mostrar imágenes de patrocinadores.
 * Muestra una marquesina desplazable en todas las pantallas (escritorio y móvil/tableta).
 *
 * @param {object} props - Las propiedades del componente.
 * @param {Array<object>} props.sponsorImages - Un array de objetos, donde cada objeto tiene { src: string, url: string }.
 */
const SponsorBanner = ({ sponsorImages }) => {
    // Duplicar las imágenes para crear un efecto de desplazamiento continuo en la marquesina.
    // Se duplican tres veces para asegurar un bucle suave.
    const duplicatedImages = [...sponsorImages, ...sponsorImages, ...sponsorImages];

    return (
        <div className="mb-6">
            {/* Marquesina para todas las pantallas */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-4 rounded-lg shadow-inner overflow-hidden">
                {/* Estilos CSS específicos para la animación de la marquesina.
                    Se usa un <style jsx> para encapsular estos estilos dentro del componente. */}
                <style jsx>{`
                    /* Define la animación de desplazamiento de la marquesina */
                    @keyframes marquee {
                        0% { transform: translateX(0); } /* Comienza en la posición original */
                        100% { transform: translateX(-50%); } /* Se desplaza la mitad del contenido duplicado para un bucle */
                    }
                    /* Contenedor principal de la marquesina */
                    .marquee-container {
                        display: flex; /* Permite que los elementos se alineen horizontalmente */
                        width: fit-content; /* El ancho se ajusta al contenido */
                        animation: marquee 30s linear infinite; /* Aplica la animación: 30s de duración, lineal, infinito */
                        will-change: transform; /* Sugerencia al navegador para optimizar la animación */
                    }
                    /* Estilo para cada elemento de la marquesina (cada imagen) */
                    .marquee-item {
                        flex-shrink: 0; /* Evita que las imágenes se encojan */
                        margin-right: 2rem; /* Espaciado entre imágenes */
                    }
                    .marquee-item img {
                        height: 60px; /* Altura ajustada para ser visible en mobile y no tan grande en desktop */
                        width: auto; /* Mantiene la relación de aspecto */
                        object-fit: contain; /* Asegura que la imagen quepa dentro de sus dimensiones */
                        filter: grayscale(100%); /* Opcional: convierte los logos a escala de grises */
                        transition: filter 0.3s ease-in-out; /* Transición suave para el efecto hover */
                    }

                    /* Ajustes para pantallas pequeñas (móviles) */
                    @media (max-width: 768px) { /* Por ejemplo, hasta 768px para considerar móvil/tableta */
                        .marquee-item {
                            margin-right: 1rem; /* Menor espaciado en pantallas pequeñas */
                        }
                        .marquee-item img {
                            height: 40px; /* Altura más pequeña para pantallas móviles */
                        }
                        .marquee-container {
                            animation-duration: 20s; /* Animación más rápida en pantallas pequeñas */
                        }
                    }

                    .marquee-item img:hover {
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
                                    // Manejo de errores si la imagen no se carga
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x50/CCCCCC/666666?text=Error'; }}
                                    className="rounded-md"
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