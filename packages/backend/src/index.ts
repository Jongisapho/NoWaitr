import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT ?? 400;
app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});