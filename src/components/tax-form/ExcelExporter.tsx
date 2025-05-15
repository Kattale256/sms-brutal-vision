
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Check } from "lucide-react";

interface ExcelExporterProps {
  originalExcelData: {
    fileName: string;
    sheets: Record<string, any[][]>;
  };
  formData: Record<string, any>;
  onExport: () => void;
}

export const ExcelExporter = ({ originalExcelData, formData, onExport }: ExcelExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(10);

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // For each sheet in the original workbook
      for (const [sheetName, sheetData] of Object.entries(originalExcelData.sheets)) {
        setExportProgress(30);
        
        // Create a copy of the original sheet data
        const newSheetData = JSON.parse(JSON.stringify(sheetData));
        
        // Populate the sheet with the form data
        Object.entries(formData).forEach(([fieldId, value]) => {
          // Extract row and column from field ID (format: field_row_col)
          const [, rowStr, colStr] = fieldId.split('_');
          const row = parseInt(rowStr, 10);
          const col = parseInt(colStr, 10);
          
          // Add the value to the next cell (or where appropriate)
          if (newSheetData[row] && col !== undefined) {
            // For typical fields, we write to the adjacent cell
            if (col + 1 < newSheetData[row].length || !newSheetData[row][col + 1]) {
              newSheetData[row][col + 1] = value;
            } else {
              // If there's already content in the adjacent cell, we find another spot
              // This is a simple approach - in a real app, you'd want more sophisticated placement
              const nextRow = row + 1;
              if (!newSheetData[nextRow]) {
                newSheetData[nextRow] = [];
              }
              newSheetData[nextRow][col] = value;
            }
          }
        });
        
        setExportProgress(60);
        
        // Convert the array to a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(newSheetData);
        
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
      
      setExportProgress(80);
      
      // Generate the excel file
      const excelFileName = originalExcelData.fileName.replace(/\.[^/.]+$/, "") + "_completed.xlsx";
      XLSX.writeFile(workbook, excelFileName);
      
      setExportProgress(100);
      
      // Call the onExport callback
      onExport();
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      // Reset state after a short delay to show the completion
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  // Create a summary of filled fields to display to the user
  const filledFieldsCount = Object.keys(formData).length;
  const sheetCount = Object.keys(originalExcelData.sheets).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">File Name</p>
                <p className="text-sm text-muted-foreground">{originalExcelData.fileName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Sheets</p>
                <p className="text-sm text-muted-foreground">{sheetCount} sheet(s)</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Fields Filled</p>
                <p className="text-sm text-muted-foreground">{filledFieldsCount} field(s)</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Export Format</p>
                <p className="text-sm text-muted-foreground">Excel (.xlsx)</p>
              </div>
            </div>
            
            {isExporting && (
              <div className="space-y-2 py-2">
                <Progress value={exportProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  {exportProgress === 100 ? "Export complete!" : "Preparing your Excel file..."}
                </p>
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                className="w-full" 
                onClick={handleExport}
                disabled={isExporting || filledFieldsCount === 0}
              >
                {exportProgress === 100 ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Exported Successfully
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
