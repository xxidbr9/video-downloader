import { Router } from "express";
import { SCRAPER_API_PATH } from "./scraper.constant";
import scraperController from "./controllers";
import { scraperApiKeyMiddleware } from "./middlewares";

const router = Router();

router.get(`${SCRAPER_API_PATH}/ping`, [scraperApiKeyMiddleware, scraperController.scraperPingController])
router.get(`${SCRAPER_API_PATH}/:url`, [scraperController.scraperDownloaderController])
export default router;