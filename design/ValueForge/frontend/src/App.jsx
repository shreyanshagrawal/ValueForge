import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import ScanProgress from "@/pages/ScanProgress";
import MisalignmentRiskFlags from "@/pages/MisalignmentRiskFlags";
import AuthenticClaimTerritory from "@/pages/AuthenticClaimTerritory";
import BrandBriefPreview from "@/pages/BrandBriefPreview";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><ScanProgress /></Layout>} />
          <Route path="/risk-flags" element={<Layout><MisalignmentRiskFlags /></Layout>} />
          <Route path="/claim-territory" element={<Layout><AuthenticClaimTerritory /></Layout>} />
          <Route path="/brand-brief" element={<Layout><BrandBriefPreview /></Layout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
