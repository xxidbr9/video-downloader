
import { ErrorServer } from "@/utils/helpers/error.helper";
import { RequestHandler } from "express";
import puppeteer from "puppeteer";

import { spawn } from 'child_process';
import path from "path";
import { readFromDatabase, writeToDatabase } from "@/utils/db/db";
import { escape } from "querystring";
import { streamVideo } from "../../helpers";

/* 
? TODO 
- [ ] change to rest response
- [ ] add websocket to stream
- [ ] auto stream while download from source
*/

export const doodsHandler: RequestHandler = async (req, res) => {
  try {
    const url = req.query['path'] as string;

    const browser = await puppeteer.launch({
      headless: "new"
    });

    const page = await browser.newPage();
    await page.goto(url);
    const pageTitle = await page.title();
    const title = `${pageTitle.replace(" ", "_")}-${Date.now()}.mp4`
    const videoPath = path.join(__dirname, "../download", title);

    const fromDB = await readFromDatabase(escape(url))
    if (fromDB) {
      return streamVideo(req, res)(fromDB?.path);
    }

    const iframeSelector = 'iframe[src^="/e/"]';
    await page.waitForSelector(iframeSelector);

    // Get the iframe's content frame
    const frameElement = await page.$(iframeSelector);
    if (!frameElement) throw new ErrorServer("gagal");

    const frame = await frameElement.contentFrame();
    if (!frame) throw new ErrorServer("gagal");;

    // Use XPath to select the video element and extract the 'src' attribute
    const xpath = `//*[@id="video_player_html5_api"]`;
    const videoSrc = await frame.evaluate((xpath) => {
      const videoElement = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLVideoElement;

      return videoElement ? videoElement.getAttribute('src') : null;
    }, xpath);

    if (videoSrc) {
      const command = commandWgetDoods(videoSrc, title);
      const wget = spawn('wget', command);

      wget.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      wget.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      wget.on('close', async (code) => {
        if (code === 0) {
          await streamVideo(req, res)(videoPath);
          await writeToDatabase(escape(url), { name: title, path: videoPath });
        } else {
          res.status(500).send('An error occurred during download.');
        }
      });

    } else {
      res.status(404).send('Video URL not found.');
    }

    await browser.close();

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
}

const commandWgetDoods = (videoUrl: string, title: string) => {
  const pathToSave = path.join(__dirname, "../download");
  return [
    '--header=Accept: */*',
    '--header=Accept-Language: en-US,en;q=0.9,la;q=0.8,id;q=0.7',
    '--header=Connection: keep-alive',
    '--header=Range: bytes=0-',
    '--header=Referer: https://doods.pro/',
    '--header=Sec-Fetch-Dest: video',
    '--header=Sec-Fetch-Mode: no-cors',
    '--header=Sec-Fetch-Site: cross-site',
    '--header=User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    '--header=sec-ch-ua: "Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
    '--header=sec-ch-ua-mobile: ?0',
    '--header=sec-ch-ua-platform: "macOS"',
    '--compression=auto',
    `--output-document=${pathToSave}/${title}`,
    '--progress=dot',
    videoUrl
  ];
};
