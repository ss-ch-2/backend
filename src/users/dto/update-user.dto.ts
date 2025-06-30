import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    refreshToken ?:string

    
    @IsString()
    resetpasswordtoken ? : string

    @IsOptional()
    resetpasswordexpires ? : Number
    

}
