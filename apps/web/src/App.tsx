import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { LanguageProvider } from './lib/i18n';
import { AppShell } from './components/shell';
import { DashboardRouter } from './components/dashboard/DashboardRouter';

import Login from './pages/Login';
import PartyManager from './pages/PartyManager';
import Grievances from './pages/Grievances';
import Events from './pages/Events';
import Team from './pages/Team';
import Projects from './pages/Projects';
import Media from './pages/Media';
import Finance from './pages/Finance';
import Analytics from './pages/Analytics';
import Communication from './pages/Communication';
import Documents from './pages/Documents';
import Voters from './pages/Voters';
import Constituency from './pages/Constituency';
import Settings from './pages/Settings';
import Appointments from './pages/Appointments';
import Polls from './pages/Polls';
import Darshan from './pages/Darshan';
import Darshans from './pages/Darshans';
import AITraining from './pages/AITraining';
import Legislative from './pages/Legislative';
import CitizenEngagement from './pages/CitizenEngagement';
import Profile from './pages/Profile';
import Parliamentary from './pages/Parliamentary';
import PoliticalBriefing from './pages/PoliticalBriefing';
import SuperAdmin from './pages/SuperAdmin';
import AIStudio from './pages/AIStudio';
import StaffManagement from './pages/StaffManagement';
import OmniScan from './pages/OmniScan';
import MorningBrief from './pages/MorningBrief';
import SentimentDashboard from './pages/SentimentDashboard';
import OppositionTracker from './pages/OppositionTracker';
import VoiceIntelligence from './pages/VoiceIntelligence';
import QuickCapture from './pages/QuickCapture';
import WebsiteAdmin from './pages/WebsiteAdmin';
import BoothManagement from './pages/BoothManagement';
import PromisesTracker from './pages/PromisesTracker';
import ContentFactory from './pages/ContentFactory';
import WhatsAppIntelligence from './pages/WhatsAppIntelligence';
import SmartVisitPlanner from './pages/SmartVisitPlanner';
import PredictiveCrisis from './pages/PredictiveCrisis';
import AgentSystem from './pages/AgentSystem';
import DeepfakeShield from './pages/DeepfakeShield';
import CoalitionForecast from './pages/CoalitionForecast';
import CrisisWarRoom from './pages/CrisisWarRoom';
import RelationshipGraph from './pages/RelationshipGraph';
import EconomicIntelligence from './pages/EconomicIntelligence';
import CitizenServices from './pages/CitizenServices';
import ElectionCommandCenter from './pages/ElectionCommandCenter';
import FinancialCompliance from './pages/FinancialCompliance';
import PartyIntegration from './pages/PartyIntegration';
import DigitalTwin from './pages/DigitalTwin';

function AppContent() {
  const { user, loading } = useAuth() as any;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <div className="text-sm text-muted-foreground">Loading Nethra...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/morning-brief" element={<MorningBrief />} />
        <Route path="/ai-studio" element={<AIStudio />} />
        <Route path="/media" element={<Media />} />
        <Route path="/omniscan" element={<OmniScan />} />
        <Route path="/sentiment" element={<SentimentDashboard />} />
        <Route path="/narrative" element={<SentimentDashboard />} />
        <Route path="/grievances" element={<Grievances />} />
        <Route path="/events" element={<Events />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/voters" element={<Voters />} />
        <Route path="/booths" element={<BoothManagement />} />
        <Route path="/darshan" element={<Darshan />} />
        <Route path="/darshans" element={<Darshans />} />
        <Route path="/team" element={<Team />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/communication" element={<Communication />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/constituency" element={<Constituency />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/polls" element={<Polls />} />
        <Route path="/ai-training" element={<AITraining />} />
        <Route path="/legislative" element={<Legislative />} />
        <Route path="/citizen" element={<CitizenEngagement />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/parliamentary" element={<Parliamentary />} />
        <Route path="/briefing" element={<PoliticalBriefing />} />
        <Route path="/opposition" element={<OppositionTracker />} />
        <Route path="/voice-intelligence" element={<VoiceIntelligence />} />
        <Route path="/quick-capture" element={<QuickCapture />} />
        <Route path="/promises" element={<PromisesTracker />} />
        <Route path="/content-factory" element={<ContentFactory />} />
        <Route path="/whatsapp-intelligence" element={<WhatsAppIntelligence />} />
        <Route path="/smart-visit" element={<SmartVisitPlanner />} />
        <Route path="/predictive-crisis" element={<PredictiveCrisis />} />
        <Route path="/agent-system" element={<AgentSystem />} />
        <Route path="/deepfake-shield" element={<DeepfakeShield />} />
        <Route path="/coalition-forecast" element={<CoalitionForecast />} />
        <Route path="/crisis-war-room" element={<CrisisWarRoom />} />
        <Route path="/relationship-graph" element={<RelationshipGraph />} />
        <Route path="/economic-intelligence" element={<EconomicIntelligence />} />
        <Route path="/citizen-services" element={<CitizenServices />} />
        <Route path="/election-command" element={<ElectionCommandCenter />} />
        <Route path="/finance-compliance" element={<FinancialCompliance />} />
        <Route path="/party-integration" element={<PartyIntegration />} />
        <Route path="/digital-twin" element={<DigitalTwin />} />
        <Route path="/superadmin" element={<SuperAdmin onNavigate={() => {}} />} />
        <Route path="/website-admin" element={<WebsiteAdmin />} />
        <Route path="/party-manager" element={<PartyManager />} />
        <Route path="/staff-management" element={<StaffManagement />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
