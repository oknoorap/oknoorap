const path = require("path");
const handler = require("serve-handler");
const puppeteer = require("puppeteer");
const waitPort = require("wait-port");

const PORT = process.env.PORT;
const isDev = process.env.NODE_ENV !== "production";

module.exports = async (request, response) => {
  await handler(request, response, {
    public: path.join(process.cwd(), "src"),
  });
};

(async () => {
  if (isDev) return;
  try {
    const isPortReady = await waitPort({
      host: "localhost",
      port: parseInt(PORT),
    });

    if (isPortReady) {
      console.log("Opening website!");
    } else {
      console.log("The port did not open before the timeout...");
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}`, {
      waitUntil: "networkidle2",
    });

    await page.pdf({
      path: path.join(process.cwd(), "build", "rpracutian-resume.pdf"),
      format: "letter",
    });

    await browser.close();
    process.exit();
  } catch (err) {
    throw err;
  }
})();
