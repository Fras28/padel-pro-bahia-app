// src/components/SkeletonRankingTable.jsx
import React from 'react';

const SkeletonRankingTable = () => {
    return (
        <div className="bg-white rounded-xl shadow-md p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md mb-4 w-1/3 mx-auto"></div>
            {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 py-3 border-b border-gray-100">
                    {/* Rank */}
                    <div className="flex-none w-12 h-6 bg-gray-200 rounded-md"></div>
                    {/* Club Logo */}
                    <div className="flex-none w-8 h-8 bg-gray-200 rounded-full"></div>
                    {/* Jugador Name */}
                    <div className="flex-grow h-6 bg-gray-200 rounded-md"></div>
                    {/* Pts */}
                    <div className="flex-none w-16 h-6 bg-gray-200 rounded-md"></div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonRankingTable;