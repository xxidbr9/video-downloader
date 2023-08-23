import { Router } from "express";
import { scraperRoutes } from "@/apps/scraper";
import morgan from 'morgan';

const appRouter = Router();

appRouter.use(morgan("dev"))
// register router
appRouter.use(scraperRoutes);

export default appRouter;