/**
 * Waitlist -> Google Sheet ("Waitlist Final")
 *
 * Setup (one time):
 *   1. Open the "Waitlist Final" sheet > Extensions > Apps Script.
 *   2. Replace the contents of Code.gs with this file and save.
 *   3. Deploy > New deployment > type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *      Click Deploy and approve the permission prompt.
 *   4. Copy the Web app URL (ends in /exec) and set it as
 *      VITE_WAITLIST_SHEET_URL in Vercel (or paste it into src/config/api.ts).
 *
 * If you edit this script later, use Deploy > Manage deployments > Edit >
 * Version: New version, so the /exec URL stays the same.
 */

const SPREADSHEET_ID = '1H3eSekkGk2QfgINLkTwglO5lOR3z7z2vDiLRLG8nILc'; // Waitlist Final
const SHEET_NAME = 'Sheet1';
const TEAM_SIZES = ['1', '2-5', '6-20', '20+'];

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot: bots fill the hidden "company" field. Pretend success.
    if (data.company) return json_({ ok: true });

    const email = clean_(data.email, 254);
    if (!email || email.indexOf('@') === -1) return json_({ ok: false, error: 'invalid email' });

    const teamSize = TEAM_SIZES.indexOf(String(data.teamSize)) >= 0 ? String(data.teamSize) : '';

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      SpreadsheetApp.openById(SPREADSHEET_ID)
        .getSheetByName(SHEET_NAME)
        .appendRow([
          new Date(),
          clean_(data.firstName, 100),
          clean_(data.lastName, 100),
          email,
          clean_(data.relation, 200),
          clean_(data.favoriteSong, 300),
          teamSize,
        ]);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Trim, cap length, and stop values being read as formulas. */
function clean_(value, maxLen) {
  let s = String(value == null ? '' : value).trim().slice(0, maxLen);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
