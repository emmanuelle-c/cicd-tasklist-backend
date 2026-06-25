import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";

const app = express();

app.use(cors(
    {origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

app.use("/api/tasks", taskRoutes);

export default app;
