
import express  from "express";
import appRouter from "@/routers";
const app = express();
const PORT = 9000;

(async () => {
  // register all router
  app.use(appRouter);
  app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`);
  });
})();