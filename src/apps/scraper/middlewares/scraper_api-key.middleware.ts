import { RequestHandler } from "express"
import { SCRAPER_X_API_KEY } from "../scraper.constant";
import { errResp } from "@/utils/helpers/request.helper";
import httpStatus from "http-status";

export const scraperApiKeyMiddleware: RequestHandler = (req, res, next) => {
  const apiKeyHeader = req.headers["x-api-key-scraper"];
  if (!!apiKeyHeader && apiKeyHeader === SCRAPER_X_API_KEY) return next();
  return res.status(httpStatus.UNAUTHORIZED).json(errResp("api key not valid!"));
}
