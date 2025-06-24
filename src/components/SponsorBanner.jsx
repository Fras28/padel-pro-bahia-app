// src/components/SponsorBanner.jsx
import React from 'react';

/**
 * Componente SponsorBanner para mostrar imágenes de patrocinadores.
 * Muestra una marquesina desplazable en pantallas grandes (escritorio)
 * y una cuadrícula estática en pantallas pequeñas (móvil/tableta).
 *
 * @param {object} props - Las propiedades del componente.
 * @param {string[]} props.sponsorImages - Un array de URLs de imágenes de patrocinadores.
 */
const SponsorBanner = ({ sponsorImages }) => {
    // Duplicar las imágenes para crear un efecto de desplazamiento continuo en la marquesina de escritorio.
    // Se duplican tres veces para asegurar un bucle suave.
    const duplicatedImages = [...sponsorImages, ...sponsorImages, ...sponsorImages];

    return (
        <div className="mb-6">
            {/* Marquesina para escritorio (oculta en pantallas más pequeñas) */}
            <div className="hidden lg:block bg-gradient-to-r from-gray-100 to-gray-200 py-4 rounded-lg shadow-inner overflow-hidden">
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
                        height: 80px; /* Altura fija para los banners de escritorio */
                        width: auto; /* Mantiene la relación de aspecto */
                        object-fit: contain; /* Asegura que la imagen quepa dentro de sus dimensiones */
                        filter: grayscale(100%); /* Opcional: convierte los logos a escala de grises */
                        transition: filter 0.3s ease-in-out; /* Transición suave para el efecto hover */
                    }
                    .marquee-item img:hover {
                        filter: grayscale(0%); /* Vuelve al color original al pasar el ratón */
                    }
                `}</style>
                <div className="marquee-container">
                    {/* Renderiza las imágenes duplicadas para el efecto de marquesina */}
                    {duplicatedImages.map((src, index) => (
                        <div key={index} className="marquee-item">
                            <img
                                src={src}
                                alt={`Sponsor ${index}`}
                                // Manejo de errores si la imagen no se carga
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x80/CCCCCC/666666?text=Error'; }}
                                className="rounded-md"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Cuadrícula estática para móvil/tableta (oculta en pantallas grandes) */}
            <div className="lg:hidden bg-gradient-to-br from-blue-50 to-blue-100 py-4 px-2 rounded-lg shadow-inner">
                <p className="text-center text-sm font-semibold text-gray-700 mb-3">Nuestros Sponsors:</p>
                {/* Cuadrícula responsiva para mostrar las imágenes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center">
                    {sponsorImages.map((src, index) => (
                        <div key={index} className="flex items-center justify-center p-1 border border-gray-200 rounded-md bg-white shadow-sm">
                            <img
                                src={src}
                                alt={`Sponsor ${index}`}
                                // Manejo de errores si la imagen no se carga
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x50/CCCCCC/666666?text=Error'; }}
                                className="h-12 sm:h-16 w-auto object-contain"
                            />
                        </div>
                    ))}
                    {/* Mensaje si no hay sponsors */}
                    {sponsorImages.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 text-xs mt-2">No hay sponsors disponibles en este momento.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SponsorBanner;
