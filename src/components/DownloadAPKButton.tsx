
import React from 'react';
import { Button } from './ui/button';
import { Download, Smartphone } from 'lucide-react';
import { Card } from './ui/card';

const DownloadAPKButton: React.FC = () => {
  const handleDownload = () => {
    // This would typically point to your APK file hosted somewhere
    // For now, we'll show instructions to users
    window.open('https://github.com/your-username/your-repo/releases/latest', '_blank');
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-neo-yellow/10 to-silver-light border-2 border-neo-yellow">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-neo-black" />
          <h3 className="text-lg font-bold text-neo-black">Get Mobile App</h3>
        </div>
        
        <p className="text-sm text-center text-neo-gray">
          Download the native Android app for offline access to all features
        </p>
        
        <Button 
          onClick={handleDownload}
          className="w-full bg-neo-yellow hover:bg-yellow-400 text-neo-black font-bold border-2 border-neo-black shadow-neo-sm hover:shadow-neo transition-all duration-200 active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Android APK
        </Button>
        
        <div className="text-xs text-center text-gray-500">
          <p>• Works completely offline</p>
          <p>• No internet required after download</p>
          <p>• All data stays on your device</p>
        </div>
      </div>
    </Card>
  );
};

export default DownloadAPKButton;
