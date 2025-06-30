import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { AuthDto } from './dto/create-auth.dto';
import { IUser } from 'src/users/interface/user.interface';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer'; 
import { randomBytes } from 'crypto';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}



  async signUp(createUserDto: CreateUserDto): Promise<any> {
    // Check if user exists
    const userExists = await this.usersService.findByemail(
      createUserDto.email,
    );
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hash = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
   const user = await newUser.save();
    return user;
  }

	async signIn(data: AuthDto) {
    // Check if user exists
    const user = await this.usersService.findByemail(data.email);
    if (!user) throw new BadRequestException('User does not exist');
    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return {tokens,user};
  }

	async logout(userId: string) {
    return this.usersService.update(userId, { refreshToken: null });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgetPassword(email:string ):Promise<{message:string;status:number}> {

    const user = await this.usersService.findByemail(email)
    if (!user)
    {
      throw new NotFoundException('Aucun utilisateur trouvé avec cet email')
    }

    // Configuration de Nodemailer
    const token = randomBytes(32).toString('hex')
    await this.usersService.update(user.id,{resetpasswordtoken:token ,resetpasswordexpires:Date.now()+3600000})
    const reseturl = `${ this.configService.get(process.env.FRONT_URL)}/restpassword?token=${token}`


        const transporter = nodemailer.createTransport({
      host:  this.configService.get(process.env.SMTP_host),
      port: this.configService.get(process.env.SMTP_port),
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: this.configService.get(process.env.SMTP_USER) ,
        pass: this.configService.get(process.env.SMTP_PASS),
      },
    });


   const mailOptions = {
  from:`'support' <${this.configService.get(process.env.SMTP_USER)}>`,
  to: user.email,
 subject:'Rest Password Email ',
 html:`<p>Bonjour, pour réinitialisé votre mot de passe </p> <br> 
 Lien : <a href="${reseturl}">   Reset votre mot de passe </a> 
 <p>Ce lien expire dans 1 heure </p>
   `
};

try{
await transporter.sendMail(mailOptions)
return {status:200,message : 'Email de réinitialisation envoyé'}

}
catch(error)
{
console.error('error sendmail',error)
throw new BadRequestException("echec de l'envoi de l'email'")
}
  }

async resetpassword (token : string, newpassword:string ):Promise<{message:string}>
{

  const user =  await this.userModel.findOne({resetpasswordtoken : token,resetpasswordexpires:{$gt:Date.now()}})

  if (!user) {
    throw new BadRequestException('Token invalide ou expiré')
  }

  const hashed = await argon2.hash(newpassword)
  user.password = hashed
  user.resetpasswordtoken = null
  user.resetpasswordexpires= null

  await user.save()

  return {message:'Reset password avec succès'}

}

}