import session from 'express-session';
import connectMongo from 'connect-mongo';
import { env } from './env.js';

export function createSessionConfig() {
  const store = connectMongo.create({
    mongoUrl: env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: env.SESSION_MAX_AGE_MS / 1000,
    autoRemove: 'native',
  });

  return session({
    store,
    name: env.SESSION_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.SESSION_COOKIE_SECURE,
      sameSite: env.SESSION_COOKIE_SAME_SITE,
      maxAge: env.SESSION_MAX_AGE_MS,
    },
  });
}
