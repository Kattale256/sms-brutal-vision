
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e61af74b662a4dfca62c40913fe1ff69',
  appName: 'AKAMEME TAX APP',
  webDir: 'dist',
  plugins: {
    Permissions: {
      sms: true
    }
  }
};

export default config;
