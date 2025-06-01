import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";
export class CreateUserDto {
    
    @ApiProperty({
      type: String,
      description: 'username',
    })
    @IsString()
    @IsNotEmpty()
    username: string;
    

      @ApiProperty({
        type: String,
        description: 'email',
      })
    @IsString()
    @IsNotEmpty()
    email: string;
    

      @ApiProperty({
        type: String,
        description: 'password',
      })
    @IsString()
    @IsNotEmpty()
    password: string;
    

      @ApiProperty({
        type: String,
        description: 'Language',
      })
    @IsString()
  //  @MaxLength(30)
    @IsNotEmpty()
    language: string;

    refreshToken: string;
  
}