// src/components/LandingLayout.jsx
import React from 'react';

const LandingLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};

export default LandingLayout;