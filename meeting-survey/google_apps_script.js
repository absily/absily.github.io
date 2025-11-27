// This script should be put in a Google Apps Script project attached to a Google Sheet.

function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the incoming JSON data
    var data = JSON.parse(e.postData.contents);

    // Note: Phone number duplicate check removed as requested.
    // We are now just appending the data.

    // Append the data
    // Order: Timestamp, Name, City, Q1, Q2, Q3, Q4, Q5
    sheet.appendRow([
        new Date(),
        data.fullName,
        data.city,
        data.q1,
        data.q2,
        data.q3,
        data.q4,
        data.q5
    ]);

    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' })).setMimeType(ContentService.MimeType.JSON);
}

function setup() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Updated headers to replace Phone Number with City
    var headers = ["Timestamp", "Full Name", "City/Region", "Q1: Financial", "Q2: Equipment", "Q3: Redress", "Q4: Communication", "Q5: Optimism"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#d4af37");
}
