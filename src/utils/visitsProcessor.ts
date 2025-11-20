import Papa from 'papaparse';
import { UserVisit, UserVisitsPeriod } from '../types';

interface RawVisitData {
  // Format 1: E-Mail,Name,Anzahl der Besuche
  'E-Mail'?: string;
  'Name'?: string;
  'Anzahl der Besuche'?: string;
  // Format 2: Name,E-Mail,Anzahl der Besuche
  email?: string;
  name?: string;
  visitCount?: string;
}

export class VisitsProcessor {
  static async processVisitsCsv(csvContent: string, periodName: string): Promise<UserVisitsPeriod> {
    return new Promise((resolve, reject) => {
      Papa.parse<RawVisitData>(csvContent, {
        header: true,
        encoding: 'UTF-8',
        skipEmptyLines: true,
        transform: (value: string) => {
          // Fix common encoding issues with German umlauts
          return value
            .replace(/Ã¤/g, 'ä')
            .replace(/Ã¶/g, 'ö')
            .replace(/Ã¼/g, 'ü')
            .replace(/Ã/g, 'ß')
            .replace(/Ã„/g, 'Ä')
            .replace(/Ã–/g, 'Ö')
            .replace(/Ãœ/g, 'Ü')
            .replace(/â‚¬/g, '€')
            // Handle other common encoding issues
            .replace(/Â/g, '')
            .replace(/â/g, '');
        },
        complete: (results: Papa.ParseResult<any>) => {
          try {
            const rawData = results.data as RawVisitData[];
            const processedData = VisitsProcessor.analyzeVisitsData(rawData, periodName);
            resolve(processedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: any) => reject(error)
      });
    });
  }

  private static analyzeVisitsData(rawData: RawVisitData[], periodName: string): UserVisitsPeriod {
    // Normalize data from different CSV formats
    const userVisits: UserVisit[] = rawData
      .filter(row => {
        // Check if row has data (skip empty rows)
        // Format 1: E-Mail,Name,Anzahl der Besuche
        // Format 2: Name,E-Mail,Anzahl der Besuche
        const email = row['E-Mail'] || row.email;
        const name = row['Name'] || row.name;
        const visits = row['Anzahl der Besuche'] || row.visitCount;
        return email && name && visits;
      })
      .map(row => {
        // Handle both CSV formats
        let email = '';
        let name = '';
        let visitCount = 0;

        if (row['E-Mail']) {
          // Format 1: E-Mail,Name,Anzahl der Besuche
          email = row['E-Mail'].trim();
          name = row['Name']?.trim() || '';
          visitCount = parseInt(row['Anzahl der Besuche']?.trim() || '0') || 0;
        } else if (row.email) {
          // Format 2: Name,E-Mail,Anzahl der Besuche
          email = row.email.trim();
          name = row.name?.trim() || '';
          visitCount = parseInt(row.visitCount?.trim() || '0') || 0;
        }

        return {
          email,
          name,
          visitCount
        };
      })
      .filter(visit => visit.visitCount > 0) // Only include users with visits
      .sort((a, b) => b.visitCount - a.visitCount); // Sort by visit count descending

    const totalUsers = userVisits.length;
    const totalVisits = userVisits.reduce((sum, user) => sum + user.visitCount, 0);
    const averageVisitsPerUser = totalUsers > 0 ? totalVisits / totalUsers : 0;

    // Get top 10 users
    const topUsers = userVisits.slice(0, 10);

    return {
      period: this.getPeriodKey(periodName),
      periodName,
      totalUsers,
      totalVisits,
      averageVisitsPerUser,
      topUsers,
      userVisits
    };
  }

  private static getPeriodKey(periodName: string): string {
    const lowerName = periodName.toLowerCase();
    if (lowerName.includes('juni') && lowerName.includes('juli')) return 'juni-juli';
    if (lowerName.includes('juli') && lowerName.includes('august')) return 'juli-august';
    if (lowerName.includes('oktober') && lowerName.includes('november')) return 'oktober-november';
    return periodName.toLowerCase().replace(/\s+/g, '-');
  }
}
