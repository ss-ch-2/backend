import { PartialType } from '@nestjs/swagger';
import { AuthDto  } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(AuthDto ) {}
