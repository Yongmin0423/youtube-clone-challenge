import "dotenv/config";
import "./db";
import "./models/Video";
import app from "./server";

const PORT = 4200;

app.listen(4200, () =>
  console.log(`Server Listening on port http://localhost:${PORT}`)
);
