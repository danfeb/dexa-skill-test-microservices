import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UPLOAD_MAX_SIZE_MB } from '@app/common';
import { memoryStorage } from 'multer';
import { UploadController } from './upload.controller.js';
import { UploadService } from './upload.service.js';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: UPLOAD_MAX_SIZE_MB * 1024 * 1024,
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
