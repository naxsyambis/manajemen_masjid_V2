import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/home/Home';

const PublicApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Route lainnya dihapus sementara, tambahkan nanti jika diperlukan */}
      </Routes>
    </Router>
  );
};

export default PublicApp;