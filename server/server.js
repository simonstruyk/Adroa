import express from "express";
import session from "express-session";
import cors from "cors";
import bodyParser from "body-parser";
import passportConfig from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import docRoutes from "./routes/docRoutes.js";
import dotenv from "dotenv";
import postgresConfig from "./config/postgres.js";
dotenv.config({path: "server/.env"});

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with a strong secret key
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
  })
);

const db = postgresConfig();

passportConfig(app, db);

app.use("/auth", authRoutes());
app.use("/api/documents", isAuthenticated, docRoutes(db));

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized access" });
}

// app.get("/", (req, res) => {
//     console.log("Server Running!");
// })

app.get("/success", (req, res) => {
  res.send("You have successfully logged in!");
});

app.get("/fail", (req, res) => {
  res.send("You have failed to log in!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
