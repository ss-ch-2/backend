import { ApiProperty } from "@nestjs/swagger";
import { Contains, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto  {
    @ApiProperty({
        type:String,
        description:"This email is required",
        })
    @IsString()
    @IsNotEmpty()
    @Contains('@')
    @Contains('.')
    email: string;

     @ApiProperty({
        type:String,
        description:"This password is required",
        })
    @IsString()
    @IsNotEmpty()  
    password: string;
}
