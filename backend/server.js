import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import config, { assertConfig } from "./config/index.js";
import { setupSwagger } from "./config/swagger.js";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chats.js";
import authRoutes from "./routes/auth.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan(config.env === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/api", apiLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "novara-ai-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
setupSwagger(app);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  assertConfig();
  await connectDB();

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`API docs available at http://localhost:${config.port}/api/docs`);
  });
};

startServer();

export default app;
