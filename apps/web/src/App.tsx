import { ThemeProvider } from './theme/ThemeProvider';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './lib/auth';
import { I18nProvider } from './lib/i18n';
import MainLayout from './components/layout/MainLayout';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <Notifications position="top-right" />
          <MainLayout />
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
