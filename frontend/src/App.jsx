import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InputForm from './pages/InputForm';
import FailureDashboard from './pages/FailureDashboard';
import WhitespaceGrid from './pages/WhitespaceGrid';
import AuthenticClaimTerritory from './pages/AuthenticClaimTerritory';
import ValuePropositions from './pages/ValuePropositions';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <header className="app-header">
          <h1 className="app-title">Value<span>Forge</span></h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<InputForm />} />
            <Route path="/scan/:scanId/failures" element={<FailureDashboard />} />
            <Route path="/scan/:scanId/grid" element={<WhitespaceGrid />} />
            <Route path="/scan/:scanId/territory" element={<AuthenticClaimTerritory />} />
            <Route path="/scan/:scanId/propositions" element={<ValuePropositions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
