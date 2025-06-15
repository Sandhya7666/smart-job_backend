// const puppeteer = require("puppeteer-extra");
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// puppeteer.use(StealthPlugin());

// async function scrapeNaukriJobs(keyword = "react developer", location = "India") {
//   const searchUrl = `https://www.naukri.com/${keyword.replace(/\s+/g, "-")}-jobs-in-${location.replace(/\s+/g, "-")}`;

//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   // Listen for browser console logs
//   page.on("console", (msg) => {
//     console.log("📢 BROWSER LOG:", msg.text());
//   });

//   await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 0 });

//   // Wait manually in case dynamic content hasn't finished loading
//   await page.waitForTimeout(3000);

//   const jobs = await page.evaluate(() => {

//     const jobCards = document.querySelectorAll("article.jobTuple");

//     console.log("🔍 Found job cards:", jobCards.length);

//     return Array.from(jobCards).map((card) => {
//       const title = card.querySelector("a.title")?.innerText.trim() || "";
//       const company = card.querySelector(".companyInfo span.comp-name")?.innerText.trim() || "";
//       const experience = card.querySelector("li.experience span")?.innerText.trim() || "";
//       const location = card.querySelector("li.location span")?.innerText.trim() || "";
//       const salary = card.querySelector("li.salary span")?.innerText.trim() || "";
//       const posted = card.querySelector(".type br + span")?.innerText.trim() || "";
//       const link = card.querySelector("a.title")?.href || "";

//       return { title, company, experience, location, salary, posted, link };
//     });
//   });

//   await browser.close();
//   return jobs;
// }

// // Run the function
// scrapeNaukriJobs("full stack developer", "Bangalore")
//   .then((jobs) => {
//     console.log("✅ Jobs Found:", jobs.length);
//     console.dir(jobs, { depth: null });
//   })
//   .catch((err) => {
//     console.error("❌ Error occurred:", err);
//   });

const puppeteer = require("puppeteer");

async function scrapeNaukriJobs() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  page.on("console", (msg) => {
    console.log("📢 BROWSER LOG:", msg.text());
  });

  await page.goto("https://www.naukri.com/software-developer-jobs");

  // Wait for content to load (better than fixed timeout)
  await page.waitForSelector(".jobTuple", { timeout: 10000 });

  // Extract jobs
  const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll(".jobTuple");
      console.log("🚀 ~ jobs ~ jobs:", jobElements);
    return Array.from(jobElements).map((job) => ({
      title: job.querySelector(".title")?.innerText.trim(),
      company: job.querySelector(".companyName")?.innerText.trim(),
      location: job.querySelector(".location")?.innerText.trim(),
      description: job.querySelector(".job-description")?.innerText.trim(),
    }));
  });

  // ✅ Console log all job titles
  console.log(`\n✅ Scraped ${jobs.length} jobs:\n`);

  jobs.forEach((job, index) => {
    console.log(`🔹 Job ${index + 1}`);
    console.log(`   Title      : ${job.title}`);
    console.log(`   Company    : ${job.company}`);
    console.log(`   Location   : ${job.location}`);
    console.log(`   Description: ${job.description?.slice(0, 100)}...\n`);
  });

  await browser.close();
}

scrapeNaukriJobs().catch((err) => console.error("❌ Error occurred:", err));
