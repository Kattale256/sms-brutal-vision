
import React, { useRef, useState } from 'react';
import { Card } from './ui/card';
import { Play, Pause, RefreshCw, CheckCircle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselApi
} from './ui/carousel';
import { Button } from './ui/button';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface HowToUseVideoProps {
  onUserConfirmed?: () => void;
}

const HowToUseVideo: React.FC<HowToUseVideoProps> = ({ onUserConfirmed }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userHasConfirmed, setUserHasConfirmed] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  const steps: Step[] = [
    {
      title: 'Step 1: Copy as many Mobile Money messages as you want',
      description: 'Select and copy as many mobile money transaction messages as you want from your phone\'s SMS inbox',
      icon: <div className="text-4xl">📱</div>,
    },
    {
      title: 'Step 2: Tap "PASTE SMS" button',
      description: 'Tap the large "PASTE SMS" button at the top of the app to open the input dialog',
      icon: <div className="text-4xl">👆</div>,
    },
    {
      title: 'Step 3: Paste messages in dialog',
      description: 'Paste all your copied messages into the dialog box that appears',
      icon: <div className="text-4xl">📋</div>,
    },
    {
      title: 'Step 4: Tap "PROCESS" button',
      description: 'Tap "PROCESS" to transform your SMS messages into detailed financial insights',
      icon: <div className="text-4xl">✨</div>,
    },
    {
      title: 'Step 5: Download your reports',
      description: 'Export your analysis as PDF or Excel files for your records',
      icon: <div className="text-4xl">📊</div>,
    }
  ];
  
  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentStep(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);
  
  React.useEffect(() => {
    if (isPlaying && api) {
      intervalRef.current = window.setInterval(() => {
        const current = api.selectedScrollSnap();
        const next = (current + 1) % steps.length;
        api.scrollTo(next);
      }, 3000); // Slowed down to 3 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, api, steps.length]);
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const resetAnimation = () => {
    if (api) {
      api.scrollTo(0);
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handleUserConfirmation = () => {
    setUserHasConfirmed(true);
    setShowConfirmation(false);
    onUserConfirmed?.();
  };
  
  return (
    <>
      <Card className={`p-4 bg-white border-4 border-neo-black overflow-hidden transition-all duration-500 ${
        !userHasConfirmed ? 'highlight-glow' : 'border-neo-black'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl">How to Use AKAMEME TAX APP</h3>
          <div className="flex gap-2">
            <button 
              onClick={togglePlayPause} 
              className="p-2 rounded-full hover:bg-gray-100 border-2 border-neo-black bg-neo-yellow"
              aria-label={isPlaying ? "Pause tutorial" : "Play tutorial"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button 
              onClick={resetAnimation} 
              className="p-2 rounded-full hover:bg-gray-100 border-2 border-neo-black bg-neo-yellow"
              aria-label="Restart tutorial"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
        
        <Carousel 
          className="w-full"
          setApi={setApi}
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
                  className="flex flex-col items-center justify-center gap-4 h-72 bg-silver-light p-4 border-2 border-neo-black rounded"
                >
                  {step.icon}
                  <h4 className="font-bold text-center text-lg">{step.title}</h4>
                  <p className="text-center text-sm text-gray-700 max-w-sm">{step.description}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-neo-yellow border-2 border-neo-black" />
          <CarouselNext className="right-2 bg-neo-yellow border-2 border-neo-black" />
          
          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full border-2 border-neo-black transition-colors ${
                  currentStep === index ? 'bg-neo-yellow' : 'bg-silver'
                }`}
                onClick={() => {
                  if (api) {
                    api.scrollTo(index);
                    setIsPlaying(false);
                  }
                }}
              />
            ))}
          </div>
        </Carousel>

        {!userHasConfirmed && (
          <div className="mt-6 text-center">
            <Button 
              onClick={() => setShowConfirmation(true)}
              className="bg-neo-yellow hover:bg-yellow-400 text-neo-black font-bold border-2 border-neo-black shadow-neo-sm"
            >
              I Understand How To Use The App
            </Button>
          </div>
        )}

        {userHasConfirmed && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="font-medium">Ready to use AKAMEME TAX APP!</span>
          </div>
        )}
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-neo-black p-6 max-w-md w-full shadow-neo">
            <h3 className="text-xl font-bold mb-4">Confirm Understanding</h3>
            <p className="mb-6">
              Do you understand how to copy multiple mobile money messages and paste them into AKAMEME TAX APP to get your financial insights?
            </p>
            <div className="flex gap-4 justify-end">
              <Button 
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                className="border-2 border-neo-black"
              >
                Review Again
              </Button>
              <Button 
                onClick={handleUserConfirmation}
                className="bg-neo-yellow hover:bg-yellow-400 text-neo-black font-bold border-2 border-neo-black"
              >
                Yes, I Understand
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HowToUseVideo;
