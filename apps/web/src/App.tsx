import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { LanguageProvider } from './lib/i18n';
import { AppShell } from './components/shell';
import { DashboardRouter } from './components/dashboard/DashboardRouter';

// Founder control plane
import Parties from './pages/founder/Parties';
import Politicians from './pages/founder/Politicians';
import Constituencies from './pages/founder/Constituencies';
import FounderUsers from './pages/founder/Users';
import Roles from './pages/founder/Roles';
import FeatureMatrix from './pages/founder/FeatureMatrix';
import Subscriptions from './pages/founder/Subscriptions';
import Integrations from './pages/founder/Integrations';
import Exports from './pages/founder/Exports';
import SystemHealth from './pages/founder/SystemHealth';
import PublicWebsite from './pages/founder/PublicWebsite';
import PoliticalHealth from './pages/founder/PoliticalHealth';
import PlatformSettings from './pages/founder/PlatformSettings';
import DashboardDebug from './pages/founder/DashboardDebug';

// Operations modules
import Grievances from './pages/Grievances';
import Events from './pages/Events';
import Appointments from './pages/Appointments';
import Voters from './pages/Voters';
import BoothManagement from './pages/BoothManagement';
import Darshan from './pages/Darshan';
import Darshans from './pages/Darshans';

// Intelligence modules
import MorningBrief from './pages/MorningBrief';
import AIStudio from './pages/AIStudio';
import Media from './pages/Media';
import OmniScan from './pages/OmniScan';
import SentimentDashboard from './pages/SentimentDashboard';
import PoliticalBriefing from './pages/PoliticalBriefing';

// Ground modules
import WhatsAppIntelligence from './pages/WhatsAppIntelligence';
import QuickCapture from './pages/QuickCapture';

// Auth & account
import Login from './pages/Login';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Other existing pages
import Team from './pages/Team';
import Projects from './pages/Projects';
import Finance from './pages/Finance';
import Analytics from './pages/Analytics';
import Communication from './pages/Communication';
import Documents from './pages/Documents';
import Constituency from './pages/Constituency';
import Polls from './pages/Polls';
import AITraining from './pages/AITraining';
import Legislative from './pages/Legislative';
import CitizenEngagement from './pages/CitizenEngagement';
import Parliamentary from './pages/Parliamentary';
import OppositionTracker from './pages/OppositionTracker';
import VoiceIntelligence from './pages/VoiceIntelligence';
import WebsiteAdmin from './pages/WebsiteAdmin';
import PromisesTracker from './pages/PromisesTracker';
import ContentFactory from './pages/ContentFactory';
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
import PoliticianProfile from './pages/politician/PoliticianProfile';
import SuperAdmin from './pages/SuperAdmin';
import PartyManager from './pages/PartyManager';
import StaffManagement from './pages/StaffManagement';

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

        {/* Founder / God Mode */}
        <Route path="/founder/political-health" element={<PoliticalHealth />} />
        <Route path="/politician/:id" element={<PoliticianProfile />} />
        <Route path="/founder/public" element={<PublicWebsite />} />
        <Route path="/founder/parties" element={<Parties />} />
        <Route path="/founder/politicians" element={<Politicians />} />
        <Route path="/founder/constituencies" element={<Constituencies />} />
        <Route path="/founder/users" element={<FounderUsers />} />
        <Route path="/founder/staff" element={<FounderUsers />} />
        <Route path="/founder/workers" element={<FounderUsers />} />
        <Route path="/founder/roles" element={<Roles />} />
        <Route path="/founder/features" element={<FeatureMatrix />} />
        <Route path="/founder/subscriptions" element={<Subscriptions />} />
        <Route path="/founder/integrations" element={<Integrations />} />
        <Route path="/founder/exports" element={<Exports />} />
        <Route path="/founder/system" element={<SystemHealth />} />
        <Route path="/founder/platform-settings" element={<PlatformSettings />} />
        <Route path="/founder/dashboard-debug" element={<DashboardDebug />} />

        {/* Operations */}
        <Route path="/grievances" element={<Grievances />} />
        <Route path="/events" element={<Events />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/voters" element={<Voters />} />
        <Route path="/booths" element={<BoothManagement />} />
        <Route path="/darshan" element={<Darshan />} />
        <Route path="/darshans" element={<Darshans />} />

        {/* Intelligence */}
        <Route path="/morning-brief" element={<MorningBrief />} />
        <Route path="/ai-studio" element={<AIStudio />} />
        <Route path="/media" element={<Media />} />
        <Route path="/omniscan" element={<OmniScan />} />
        <Route path="/sentiment" element={<SentimentDashboard />} />
        <Route path="/narrative" element={<SentimentDashboard />} />
        <Route path="/briefing" element={<PoliticalBriefing />} />

        {/* Ground */}
        <Route path="/whatsapp-intelligence" element={<WhatsAppIntelligence />} />
        <Route path="/quick-capture" element={<QuickCapture />} />

        {/* Account */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />

        {/* Other existing modules */}
        <Route path="/team" element={<Team />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/communication" element={<Communication />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/constituency" element={<Constituency />} />
        <Route path="/polls" element={<Polls />} />
        <Route path="/ai-training" element={<AITraining />} />
        <Route path="/legislative" element={<Legislative />} />
        <Route path="/citizen" element={<CitizenEngagement />} />
        <Route path="/parliamentary" element={<Parliamentary />} />
        <Route path="/opposition" element={<OppositionTracker />} />
        <Route path="/voice-intelligence" element={<VoiceIntelligence />} />
        <Route path="/promises" element={<PromisesTracker />} />
        <Route path="/content-factory" element={<ContentFactory />} />
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
