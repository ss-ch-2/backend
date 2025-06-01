import { Document } from 'mongoose';
export interface IUser extends Document{
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly language: string;
    readonly refreshToken: string;
}