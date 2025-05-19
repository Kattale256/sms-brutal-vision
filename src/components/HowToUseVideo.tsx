
import React, { useRef, useState } from 'react';
import { Card } from './ui/card';
import { Play, Pause, RefreshCw } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from './ui/carousel';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const HowToUseVideo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<number | null>(null);
  
  const steps: Step[] = [
    {
      title: 'Step 1: Copy your mobile money SMS messages',
      description: 'Select and copy mobile money transaction messages from your phone\'s SMS inbox',
      icon: <div className="text-4xl">📱</div>,
    },
    {
      title: 'Step 2: Tap "Paste SMS" button',
      description: 'Tap the "Paste SMS" button at the top of the app to open the input dialog',
      icon: <div className="text-4xl">👆</div>,
    },
    {
      title: 'Step 3: Paste messages in dialog',
      description: 'Paste your copied messages into the dialog box that appears',
      icon: <div className="text-4xl">📋</div>,
    },
    {
      title: 'Step 4: Tap "Process" button',
      description: 'Tap "Process" to transform your SMS messages into detailed financial insights',
      icon: <div className="text-4xl">✨</div>,
    },
    {
      title: 'Step 5: Download your reports',
      description: 'Export your analysis as PDF or Excel files for your records',
      icon: <div className="text-4xl">📊</div>,
    }
  ];
  
  React.useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length);
      }, 4000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, steps.length]);
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const resetAnimation = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };
  
  return (
    <Card className="p-4 bg-white border-2 border-neo-black overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl">How to Use This App</h3>
        <div className="flex gap-2">
          <button 
            onClick={togglePlayPause} 
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label={isPlaying ? "Pause tutorial" : "Play tutorial"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button 
            onClick={resetAnimation} 
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Restart tutorial"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      <Carousel 
        className="w-full"
        opts={{
          loop: true,
          align: "start",
        }}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        <CarouselContent>
          {steps.map((step, index) => (
            <CarouselItem key={index} className="basis-full">
              <div 
                className="flex flex-col items-center justify-center gap-4 h-60 bg-gray-50 p-4 border-2 border-neo-black rounded"
              >
                {step.icon}
                <h4 className="font-bold text-center">{step.title}</h4>
                <p className="text-center text-sm text-gray-600">{step.description}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
        
        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {steps.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${currentStep === index ? 'bg-yellow-500' : 'bg-gray-300'}`}
              onClick={() => {
                setCurrentStep(index);
                setIsPlaying(false);
              }}
            />
          ))}
        </div>
      </Carousel>
    </Card>
  );
};

export default HowToUseVideo;
