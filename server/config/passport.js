import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";

export default function passportConfig(app, db) {

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          const email = profile.emails[0].value;
          const oauthProvider = profile.provider;
          const oauthId = profile.id;
          const name = profile.displayName;
          const avatar = profile.photos[0].value;

          const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );
          if (result.rows.length === 0) {
            const newUser = await db.query(
              "INSERT INTO users (email, oauth_provider, oauth_provider_id, name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
              [email, oauthProvider, oauthId, name, avatar]
            );
            return cb(null, newUser.rows[0]);
          } else {
            return cb(null, result.rows[0]);
          }
        } catch (err) {
          return cb(err);
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, user);
  });

  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });
}