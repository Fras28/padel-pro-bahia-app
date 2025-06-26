// src/components/Footer.jsx
import React from 'react';
import MortonLogo from '../assets/morton.png'; // Make sure this path is correct

const Footer = () => {
    return (
        <footer className="w-full bg-gray-800 text-white p-4 text-center mt-8 pb-24">
            <div className="container mx-auto flex flex-col items-center">
                <p className="text-sm mb-2">
                    Desarrollado por:
                </p>
                <a
                    href="https://morton-solutions.vercel.app/" // Replace with the actual Morton website if different
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 mb-2"
                >
                    <img src={MortonLogo} alt="Morton Desarrollos" className="h-10" /> {/* Adjust height as needed */}
                    <span className="text-lg font-bold">Morton Desarrollos</span>
                </a>
                <p className="text-xs text-gray-400">
                    © {new Date().getFullYear()} Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;