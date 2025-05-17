
import { SmsMessage } from './types';

export class SampleDataProvider {
  /**
   * Provides sample SMS data for testing purposes
   */
  public getSampleData(): SmsMessage[] {
    return [
      {
        id: '1',
        sender: 'Airtel Money',
        content: 'RECEIVED. TID 121327207176. UGX 103,000 from 755352144, GODFREY MUYIMBWA. Bal UGX 105,342. View txns on MyAirtel App https://bit.ly/3ZgpiNw',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '2',
        sender: 'Airtel Money',
        content: 'SENT.TID 121276773406. UGX 4,000 to KASUBO PRISCILLADEBORAH 0755897066. Fee UGX 100. Bal UGX 31,522. Date 13-April-2025 12:14.',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '3',
        sender: 'Airtel Money',
        content: 'WITHDRAWN. TID 121246397487. UGX20,000 with Agent ID: 256593.Fee UGX 880. Bal UGX 35,622. 12-April-2025 19:55.Tax UGX 100',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '4',
        sender: 'Airtel Money',
        content: 'PAID.TID 121158749528. UGX 10,000 to BUSINESS Charge UGX 0. Bal UGX 56,602. 11-April-2025 13:05',
        timestamp: new Date().toISOString(),
        category: 'finance'
      }
    ];
  }
}

export default new SampleDataProvider();
