import express from "express";
import passport from "passport";

export default function authRoutes() {
  const router = express.Router();

  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      successRedirect: "/success", //User profile + documents
      failureRedirect: "/fail", //redirect back to login page
    })
  );

  router.get("/logout", async (req, res, next) => {
    try {
        await req.logout();
        res.redirect("/");
    } catch (error) {
        next(error);
    }
  });

  return router;
}
