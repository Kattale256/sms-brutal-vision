
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';

interface ContactDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBubble: {
    name: string;
    value: number;
  } | null;
}

export const ContactDetailsDialog: React.FC<ContactDetailsDialogProps> = ({
  open,
  onOpenChange,
  selectedBubble
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Contact Details</DialogTitle>
        </DialogHeader>
        {selectedBubble && (
          <div className="p-2 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold mb-2">{selectedBubble.name}</h3>
            <p className="text-sm sm:text-lg">Total Transactions: <span className="font-bold">{selectedBubble.value}</span></p>
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded border">
              <p className="text-xs sm:text-sm text-gray-600">
                This contact appears in {selectedBubble.value} of your transactions, 
                making them one of your most frequent contacts.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
