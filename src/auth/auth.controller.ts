import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/create-auth.dto';
import { Public } from 'src/decorators/public.decorator';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

type JwtPayload = {
  sub: string;
  username: string;
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }
  @ApiBearerAuth('access-token')
  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request) {
    const user = req.user as {userId:string}
    return this.authService.logout(user.userId);
  }
}