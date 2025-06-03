
import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

interface AISecurityBadgeProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

const AISecurityBadge: React.FC<AISecurityBadgeProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1 text-xs text-gray-500 ${className}`}>
        <Shield className="w-3 h-3 text-neo-yellow" />
        <span className="font-medium">AI Protection 24/7</span>
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`
        bg-gradient-to-r from-neo-yellow/10 to-silver-light/50 
        border-neo-yellow/30 text-neo-black font-medium text-xs
        hover:from-neo-yellow/20 hover:to-silver-light/70 
        transition-all duration-200 cursor-default
        ${className}
      `}
    >
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Shield className="w-3 h-3 text-neo-black" />
          <Sparkles className="w-2 h-2 text-neo-yellow absolute -top-0.5 -right-0.5" />
        </div>
        <span>AI Protection 24/7</span>
      </div>
    </Badge>
  );
};

export default AISecurityBadge;
