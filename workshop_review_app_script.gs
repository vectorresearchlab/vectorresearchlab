const SHEET_ID = '1SnULOHqs0RTKzA2Wzfks4W-u2-nCrW8uL_73bVXjtZs';

// Expected Google Sheet headers in row 1:
// Timestamp | Name | Email | WhatsApp | Institution | Level | Rating |
// What Learned | Recommend | Suggestions | Public Permission | Workshop
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getActiveSheet();

    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.whatsapp || '',
      data.institution || '',
      data.level || '',
      data.rating || '',
      data.whatLearned || '',
      data.recommend || '',
      data.suggestions || '',
      data.publicPermission || 'No',
      data.workshop || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('Review doPost error: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'workshop-review' }))
    .setMimeType(ContentService.MimeType.JSON);
}
