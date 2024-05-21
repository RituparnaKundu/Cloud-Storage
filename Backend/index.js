import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors"; // Import the cors package
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import fileRoutes from "./routes/files.js";
import emailRoutes from "./routes/email.js";

import redisClient from "./redisClient.js";
 

redisClient.on('error', (err) => {
    console.log('Error occured while connecting or accessing redis server');
});
const app = express();
dotenv.config();
console.log(process.env.MONGO_URI);
const PORT = process.env.PORT || 3001;
const mongouri = process.env.MONGO_URI;

const corsOptions = {
  exposedHeaders: '*',
}; 


 
app.use(cors(corsOptions)); // Enable CORS for all origins
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/files", fileRoutes);
app.use('/email', emailRoutes);

app.get("/", (req, res) => {
  res.json({ message: "This is Home Route" });
});

app.post("/test", async (req, res) => {
  const { key, value } = req.body;

  // Set data in Redis
  const response = await client.set(key, value);

  // Respond with the Redis response
  res.json(response);
});

app.get("/test", async (req, res) => {
  // Get all data and value
  const response = await client.get("123");
  res.json(response);
});

redisClient.on("connect", () => {
  console.log("Redis client connected");
}
);

mongoose
  .connect(mongouri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // const redisClient = redis.createClient(); // Create Redis client
    // Additional Redis client setup if needed
    
    app.listen(PORT, () => console.log("Server running on PORT " + PORT));
  });
