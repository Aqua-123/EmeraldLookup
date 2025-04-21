import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

export const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

/**
 * Gets WebSocket URL from the Emerald Chat web page
 * @returns The WebSocket URL or null if not found
 */
export async function getWsUrl(): Promise<string | null> {
  const url = "https://emeraldchat.com/app";
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    Cookie: config.main_cookie,
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    TE: "trailers",
  };

  try {
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const metaTag = $('meta[name="action-cable-url"]');

      if (metaTag.length > 0) {
        const wsUrl = metaTag.attr("content");
        console.log(`Meta Tag Found: ${wsUrl}`);
        return wsUrl || null;
      } else {
        console.log("Meta tag with name 'action-cable-url' not found.");
        return null;
      }
    } else {
      console.log(
        `Failed to fetch the document. Status code: ${response.status}`
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching WebSocket URL:", error);
    return null;
  }
}
