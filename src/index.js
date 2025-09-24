import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import VehicleRoutes from "./routes/vehicleRoutes.js";
import BookingRoutes from "./routes/BookingRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3500",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/vehicles", VehicleRoutes);
app.use("/api/booking", BookingRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;

mongoose.connect(MONGO_URI);
mongoose.connection.once("open", () => {
  console.log("MongoDb Connected Succefully");

  app.listen(PORT, () => console.log(`server running on port ${PORT}`));
});
