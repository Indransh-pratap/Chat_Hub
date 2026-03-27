import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              fullName: profile.displayName,
              email,
              profilePic: profile.photos?.[0]?.value,
            });
          } else {
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Warning: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google OAuth will be disabled.");
}

export default passport;