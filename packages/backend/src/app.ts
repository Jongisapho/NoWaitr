import express from "express";
import cors from "cors";
import queueRouter from "./routes/queue";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/queues", queueRouter);

export default app;