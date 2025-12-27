const fs = require("fs");
const simpleGit = require("simple-git");
const dayjs = require("dayjs");

const git = simpleGit();

const REPO_NAME = "activity-repo";
const START_YEAR = 2024;
const END_YEAR = 2025;
const MAX_COMMITS_PER_DAY = 2;

async function run() {
  // Create a directory
  if (!fs.existsSync(REPO_NAME)) {
    fs.mkdirSync(REPO_NAME);
  }
  process.chdir(REPO_NAME);

  // Initialize Git repo
  await git.init();
  fs.writeFileSync("README.md", "GitHub Activity Generator\n");

  await git.add(".");
  await git.commit("Initial commit");

  // Loop through years and days
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= 28; day++) {
        // keep it simple
        const date = dayjs(`${year}-${month + 1}-${day} 12:00:00`);
        const commitCount = Math.floor(Math.random() * MAX_COMMITS_PER_DAY) + 1;

        for (let i = 0; i < commitCount; i++) {
          fs.appendFileSync("README.md", `Commit on ${date.toISOString()}\n`);
          await git.add(".");
          await git.commit(`Commit on ${date.format("YYYY-MM-DD HH:mm:ss")}`, {
            "--date": date.toISOString(),
          });
        }
      }
    }
  }

  console.log("✅ All contributions generated!");
}

run().catch(console.error);