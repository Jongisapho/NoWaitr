import express from "express";
import cors from "cors";
import queueRouter from "./routes/queue";
import customerRouter from "./routes/customers";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/queues", queueRouter);
app.use("/api/customers", customerRouter);

export default app;