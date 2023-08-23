import { RequestHandler } from "express";
import puppeteer from "puppeteer";

export const googleHandler: RequestHandler = async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new"
    });
    const page = await browser.newPage();
    await page.goto('https://google.com'); // Replace with the URL you want to scrape

    // Perform scraping or other actions using Puppeteer
    const pageTitle = await page.title();

    await browser.close();

    res.send(`Page title: ${pageTitle}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
}