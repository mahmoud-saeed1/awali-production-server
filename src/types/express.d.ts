/* eslint-disable @typescript-eslint/no-empty-interface */
import { IUser } from "../modules/users/user.model";
import { IRole } from "../modules/roles/role.model";

// Extend Express Request with our custom user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { role?: IRole };
    }
  }
}

// Fix Express 5 ParamsDictionary: params values should be string, not string | string[]
declare module "express-serve-static-core" {
  interface ParamsDictionary {
    [key: string]: string;
    // Override Express 5's default string | string[] to just string
  }
}

export {};
