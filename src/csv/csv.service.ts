import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CsvService {
  private uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async parseCsvFile(file: Express.Multer.File): Promise<{
    gameIds: string[];
    duplicates: string[];
    duplicateCount: number;
    originalCount: number;
    credentials: {
      email: string;
      password: string;
    };
  }> {
    const fileContent = file.buffer.toString('utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const gameIds: string[] = [];
    
    for (const record of records) {
      // Look for game id in various possible column names (case insensitive)
      const gameIdKey = Object.keys(record).find(
        key => key.toLowerCase().includes('game') && key.toLowerCase().includes('id')
      );

      if (gameIdKey && record[gameIdKey]) {
        const gameId = String(record[gameIdKey]).trim();
        if (gameId) {
          gameIds.push(gameId);
        }
      }
    }

    // Detect duplicates - count occurrences
    const idCounts = new Map<string, number>();
    
    gameIds.forEach(id => {
      idCounts.set(id, (idCounts.get(id) || 0) + 1);
    });

    // Get all duplicate IDs (including multiple entries for IDs that appear 3+ times)
    // If an ID appears 3 times, we add it twice to the duplicates array (since 2 are duplicates)
    const duplicates: string[] = [];
    idCounts.forEach((count, id) => {
      if (count > 1) {
        // Add the ID (count - 1) times to represent all duplicate occurrences
        for (let i = 0; i < count - 1; i++) {
          duplicates.push(id);
        }
      }
    });

    // Remove duplicates - keep only unique IDs
    const uniqueGameIds = Array.from(new Set(gameIds));

    return {
      gameIds: uniqueGameIds,
      duplicates: duplicates,
      duplicateCount: gameIds.length - uniqueGameIds.length,
      originalCount: gameIds.length,
      credentials: {
        email: 'spexgiveaway@gmail.com',
        password: 'spex@6070',
      },
    };
  }

  getRandomIds(gameIds: string[], count: number): string[] {
    if (count >= gameIds.length) {
      return [...gameIds];
    }

    const shuffled = [...gameIds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

