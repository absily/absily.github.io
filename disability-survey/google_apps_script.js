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

// Handle GET requests (for testing in browser)
function doGet(e) {
    return handleRequest(e);
}

// Handle POST requests (from the form)
function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Log the event for debugging
        Logger.log(JSON.stringify(e));

        // Check if headers exist, if not add them
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(["Timestamp", "Name", "Email", "Disability Type"]);
        }

        var params = e.parameter || {};

        var name = params.name || "Test Name";
        var email = params.email || "test@email.com";
        var disability_type = params.disability_type || "Test Type";

        // Append data
        sheet.appendRow([new Date(), name, email, disability_type]);

        return ContentService.createTextOutput(JSON.stringify({ "result": "success", "message": "Data saved" })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        Logger.log("Error: " + error.toString());
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}
