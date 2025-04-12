
export interface SmsMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  category?: string;
}

// Sample SMS data for development
export const sampleSmsData: SmsMessage[] = [
  {
    id: '1',
    sender: '+1234567890',
    content: 'Your Amazon order #A123456 has shipped and will be delivered on 04/10/2025.',
    timestamp: '2025-04-10T09:30:00Z',
    category: 'shopping'
  },
  {
    id: '2',
    sender: '+1987654321',
    content: 'Your account balance is $1,240.56. Visit chase.com for details.',
    timestamp: '2025-04-09T14:15:00Z',
    category: 'finance'
  },
  {
    id: '3',
    sender: '+1555123456',
    content: 'Your verification code is 395721. Do not share this with anyone.',
    timestamp: '2025-04-08T11:45:00Z',
    category: 'security'
  },
  {
    id: '4',
    sender: '+1444789123',
    content: 'Mom, can you pick me up at 5pm from soccer practice?',
    timestamp: '2025-04-08T10:22:00Z',
    category: 'personal'
  },
  {
    id: '5',
    sender: '+1333567890',
    content: 'Your flight AA1234 is on time. Boarding begins at gate B12 at 3:45PM.',
    timestamp: '2025-04-07T15:10:00Z',
    category: 'travel'
  },
  {
    id: '6',
    sender: '+1222345678',
    content: 'Your prescription is ready for pickup at Walgreens on Main St.',
    timestamp: '2025-04-06T12:00:00Z',
    category: 'health'
  },
  {
    id: '7',
    sender: '+1111234567',
    content: 'Reminder: Your appointment with Dr. Smith is tomorrow at 2:30PM.',
    timestamp: '2025-04-05T09:00:00Z',
    category: 'health'
  },
  {
    id: '8',
    sender: '+1999888777',
    content: 'Your Uber will arrive in 3 minutes. Meet at the pickup location.',
    timestamp: '2025-04-04T18:45:00Z',
    category: 'transportation'
  },
  {
    id: '9',
    sender: '+1888777666',
    content: 'ALERT: Unusual activity detected on your card ending in 4567. Reply YES if this was you.',
    timestamp: '2025-04-03T21:30:00Z',
    category: 'security'
  },
  {
    id: '10',
    sender: '+1777666555',
    content: 'Your bill of $89.99 is due on 04/15/2025. Pay online at verizon.com.',
    timestamp: '2025-04-02T11:15:00Z',
    category: 'bills'
  },
  {
    id: '11',
    sender: '+1666555444',
    content: '25% OFF everything this weekend! Shop now at target.com with code SAVE25.',
    timestamp: '2025-04-01T08:00:00Z',
    category: 'marketing'
  },
  {
    id: '12',
    sender: '+1555444333',
    content: 'Happy birthday! Here\'s $5 Starbucks credit for a free drink. Expires in 7 days.',
    timestamp: '2025-03-31T10:00:00Z',
    category: 'marketing'
  },
  {
    id: '13',
    sender: '+1444333222',
    content: 'Meeting rescheduled to 3PM today. Dial in using code 1234# at 555-123-4567.',
    timestamp: '2025-03-30T11:30:00Z',
    category: 'work'
  },
  {
    id: '14',
    sender: '+1333222111',
    content: 'Your package has been delivered to the front door. Thank you for using FedEx.',
    timestamp: '2025-03-29T14:20:00Z',
    category: 'shopping'
  },
  {
    id: '15',
    sender: '+1222111000',
    content: 'Payment received. Thank you for your payment of $125.00 on your account.',
    timestamp: '2025-03-28T09:45:00Z',
    category: 'finance'
  }
];
