
import React, { useState } from 'react';
import { SmsMessage } from '../data/sampleData';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface MessageCategorizationProps {
  message: SmsMessage;
  onCategorize: (messageId: string, category: string, subCategory: string) => void;
}

const MESSAGE_CATEGORIES = [
  { value: 'business-income', label: 'Business Income' },
  { value: 'business-expense', label: 'Business Expense' },
];

const BUSINESS_INCOME_SUBCATEGORIES = [
  { value: 'sales', label: 'Sales Revenue' },
  { value: 'service-fees', label: 'Service Fees' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'commissions', label: 'Commissions' },
  { value: 'rental-income', label: 'Rental Income' },
  { value: 'royalties', label: 'Royalties' },
  { value: 'interest', label: 'Interest' },
  { value: 'dividends', label: 'Dividends' },
  { value: 'other-income', label: 'Other Income' },
];

const BUSINESS_EXPENSE_SUBCATEGORIES = [
  { value: 'advertising', label: 'Advertising' },
  { value: 'office-expenses', label: 'Office Expenses' },
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries-wages', label: 'Salaries & Wages' },
  { value: 'travel', label: 'Travel' },
  { value: 'meals-entertainment', label: 'Meals & Entertainment' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'taxes-licenses', label: 'Taxes & Licenses' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'repairs-maintenance', label: 'Repairs & Maintenance' },
  { value: 'other-expenses', label: 'Other Expenses' },
];

const MessageCategorization: React.FC<MessageCategorizationProps> = ({ message, onCategorize }) => {
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubCategory(''); // Reset subcategory when main category changes
  };
  
  const handleSubCategoryChange = (value: string) => {
    setSubCategory(value);
    onCategorize(message.id, category, value);
  };
  
  const subcategories = category === 'business-income' 
    ? BUSINESS_INCOME_SUBCATEGORIES 
    : BUSINESS_EXPENSE_SUBCATEGORIES;
  
  return (
    <div className="flex flex-col gap-2">
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categorize..." />
        </SelectTrigger>
        <SelectContent>
          {MESSAGE_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {category && (
        <Select value={subCategory} onValueChange={handleSubCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select subcategory..." />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((subcat) => (
              <SelectItem key={subcat.value} value={subcat.value}>
                {subcat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default MessageCategorization;
