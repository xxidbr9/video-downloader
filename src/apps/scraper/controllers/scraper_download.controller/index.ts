import { errResp } from "@/utils/helpers/request.helper";
import { RequestHandler } from "express";
import httpStatus from "http-status";

import { googleHandler } from "./google";
import { doodsHandler } from "./doods";
import { tiktokHandler } from "./tiktok";

const PARAM_KEY = 'url';
export const scraperDownloaderController: RequestHandler = async (...args) => {
  const url = args[0].params[PARAM_KEY];
  if (url.includes('google.com')) return googleHandler(...args);
  else if (url.includes('doods')) return doodsHandler(...args);
  else if (url.includes('tiktok')) return tiktokHandler(...args);
  else {
    return args[1].status(httpStatus.SERVICE_UNAVAILABLE).json(errResp("service not found"));
  }
}

