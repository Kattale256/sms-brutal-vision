
import React from 'react';
import { MoveIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Handle({ className, ...props }: HandleProps) {
  return (
    <div 
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md border bg-background text-muted-foreground", 
        className
      )}
      {...props}
    >
      <MoveIcon className="h-4 w-4" />
    </div>
  );
}
