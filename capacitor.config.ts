
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e61af74b662a4dfca62c40913fe1ff69',
  appName: 'AKAMEME TAX APP',
  webDir: 'dist',
  // Remove or comment out this section for production builds:
  // server: {
  //   url: "https://e61af74b-662a-4dfc-a62c-40913fe1ff69.lovableproject.com?forceHideBadge=true",
  //   cleartext: true
  // },
  plugins: {
    Permissions: {
      sms: true
    }
  }
};
