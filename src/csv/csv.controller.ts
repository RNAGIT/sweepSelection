import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvService } from './csv.service';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only CSV files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.csvService.parseCsvFile(file);
      
      if (result.gameIds.length === 0) {
        throw new BadRequestException('No game IDs found in CSV file');
      }

      return {
        success: true,
        message: 'CSV file uploaded and parsed successfully',
        totalGameIds: result.gameIds.length,
        originalCount: result.originalCount,
        duplicateCount: result.duplicateCount,
        duplicates: result.duplicates,
        gameIds: result.gameIds,
      };
    } catch (error) {
      throw new BadRequestException(`Error parsing CSV: ${error.message}`);
    }
  }

  @Post('random-ids')
  async getRandomIds(@Body() body: { gameIds: string[]; count: number }) {
    if (!body.gameIds || !Array.isArray(body.gameIds)) {
      throw new BadRequestException('gameIds must be an array');
    }

    if (!body.count || body.count < 1) {
      throw new BadRequestException('count must be a positive number');
    }

    const randomIds = this.csvService.getRandomIds(body.gameIds, body.count);

    return {
      success: true,
      randomIds: randomIds,
      count: randomIds.length,
    };
  }
}

