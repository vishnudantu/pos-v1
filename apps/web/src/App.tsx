import { ThemeProvider } from './theme/ThemeProvider';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './lib/auth';
import { I18nProvider } from './lib/i18n';
import Layout from './components/layout/Layout';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <Notifications position="top-right" />
          <Layout />
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
