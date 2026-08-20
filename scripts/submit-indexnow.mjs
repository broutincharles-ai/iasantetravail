const site = "https://www.iasantetravail.com";
const key = process.env.INDEXNOW_KEY?.trim();
const urls = process.argv.slice(2);

if (!key) {
  throw new Error("INDEXNOW_KEY is required. Generate the key externally and publish its verification file before submitting URLs.");
}

if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  throw new Error("INDEXNOW_KEY has an invalid format.");
}

if (!urls.length) {
  throw new Error("Pass at least one absolute canonical URL to submit.");
}

for (const url of urls) {
  if (!url.startsWith(`${site}/`)) throw new Error(`URL outside the canonical domain: ${url}`);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: "www.iasantetravail.com",
    key,
    keyLocation: `${site}/${key}.txt`,
    urlList: [...new Set(urls)]
  })
});

if (!response.ok) {
  throw new Error(`IndexNow rejected the submission (${response.status} ${response.statusText}).`);
}

console.log(`IndexNow accepted ${new Set(urls).size} URL(s) with status ${response.status}.`);
