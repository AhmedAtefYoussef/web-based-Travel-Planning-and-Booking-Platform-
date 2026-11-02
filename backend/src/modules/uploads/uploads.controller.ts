import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Public()
  @Get(':filename')
  serve(@Param('filename') filename: string, @Res() res: Response): void {
    const file = this.uploads.resolveFile(filename);
    if (!file) throw new NotFoundException('File not found');
    res.type(file.mimetype);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(file.path);
  }
}
