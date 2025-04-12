
import { SmsMessage } from "../data/sampleData";

// Function to categorize messages based on content keywords
export const categorizeMessage = (message: SmsMessage): string => {
  const content = message.content.toLowerCase();
  
  if (message.category) {
    return message.category;
  }
  
  if (content.includes("order") || content.includes("delivered") || content.includes("shipped")) {
    return "shopping";
  }
  if (content.includes("balance") || content.includes("payment") || content.includes("$") || content.includes("account")) {
    return "finance";
  }
  if (content.includes("verification") || content.includes("code") || content.includes("alert") || content.includes("security")) {
    return "security";
  }
  if (content.includes("appointment") || content.includes("doctor") || content.includes("health") || content.includes("medical")) {
    return "health";
  }
  if (content.includes("flight") || content.includes("travel") || content.includes("hotel") || content.includes("reservation")) {
    return "travel";
  }
  if (content.includes("uber") || content.includes("lyft") || content.includes("transit") || content.includes("bus")) {
    return "transportation";
  }
  if (content.includes("bill") || content.includes("due") || content.includes("invoice")) {
    return "bills";
  }
  if (content.includes("off") || content.includes("sale") || content.includes("discount") || content.includes("promo")) {
    return "marketing";
  }
  if (content.includes("meeting") || content.includes("deadline") || content.includes("project") || content.includes("report")) {
    return "work";
  }
  
  return "personal";
};

// Group messages by category
export const getMessagesByCategory = (messages: SmsMessage[]): Record<string, number> => {
  const categories: Record<string, number> = {};
  
  messages.forEach(message => {
    const category = categorizeMessage(message);
    if (categories[category]) {
      categories[category]++;
    } else {
      categories[category] = 1;
    }
  });
  
  return categories;
};

// Group messages by day for timeline visualization
export const getMessagesTimeline = (messages: SmsMessage[]): Record<string, number> => {
  const timeline: Record<string, number> = {};
  
  messages.forEach(message => {
    const date = new Date(message.timestamp).toISOString().split('T')[0];
    if (timeline[date]) {
      timeline[date]++;
    } else {
      timeline[date] = 1;
    }
  });
  
  // Sort by date
  return Object.fromEntries(
    Object.entries(timeline).sort(([a], [b]) => a.localeCompare(b))
  );
};

// Extract financial data from messages
export const extractFinancialData = (messages: SmsMessage[]): { type: string; amount: number }[] => {
  const financialData: { type: string; amount: number }[] = [];
  
  const financeMessages = messages.filter(message => 
    message.category === 'finance' || categorizeMessage(message) === 'finance'
  );
  
  financeMessages.forEach(message => {
    const content = message.content;
    // Extract dollar amounts using regex
    const dollarRegex = /\$(\d+(?:,\d+)*(?:\.\d+)?)/g;
    let match;
    
    while ((match = dollarRegex.exec(content)) !== null) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      
      // Determine if it's an expense or income based on content
      const isExpense = content.includes("bill") || content.includes("due") || 
                        content.includes("payment") || content.includes("paid");
      
      financialData.push({
        type: isExpense ? "expense" : "income",
        amount: isExpense ? -amount : amount
      });
    }
  });
  
  return financialData;
};

// Get message sender statistics
export const getSenderStats = (messages: SmsMessage[]): Record<string, number> => {
  const senders: Record<string, number> = {};
  
  messages.forEach(message => {
    if (senders[message.sender]) {
      senders[message.sender]++;
    } else {
      senders[message.sender] = 1;
    }
  });
  
  // Sort by frequency in descending order
  return Object.fromEntries(
    Object.entries(senders)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Get top 5 senders
  );
};

// Extract keywords from messages
export const extractKeywords = (messages: SmsMessage[]): Record<string, number> => {
  const keywords: Record<string, number> = {};
  const stopwords = ["the", "and", "a", "to", "of", "is", "in", "you", "your", "with", "for", "from", "on", "at"];
  
  messages.forEach(message => {
    const words = message.content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopwords.includes(word));
    
    words.forEach(word => {
      if (keywords[word]) {
        keywords[word]++;
      } else {
        keywords[word] = 1;
      }
    });
  });
  
  // Sort by frequency in descending order and take top 10
  return Object.fromEntries(
    Object.entries(keywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  );
};
