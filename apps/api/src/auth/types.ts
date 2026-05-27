import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
}
