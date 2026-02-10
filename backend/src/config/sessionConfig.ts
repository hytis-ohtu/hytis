/**
 * Configures session middleware and Passport session handling
 */

import { RedisStore } from "connect-redis";
import { Application } from "express";
import session from "express-session";
import Redis from "ioredis";
import passport from "passport";
import { config, isProduction } from "./environmentConfig";

export const configureSession = async (app: Application): Promise<void> => {
  const sessionOptions = await createSessionOptions();
  app.use(session(sessionOptions));

  app.use(passport.initialize());
  app.use(passport.session());

  configurePassportSerialization();
};

const createSessionOptions = async (): Promise<session.SessionOptions> => {
  if (isProduction) {
    console.log("Setting up Redis session store for production");

    const redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    });

    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    redisClient.on("connect", () => console.log("Connected to Redis"));

    const redisStore = new RedisStore({
      client: redisClient,
      prefix: "sess:",
    });

    return {
      store: redisStore,
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true, // HTTPS only in production
        httpOnly: true, // XSS protection
        maxAge: config.sessionMaxAge,
        sameSite: "lax",
      },
    };
  } else {
    console.log("Using memory store for sessions (development only)");
    return {
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // HTTP only for development
        httpOnly: true, // XSS protection
        maxAge: config.sessionMaxAge,
        sameSite: "lax",
      },
    };
  }
};

const configurePassportSerialization = (): void => {
  passport.serializeUser(
    (
      user: Express.User,
      done: (err: Error | null, id?: Express.User) => void,
    ) => {
      done(null, user);
    },
  );
  passport.deserializeUser(
    (
      user: Express.User,
      done: (err: Error | null, user?: Express.User) => void,
    ) => {
      done(null, user);
    },
  );
};
