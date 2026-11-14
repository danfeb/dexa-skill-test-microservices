import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_REQUIRED, UploadFileResult } from '@app/common';
import { UploadService } from './upload.service.js';

@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Headers('x-file-sha256') fileSha256: string | undefined,
  ): Promise<UploadFileResult> {
    if (!file) {
      throw new BadRequestException(FILE_REQUIRED);
    }

    return this.uploadService.uploadFile(file, fileSha256);
  }
}
