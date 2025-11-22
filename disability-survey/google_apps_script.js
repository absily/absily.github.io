// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Delete any code there and paste this code
// 4. Click "Deploy" > "New deployment"
// 5. Select type: "Web app"
// 6. Description: "Survey API"
// 7. Execute as: "Me"
// 8. Who has access: "Anyone" (IMPORTANT)
// 9. Click "Deploy"
// 10. Copy the "Web App URL" and paste it into public/script.js

function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Check if headers exist, if not add them
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Name", "Email", "Disability Type"]);
    }

    var params = e.parameter;

    var name = params.name;
    var email = params.email;
    var disability_type = params.disability_type;

    // Simple validation
    if (!name || !email || !disability_type) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Missing data" })).setMimeType(ContentService.MimeType.JSON);
    }

    // Append data
    sheet.appendRow([new Date(), name, email, disability_type]);

    // Return success
    // Note: When using 'no-cors' in fetch, the browser won't see this JSON response, 
    // but it's good practice to return it for other clients or debugging.
    return ContentService.createTextOutput(JSON.stringify({ "result": "success", "message": "Data saved successfully" })).setMimeType(ContentService.MimeType.JSON);
}
