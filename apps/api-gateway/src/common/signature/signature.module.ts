import { Module } from '@nestjs/common';
import { SignatureGuard } from '../guard/signature.guard.js';
import { SignatureService } from './signature.service.js';

@Module({
  providers: [SignatureService, SignatureGuard],
  exports: [SignatureService, SignatureGuard],
})
export class SignatureModule {}
