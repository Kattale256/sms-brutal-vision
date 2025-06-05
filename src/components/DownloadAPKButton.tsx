
import React from 'react';
import { Button } from './ui/button';
import { Download, Smartphone, Clock } from 'lucide-react';
import { Card } from './ui/card';

const DownloadAPKButton: React.FC = () => {
  return (
    <Card className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-gray-500" />
          <h3 className="text-lg font-bold text-gray-600">Get Mobile App</h3>
        </div>
        
        <p className="text-sm text-center text-gray-500">
          Native Android app for offline access to all features
        </p>
        
        <Button 
          disabled
          className="w-full bg-gray-300 text-gray-500 font-bold border-2 border-gray-400 cursor-not-allowed opacity-60"
        >
          <Clock className="w-4 h-4 mr-2" />
          Coming Soon
        </Button>
        
        <div className="text-xs text-center text-gray-400">
          <p>• Feature in development</p>
          <p>• Will work completely offline</p>
          <p>• All data stays on your device</p>
        </div>
      </div>
    </Card>
  );
};

export default DownloadAPKButton;
