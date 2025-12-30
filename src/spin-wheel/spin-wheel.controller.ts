import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { SpinWheelService } from './spin-wheel.service';

@Controller('spin-wheel')
export class SpinWheelController {
  constructor(private readonly spinWheelService: SpinWheelService) {}

  @Post('spin')
  async spin(
    @Body()
    body: {
      gameIds: string[];
      previousWinners?: string[];
      winnerCount?: number;
    },
  ) {
    if (!body.gameIds || !Array.isArray(body.gameIds) || body.gameIds.length === 0) {
      throw new BadRequestException('gameIds must be a non-empty array');
    }

    try {
      const previousWinners = body.previousWinners || [];
      const winnerCount = body.winnerCount || 1;

      if (winnerCount < 1) {
        throw new BadRequestException('winnerCount must be at least 1');
      }

      let winners: string[];
      if (winnerCount === 1) {
        const winner = this.spinWheelService.selectWinner(
          body.gameIds,
          previousWinners,
        );
        winners = [winner];
      } else {
        winners = this.spinWheelService.selectMultipleWinners(
          body.gameIds,
          winnerCount,
          previousWinners,
        );
      }

      return {
        success: true,
        winners: winners,
        winnerCount: winners.length,
        totalParticipants: body.gameIds.length,
        availableParticipants: body.gameIds.length - previousWinners.length,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

