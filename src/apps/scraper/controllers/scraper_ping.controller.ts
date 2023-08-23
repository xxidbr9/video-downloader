import { okResp } from "@/utils/helpers/request.helper";
import { RequestHandler } from "express";
import status from 'http-status';


export const scraperPingController: RequestHandler = (req, res) => {
  return res.status(status.OK).json(okResp("success", { ping: "PONG!" }))
}