import express from "express";
import session from "express-session";
import cors from "cors";
import bodyParser from "body-parser";
import passportConfig from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

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

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

passportConfig(app, db);

app.use("/auth", authRoutes());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

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
