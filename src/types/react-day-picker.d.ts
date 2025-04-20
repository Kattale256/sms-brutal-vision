
// Type declarations to fix the DayProps error
import 'react-day-picker';

declare module 'react-day-picker' {
  export interface DayProps {
    day: Date;
    modifiers?: Record<string, boolean>;
    modifiersStyles?: Record<string, React.CSSProperties>;
    // Add any other properties that might be missing
  }
}
