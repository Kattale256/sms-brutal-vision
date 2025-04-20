
import React, { useState } from 'react';
import SurveyForm from './SurveyForm';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SurveyFormWrapperProps {
  onComplete: () => void;
}

const SurveyFormWrapper: React.FC<SurveyFormWrapperProps> = ({ onComplete }) => {
  const [submitted, setSubmitted] = useState(false);
  const isMobile = useIsMobile();
  
  const handleSurveyComplete = () => {
    setSubmitted(true);
  };
  
  const handleViewInsights = () => {
    onComplete();
  };
  
  // Calculate scale based on device type (90% on desktop, 85% on mobile)
  const scale = isMobile ? 0.85 : 0.9;
  
  return (
    <div 
      className="w-full max-w-4xl mx-auto px-2" 
      style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
    >
      {!submitted ? (
        <div className="neo-chart p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-center">QUICK SURVEY</h2>
          <p className="mb-4 md:mb-6 text-center text-sm md:text-base">
            Please complete this brief survey before viewing your insights.
          </p>
          <SurveyForm onComplete={handleSurveyComplete} />
        </div>
      ) : (
        <div className="neo-chart p-4 md:p-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Thank you for participating!</h2>
          <p className="mb-4 md:mb-6 text-sm md:text-base">
            Your feedback is valuable to our research.
          </p>
          <Button 
            onClick={handleViewInsights}
            className="px-4 py-2 bg-neo-yellow hover:bg-neo-yellow/80 text-black font-bold"
          >
            View Your Insights
          </Button>
        </div>
      )}
    </div>
  );
};

export default SurveyFormWrapper;
