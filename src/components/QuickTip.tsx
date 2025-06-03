
import React from 'react';
import { Lightbulb, Copy } from 'lucide-react';
import { Card } from './ui/card';

const QuickTip: React.FC = () => {
  return (
    <Card className="p-4 bg-gradient-to-r from-neo-yellow/20 to-silver-light border-2 border-neo-yellow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-neo-yellow border-2 border-neo-black rounded-full flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-neo-black" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-neo-black mb-2 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            PRO TIP: Copy Multiple Messages at Once!
          </h3>
          <p className="text-xs text-neo-gray leading-relaxed">
            You can select and copy <strong>ALL your mobile money messages at once</strong> from your phone's SMS inbox, 
            then paste them all together in one go. No need to copy and paste one by one! 
            This saves time and ensures you don't miss any transactions.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default QuickTip;
