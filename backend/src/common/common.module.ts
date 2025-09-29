import { Module, Global } from '@nestjs/common';
import { PasswordService } from './services';

@Global()
@Module({
  providers: [PasswordService],
  exports: [PasswordService],
})
export class CommonModule {}