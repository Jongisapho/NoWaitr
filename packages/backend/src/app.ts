import express from "express";
import cors from "cors";
import queueRouter from "./routes/queue";
import customerRouter from "./routes/customers";
import businessRouter from "./routes/business";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/queues", queueRouter);
app.use("/api/customers", customerRouter);
app.use("/api/business", businessRouter);


app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});


export default app;