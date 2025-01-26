import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

const handleOpen = () => console.log("✅Connection to DB");

db.on("error", (error) => console.log("DB Error", error));
db.once("open", handleOpen);
