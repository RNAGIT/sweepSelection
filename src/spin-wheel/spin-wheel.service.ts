import { Injectable } from '@nestjs/common';

@Injectable()
export class SpinWheelService {
  selectWinner(gameIds: string[], previousWinners: string[] = []): string {
    if (!gameIds || gameIds.length === 0) {
      throw new Error('No game IDs provided');
    }

    // Filter out previous winners
    const availableIds = gameIds.filter(id => !previousWinners.includes(id));

    if (availableIds.length === 0) {
      throw new Error('All game IDs have already won. Please reset or upload a new CSV.');
    }

    const randomIndex = Math.floor(Math.random() * availableIds.length);
    return availableIds[randomIndex];
  }

  selectMultipleWinners(
    gameIds: string[],
    count: number,
    previousWinners: string[] = [],
  ): string[] {
    if (!gameIds || gameIds.length === 0) {
      throw new Error('No game IDs provided');
    }

    // Filter out previous winners
    const availableIds = gameIds.filter(id => !previousWinners.includes(id));

    if (availableIds.length === 0) {
      throw new Error('All game IDs have already won. Please reset or upload a new CSV.');
    }

    if (count >= availableIds.length) {
      return [...availableIds];
    }

    // Shuffle and select random winners
    const shuffled = [...availableIds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

