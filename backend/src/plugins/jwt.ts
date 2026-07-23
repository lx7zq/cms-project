import { jwt } from '@elysiajs/jwt';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env");
}

export const jwtPlugin = jwt({
  name: "jwt",
  secret: process.env.JWT_SECRET,
  exp: "1h", // access token อายุสั้น
});

export const jwtRefreshPlugin = jwt({
  name: "jwtRefresh",
  secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
  exp: "7d", // refresh token อายุยาว
});
