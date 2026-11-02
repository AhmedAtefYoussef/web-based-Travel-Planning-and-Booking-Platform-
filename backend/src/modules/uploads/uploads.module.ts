import { Global, Module } from '@nestjs/common';
import { UPLOADS_SERVICE } from '../../common/contracts/tokens';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Global()
@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    { provide: UPLOADS_SERVICE, useExisting: UploadsService },
  ],
  exports: [UPLOADS_SERVICE],
})
export class UploadsModule {}
