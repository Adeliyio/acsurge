import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UXImprovementDemo from './UXImprovementDemo';

/**
 * Demo routes for testing UX improvements
 * Access via /demo/ux-improvements
 */
const DemoRoutes = () => {
  return (
    <Routes>
      <Route path="/ux-improvements" element={<UXImprovementDemo />} />
    </Routes>
  );
};

export default DemoRoutes;
