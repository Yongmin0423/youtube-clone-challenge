import "./db";
import express from "express";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import rootRouter from "./routers/rootRouter";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

const PORT = 4200;

const app = express();
const logger = morgan("dev");

//express에게 view engine으로 pug를 사용할 것을 설정
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use("/ffmpeg", express.static("node_modules/@ffmpeg"));
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
  })
);
app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/api", apiRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
