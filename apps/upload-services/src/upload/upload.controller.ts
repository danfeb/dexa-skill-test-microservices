import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ServiceError,
  UPLOAD_MESSAGE_PATTERNS,
  UploadFilePayloadDto,
  UploadFileResult,
} from '@app/common';
import { UploadService } from './upload.service.js';

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @MessagePattern(UPLOAD_MESSAGE_PATTERNS.UPLOAD_FILE)
  uploadFile(
    @Payload() inputDto: UploadFilePayloadDto,
  ): Promise<UploadFileResult | ServiceError> {
    return this.uploadService.uploadFile(inputDto);
  }
}
