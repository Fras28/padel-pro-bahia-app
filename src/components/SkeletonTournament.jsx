// src/components/SkeletonTournament.jsx
import React from 'react';

const SkeletonTournament = () => {
    return (
        <div className="bg-gray-100 rounded-lg shadow-md p-6 animate-pulse">
            {/* Placeholder for the tournament image */}
            <div className="h-48 bg-gray-300 rounded-t-lg w-full mb-4"></div>
            {/* Placeholder for the tournament title */}
            <div className="h-6 bg-gray-300 rounded-md mb-2 w-3/4"></div>
            {/* Placeholder for the date */}
            <div className="h-4 bg-gray-300 rounded-md w-1/2"></div>
            {/* Placeholder for the "Ver Partidos" button */}
            <div className="h-10 bg-gray-300 rounded-lg w-full mt-4"></div>
        </div>
    );
};

export default SkeletonTournament;