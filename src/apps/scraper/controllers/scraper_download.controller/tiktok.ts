import path from "path";
import { RequestHandler } from "express";
import puppeteer, { HTTPRequest } from "puppeteer";
import { spawn } from "child_process";
import { readFromDatabase, writeToDatabase } from "@/utils/db/db";
import { escape } from "querystring";
import { streamVideo } from "../../helpers";

export const tiktokHandler: RequestHandler = async (req, res) => {
  try {
    const url = req.query['path'] as string;

    const browser = await puppeteer.launch({
      headless: "new"
    });

    const page = await browser.newPage();
    await page.goto(url);
    const title = `${Date.now()}.mp4`
    const videoPath = path.join(__dirname, "../download", title);

    const fromDB = await readFromDatabase(escape(url))
    if (fromDB) {
      return streamVideo(req, res)(fromDB?.path);
    }
    await page.setRequestInterception(true);
    const result: { request_url: string, request_headers: Record<string, string> }[] = []

    page.on('request', async (request: HTTPRequest) => {
      try {
        const request_url = request.url();
        const request_headers = request.headers();
        if (request_url.includes("webapp-prime.tiktok.com")) {
          result.push({
            request_url,
            request_headers,
          });
        }
        request.continue();
      } catch (error) {
        console.error(error);
        request.abort();
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    const videoSrc = result[0].request_url
    if (videoSrc) {

      const command = commandWgetTiktok({ cookie: result[0].request_headers?.['cookie'] || "", title, videoUrl: videoSrc });
      const wget = spawn('wget', command, { shell: true });

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

type CommandWgetTiktokArgsType = { videoUrl: string, title: string, cookie: string }
const commandWgetTiktok = ({ videoUrl, title, cookie }: CommandWgetTiktokArgsType) => {
  const pathToSave = path.join(__dirname, "../download");
  return [
    `--header="accept: */*"`,
    `--header="accept-language: en-US,en;q=0.9,la;q=0.8,id;q=0.7"`,
    `--header="cookie: ${cookie}"`,
    `--header="origin: https://www.tiktok.com"`,
    `--header="referer: https://www.tiktok.com/"`,
    `--header="sec-ch-ua: \\"Chromium\\";v=\\"116\\", \\"Not)A;Brand\\";v=\\"24\\", \\"Google Chrome\\";v=\\"116\\""`,
    `--header="sec-ch-ua-mobile: ?0"`,
    `--header="sec-ch-ua-platform: \\"macOS\\""`,
    `--header="sec-fetch-dest: empty"`,
    `--header="sec-fetch-mode: cors"`,
    `--header="sec-fetch-site: same-site"`,
    `--header="user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"`,
    `--compression=auto`,
    `--output-document=${pathToSave}/${title}`,
    '--progress=dot',
    `"${videoUrl}"`
  ];
};
