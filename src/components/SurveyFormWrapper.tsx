
import React, { useState } from 'react';
import SurveyForm from './SurveyForm';
import { Button } from './ui/button';

interface SurveyFormWrapperProps {
  onComplete: () => void;
}

const SurveyFormWrapper: React.FC<SurveyFormWrapperProps> = ({ onComplete }) => {
  const [submitted, setSubmitted] = useState(false);
  
  const handleSurveyComplete = () => {
    setSubmitted(true);
  };
  
  const handleViewInsights = () => {
    onComplete();
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto" style={{ transform: 'scale(0.9)' }}>
      {!submitted ? (
        <div className="neo-chart p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">QUICK SURVEY</h2>
          <p className="mb-6 text-center">
            Please complete this brief survey before viewing your insights.
          </p>
          <SurveyForm onComplete={handleSurveyComplete} />
        </div>
      ) : (
        <div className="neo-chart p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Thank you for participating!</h2>
          <p className="mb-6">
            Your feedback is valuable to our research.
          </p>
          <Button 
            onClick={handleViewInsights}
            className="px-6 py-2 bg-neo-yellow hover:bg-neo-yellow/80 text-black"
          >
            View Your Insights
          </Button>
        </div>
      )}
    </div>
  );
};

export default SurveyFormWrapper;
