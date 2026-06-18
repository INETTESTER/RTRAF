import http from 'k6/http';

const filename = __ENV.filename || "Hello";
const date = __ENV.date || "Hello";
const id = __ENV.id || "1";
const google_link = __ENV.google_link || "1";
const user = __ENV.user || "1";
const durationx = __ENV.durationx || "1";
const projectname = __ENV.projectname || "1";

const reportPath = `../report/${date}/${filename}.json`;
const jsonData = open(reportPath);

export default function () {

  const startIndex = google_link.indexOf('/d/') + 3;
  const endIndex = google_link.indexOf('/edit');
  const spreadsheetID = google_link.substring(startIndex, endIndex);

  const data = JSON.parse(jsonData);

  // =========================
  // METRICS SAFE LOADER
  // =========================
  const metrics = data.metrics || {};

  const httpDuration = metrics.http_req_duration || {};
  const httpReqs = metrics.http_reqs || {};
  const httpFail = metrics.http_req_failed || {};

  const wsSessions = metrics.ws_sessions || {};
  const isWS = Object.keys(wsSessions).length > 0;

  // =========================
  // WS → HTTP STATUS NORMALIZER
  // =========================
  const normalizeStatus = (status) => {
    if (isWS && status === "101 Switching Protocols") return "200 OK";
    return status;
  };

  // =========================
  // VALUES
  // =========================

  const avg = (httpDuration.avg || 0) / 1000;
  const min = (httpDuration.min || 0) / 1000;
  const max = (httpDuration.max || 0) / 1000;
  const p90 = (httpDuration["p(90)"] || 0) / 1000;
  const p95 = (httpDuration["p(95)"] || 0) / 1000;

  const request = httpReqs.count || 0;
  const tps = (httpReqs.rate || 0).toFixed(2);

  const error = httpFail.passes || 0;

  const testtime = tps > 0 ? Math.ceil(request / tps) : 0;

  // =========================
  // CHECKS SAFE
  // =========================

  const checks = data.root_group?.checks || {};

  const getCheck = (name) => checks[name]?.passes || 0;

  // 🔥 APPLY WS mapping here
  const e200 = getCheck(normalizeStatus('200 OK')) || getCheck('101 Switching Protocols');
  const e201 = getCheck('201 Created');
  const e204 = getCheck('204 No Content');

  const e400 = getCheck('400 Bad Request');
  const e401 = getCheck('401 Unauthorized');
  const e403 = getCheck('403 Forbidden');
  const e404 = getCheck('404 Not Found');
  const e422 = getCheck('422 Unprocessable Content');
  const e429 = getCheck('429 Too Many Requests');

  const e500 = getCheck('500 Internal Server Error');
  const e502 = getCheck('502 Bad Gateway');
  const e503 = getCheck('503 Service Unavailable');
  const e504 = getCheck('504 Gateway Timeout');

  const unknown =
    request - (e200 + e201 + e204 + e400 + e401 + e403 + e404 + e422 + e429 + e500 + e502 + e503 + e504);

  const sumerror =
    error - (unknown + e400 + e401 + e403 + e404 + e422 + e429 + e500 + e502 + e503 + e504);

  const finalunknown = unknown + sumerror;

  // =========================
  // TIME
  // =========================

  const now = new Date();
  const startTime = new Date(now.getTime() - (testtime * 1000));

  function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:` +
      `${date.getMinutes().toString().padStart(2, '0')}:` +
      `${date.getSeconds().toString().padStart(2, '0')}`;
  }

  // =========================
  // LOG
  // =========================

  console.log("API: " + projectname);
  console.log("ID: " + id);
  console.log("TYPE: " + (isWS ? "WEBSOCKET" : "HTTP"));
  console.log("==============================");
  console.log(`Request: ${request}`);

  const filteredPasses = Object.keys(checks)
    .filter(k => checks[k].passes > 0)
    .map(k => ({ status: k, passes: checks[k].passes }));

  filteredPasses.forEach(item => {
    const normalized = normalizeStatus(item.status);
    const ok = ["200 OK", "201 Created", "204 No Content"].includes(normalized);

    console.log(`${ok ? "✅" : "❌"} ${item.status}: ${item.passes}`);
  });

  if (error !== 0) {
    if (finalunknown !== 0) {
      console.log("❓ Unknown errors : " + finalunknown);
    }
    console.log("⭐ Number of errors : " + error);
  }

  // =========================
  // POST GOOGLE SHEET
  // =========================

  const sheetDB = 'https://script.google.com/macros/s/AKfycbzbMajrXU7q7t08h_iG22gukrzXmyHZnlOxaU30jNUXP0HlsbgB2bAdJM3MmjubZkR_/exec?action=insertsummary';

  const payload2 = {
    projectname,
    request,
    date,
    start: formatTime(startTime),
    end: formatTime(new Date()),
    average: avg,
    min,
    max,
    p90,
    p95,
    tps,
    error,
    id,
    e400,
    e401,
    e403,
    e404,
    e422,
    e429,
    e500,
    e502,
    e503,
    e504,
    eunknow: finalunknown,
    vus: user,
    duration: durationx,
    type: isWS ? "ws" : "http"
  };

  http.post(sheetDB, JSON.stringify(payload2), {
    headers: { 'Content-Type': 'application/json' },
  });

  const urlgetdata = 'https://script.google.com/macros/s/AKfycbzbMajrXU7q7t08h_iG22gukrzXmyHZnlOxaU30jNUXP0HlsbgB2bAdJM3MmjubZkR_/exec?action=getdata';

  http.post(urlgetdata, JSON.stringify({
    projectnames: projectname,
    sheetid: spreadsheetID,
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}