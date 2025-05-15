
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsItem, TabsList } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface FormGeneratorProps {
  excelData: {
    fileName: string;
    sheets: Record<string, any[][]>;
  };
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
}

export const FormGenerator = ({ excelData, formData, onFormDataChange }: FormGeneratorProps) => {
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [formFields, setFormFields] = useState<Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'textarea';
    options?: string[];
    row: number;
    col: number;
  }>>([]);

  useEffect(() => {
    // Set first sheet as active by default
    if (Object.keys(excelData.sheets).length > 0 && !activeSheet) {
      setActiveSheet(Object.keys(excelData.sheets)[0]);
    }
  }, [excelData, activeSheet]);

  useEffect(() => {
    if (activeSheet && excelData.sheets[activeSheet]) {
      analyzeSheetAndGenerateForm(excelData.sheets[activeSheet]);
    }
  }, [activeSheet, excelData]);

  const analyzeSheetAndGenerateForm = (sheetData: any[][]) => {
    // Simple heuristic to find fields in the Excel sheet
    const fields: Array<{
      id: string;
      label: string;
      type: 'text' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'textarea';
      options?: string[];
      row: number;
      col: number;
    }> = [];
    
    // This is a simplified approach - in a real app, you'd want more sophisticated field detection
    sheetData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (typeof cell === 'string' && 
            (cell.endsWith(':') || cell.endsWith('?') || 
             cell.includes('Enter') || cell.includes('input') || 
             cell.includes('fill') || cell.includes('provide'))) {
          
          // Try to determine the field type
          let fieldType: 'text' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'textarea' = 'text';
          
          const cellLower = cell.toLowerCase();
          if (cellLower.includes('amount') || cellLower.includes('number') || 
              cellLower.includes('cost') || cellLower.includes('price')) {
            fieldType = 'number';
          } else if (cellLower.includes('date') || cellLower.includes('when')) {
            fieldType = 'date';
          } else if (cellLower.includes('check') || cell.endsWith('?')) {
            fieldType = 'checkbox';
          } else if (cellLower.includes('select') || cellLower.includes('choose')) {
            fieldType = 'select';
          } else if (cellLower.includes('comment') || cellLower.includes('describe') || 
                     cellLower.includes('explain') || cellLower.includes('details')) {
            fieldType = 'textarea';
          }
          
          // Generate a unique ID for this field
          const fieldId = `field_${rowIndex}_${colIndex}`;
          
          // Add the field to our list
          fields.push({
            id: fieldId,
            label: cell.endsWith(':') ? cell.slice(0, -1) : cell,
            type: fieldType,
            row: rowIndex,
            col: colIndex,
            // For select fields, we can try to find options in the next cells
            options: fieldType === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : undefined
          });
        }
      });
    });
    
    setFormFields(fields);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    onFormDataChange({ [fieldId]: value });
  };

  const renderFormField = (field: any) => {
    const value = formData[field.id] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <Input 
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
        
      case 'number':
        return (
          <Input 
            type="number"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder="0.00"
          />
        );
        
      case 'date':
        return (
          <Input 
            type="date"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
        
      case 'checkbox':
        return (
          <Checkbox 
            id={field.id}
            checked={!!value}
            onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
          />
        );
        
      case 'textarea':
        return (
          <Textarea 
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
        
      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      default:
        return (
          <Input 
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
    }
  };

  if (!activeSheet) return <div>No sheets found in Excel file</div>;
  
  return (
    <div className="space-y-6">
      <Tabs value={activeSheet} onValueChange={setActiveSheet}>
        <TabsList className="mb-4">
          {Object.keys(excelData.sheets).map((sheetName) => (
            <TabsItem key={sheetName} value={sheetName}>
              {sheetName}
            </TabsItem>
          ))}
        </TabsList>
        
        {Object.keys(excelData.sheets).map((sheetName) => (
          <TabsContent key={sheetName} value={sheetName}>
            {formFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="flex items-center gap-2">
                      {field.label}
                      {field.type === 'checkbox' && renderFormField(field)}
                    </Label>
                    {field.type !== 'checkbox' && renderFormField(field)}
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-4">
                  <p className="text-center text-muted-foreground">
                    No form fields detected in this sheet. This might happen if the Excel structure couldn't be automatically analyzed.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
