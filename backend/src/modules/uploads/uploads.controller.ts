import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { ApiErrors } from '../../common/swagger/api-errors.decorator';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @ApiOperation({ summary: '[GEN-08] Serve a stored image (public)' })
  @ApiParam({ name: 'filename', example: 'a1b2c3.png' })
  @ApiOkResponse({
    description: 'Image bytes (image/jpeg or image/png)',
    content: {
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiErrors(404)
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
