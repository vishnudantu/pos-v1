import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Grievances from './pages/Grievances';
import Constituency from './pages/Constituency';
import Events from './pages/Events';
import Appointments from './pages/Appointments';
import Voters from './pages/Voters';
import SentimentDashboard from './pages/SentimentDashboard';
import OmniScan from './pages/OmniScan';
import MorningBrief from './pages/MorningBrief';
import OppositionTracker from './pages/OppositionTracker';
import SuperAdmin from './pages/SuperAdmin';
import Login from './pages/Login';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="grievances" element={<Grievances />} />
          <Route path="constituency" element={<Constituency />} />
          <Route path="events" element={<Events />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="voters" element={<Voters />} />
          <Route path="sentiment" element={<SentimentDashboard />} />
          <Route path="omniscan" element={<OmniScan />} />
          <Route path="morning-brief" element={<MorningBrief />} />
          <Route path="opposition" element={<OppositionTracker />} />
          <Route path="superadmin" element={<SuperAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
