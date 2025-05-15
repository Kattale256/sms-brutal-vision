
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsItem, TabsList } from "@/components/ui/tabs";
import { Upload, Download, File } from "lucide-react";
import { ExcelImporter } from '@/components/tax-form/ExcelImporter';
import { ExcelExporter } from '@/components/tax-form/ExcelExporter';
import { FormGenerator } from '@/components/tax-form/FormGenerator';
import { useToast } from "@/hooks/use-toast";

const TaxForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [excelData, setExcelData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [activeStep, setActiveStep] = useState<'upload' | 'fill' | 'export'>('upload');

  const handleExcelImport = (data: any) => {
    setExcelData(data);
    setActiveStep('fill');
    toast({
      title: "Excel file imported successfully",
      description: `${Object.keys(data.sheets).length} sheets found in the document.`
    });
  };

  const handleFormDataChange = (newData: any) => {
    setFormData({ ...formData, ...newData });
  };

  const handleExport = () => {
    toast({
      title: "Tax form exported",
      description: "Your tax form has been downloaded successfully."
    });
    setActiveStep('upload');
    // Reset the form after export if needed
    // setExcelData(null);
    // setFormData({});
  };

  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tax Form Builder</h1>
          <p className="text-muted-foreground mt-2">Import an Excel tax form, fill it out, and export it back</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue={activeStep} onValueChange={(value) => setActiveStep(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsItem value="upload">1. Upload Excel</TabsItem>
          <TabsItem value="fill" disabled={!excelData}>2. Fill Form</TabsItem>
          <TabsItem value="export" disabled={!excelData}>3. Export</TabsItem>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Excel Tax Form</CardTitle>
              <CardDescription>
                Upload your tax Excel file to get started. We'll convert it into a user-friendly form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelImporter onImport={handleExcelImport} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fill" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fill Your Tax Form</CardTitle>
              <CardDescription>
                Complete the form fields below. All your data stays in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {excelData && (
                <FormGenerator 
                  excelData={excelData}
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                />
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => setActiveStep('export')} 
                disabled={Object.keys(formData).length === 0}
              >
                Continue to Export
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Your Completed Tax Form</CardTitle>
              <CardDescription>
                Download your tax form with all the filled information in Excel format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {excelData && (
                <ExcelExporter 
                  originalExcelData={excelData}
                  formData={formData}
                  onExport={handleExport}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxForm;
