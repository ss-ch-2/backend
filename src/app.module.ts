import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
      ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath : '.env'
    }),
      MongooseModule.forRoot('mongodb://localhost:27017',{dbName: 'projet_pfe'}),
      UsersModule,
      AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
