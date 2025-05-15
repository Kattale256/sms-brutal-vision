
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, File } from "lucide-react";

interface ExcelImporterProps {
  onImport: (data: any) => void;
}

export const ExcelImporter = ({ onImport }: ExcelImporterProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsLoading(true);
      setFileName(file.name);
      setProgress(10);

      // Read the file with a small delay to show progress
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setProgress(50);
        
        setTimeout(() => {
          try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            setProgress(70);
            
            // Parse the Excel file
            const workbook = XLSX.read(data, { type: 'array' });
            setProgress(90);
            
            // Extract sheet names and data
            const result = {
              fileName: file.name,
              sheets: {} as Record<string, any[]>
            };
            
            workbook.SheetNames.forEach(sheetName => {
              const worksheet = workbook.Sheets[sheetName];
              result.sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            });
            
            setProgress(100);
            onImport(result);
          } catch (error) {
            console.error("Error parsing Excel file:", error);
            resetState();
          } finally {
            setIsLoading(false);
          }
        }, 500);
      };
      
      reader.onerror = () => {
        resetState();
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      resetState();
    }
  };

  const resetState = () => {
    setIsLoading(false);
    setFileName(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <File className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">
            {fileName ? fileName : "Drag and drop your Excel file, or click to browse"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports .xlsx and .xls formats
          </p>
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
          id="excel-file-input"
          disabled={isLoading}
        />
        <Button 
          variant="outline" 
          className="mt-4"
          disabled={isLoading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Excel File
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-center text-muted-foreground">
            Processing your Excel file...
          </p>
        </div>
      )}
    </div>
  );
};
