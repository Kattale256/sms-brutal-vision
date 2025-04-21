
import React, { useState } from 'react';
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SurveyFormProps {
  onComplete: () => void;
}

interface SurveyQuestion {
  id: number;
  text: string;
  answer: number | null;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'survey' | 'thank-you'>('survey');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { id: 1, text: "As Proof of Payment", answer: null },
    { id: 2, text: "As Tax Evidence", answer: null },
    { id: 3, text: "As Deterrent to Fraud", answer: null },
    { id: 4, text: "As Protection of Personal Information", answer: null },
    { id: 5, text: "As a Formal Communication", answer: null }
  ]);

  const handleRatingChange = (questionId: number, rating: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, answer: rating } : q
    ));
  };

  const isAllQuestionsAnswered = questions.every(q => q.answer !== null);

  const exportToExcel = (surveyData: SurveyQuestion[]) => {
    const workbook = XLSX.utils.book_new();
    
    const data = surveyData.map(q => ({
      Question: q.text,
      Answer: q.answer
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Results");
    
    // Add copyright sheet
    const copyrightData = [
      { Notice: 'Extracted By Firm D1 Research Project on E-Payment Message Notification Analysis.' },
      { Notice: '(c) 2025 FIRM D1, LDC KAMPALA' }
    ];
    const copyrightWS = XLSX.utils.json_to_sheet(copyrightData);
    XLSX.utils.book_append_sheet(workbook, copyrightWS, "Copyright");
    
    // Create a blob and return it
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  const exportToPDF = (surveyData: SurveyQuestion[]) => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    // Underlined heading
    doc.setFont(undefined, "bold");
    doc.text("Survey Results", 20, 20);
    doc.setLineWidth(0.5);
    doc.line(20, 22, 80, 22);
    doc.setFont(undefined, "normal");

    let y = 30;
    surveyData.forEach((q, i) => {
      doc.setFontSize(12);
      // Underline question
      doc.setFont(undefined, "bold");
      doc.text(`${i + 1}. ${q.text}`, 20, y);
      // Draw underline
      const textWidth = doc.getTextWidth(`${i + 1}. ${q.text}`);
      doc.line(20, y + 2, 20 + textWidth, y + 2);
      doc.setFont(undefined, "normal");
      doc.setFontSize(12);
      doc.text(`Rating: ${q.answer !== null ? q.answer : ""}`, 25, y + 8);
      y += 18;
    });

    // Copyright at bottom
    doc.setFontSize(10);
    y += 12;
    doc.text("Extracted By Firm D1 Research Project on E-Payment Message Notification Analysis.", 20, y);
    doc.text("(c) 2025 FIRM D1, LDC KAMPALA", 20, y + 5);

    return doc.output('blob');
  };

  const sendEmail = async () => {
    try {
      const excelBlob = exportToExcel(questions);
      const pdfBlob = exportToPDF(questions);
      // Just silently "send", no notification anymore
    } catch (error) {
      console.error("Error sending survey:", error);
      toast({
        title: "Error sending survey",
        description: "There was a problem sending your survey response",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAllQuestionsAnswered) {
      toast({
        title: "Please complete the survey",
        description: "Please answer all questions to continue",
        variant: "destructive"
      });
      return;
    }

    await sendEmail();
    setStep('thank-you');
  };

  if (step === 'thank-you') {
    // message about sending to email removed
    return (
      <div className="neo-card p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">THANK YOU!</h2>
        <p className="mb-6">Thank you for participating in our survey. Your feedback is valuable to our research.</p>
        <Button onClick={onComplete} className="neo-button bg-neo-yellow">
          VIEW YOUR RESULTS
        </Button>
      </div>
    );
  }

  return (
    <div className="neo-card p-8">
      <h2 className="text-2xl font-bold mb-4">QUICK SURVEY</h2>
      <p className="mb-6">
        On a scale of 0 to 5, how regularly do you use mobile money notifications in the following key areas?
        (0 = not at all, 5 = all the time)
      </p>
      
      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
          <div key={question.id} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">{question.text}</label>
              <span className="text-sm text-gray-500">
                {question.answer !== null ? 
                  `Your rating: ${question.answer}` : 
                  'Not rated yet'}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange(question.id, rating)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                    ${question.answer === rating 
                      ? 'bg-neo-yellow border-neo-black' 
                      : 'bg-white border-gray-300 hover:border-gray-400'}`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="neo-button bg-neo-yellow"
            disabled={!isAllQuestionsAnswered}
          >
            SUBMIT SURVEY
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SurveyForm;
