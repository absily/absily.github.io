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

    // Relaxed validation for debugging
    // Instead of returning error, we will save whatever we get, or "Missing"
    var finalName = name || "Missing Name";
    var finalEmail = email || "Missing Email";
    var finalDisability = disability_type || "Missing Type";

    // Append data
    sheet.appendRow([new Date(), finalName, finalEmail, finalDisability]);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success", "message": "Data saved" })).setMimeType(ContentService.MimeType.JSON);
}
