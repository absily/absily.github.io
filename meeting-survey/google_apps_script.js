// This script should be put in a Google Apps Script project attached to a Google Sheet.

function doGet(e) {
    return ContentService.createTextOutput(JSON.stringify({
        'result': 'success',
        'message': 'Server is running. Send a POST request to submit data.'
    })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    var lock = LockService.getScriptLock();
    // Wait for up to 30 seconds for other processes to finish.
    lock.tryLock(30000);

    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Ensure postData exists
        if (!e || !e.postData || !e.postData.contents) {
            return ContentService.createTextOutput(JSON.stringify({
                'result': 'error',
                'message': 'No data received'
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // Parse the incoming JSON data
        var data = JSON.parse(e.postData.contents);
        var userIp = data.ip_address;

        // 1. Strict IP Duplicate Check
        if (isIpAlreadyRegistered(sheet, userIp)) {
            return ContentService.createTextOutput(JSON.stringify({
                'result': 'error',
                'message': 'Duplicate IP'
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // 2. Append the data
        // Order: Timestamp, IP, Name, City, Q1, Q2, Q3, Q4, Q5
        sheet.appendRow([
            new Date(),
            userIp,
            data.fullName,
            data.city,
            data.q1,
            data.q2,
            data.q3,
            data.q4,
            data.q5
        ]);

        return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            'result': 'error',
            'message': error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function isIpAlreadyRegistered(sheet, ip) {
    if (!ip || ip === 'Unknown') return false;

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return false; // Only headers or empty

    // Assuming IP is in column 2 (index 1)
    for (var i = 1; i < data.length; i++) {
        // Check if row has enough columns
        if (data[i].length > 1 && data[i][1] == ip) {
            return true;
        }
    }
    return false;
}

function setup() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Clear existing headers to be safe
    sheet.getRange(1, 1, 1, 20).clearContent();

    // Detailed Headers as requested
    var headers = [
        "وقت التسجيل (Timestamp)",
        "عنوان IP (IP Address)",
        "الاسم الثلاثي (Full Name)",
        "المدينة / المنطقة (City)",
        "س1: الملف المالي (Financial)",
        "س2: جودة المعدات (Equipment)",
        "س3: إنصاف المتضررين (Redress)",
        "س4: التواصل والشفافية (Communication)",
        "س5: نظرة للمستقبل (Optimism)"
    ];

    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);

    // Styling
    range.setFontWeight("bold")
        .setBackground("#d4af37") // Gold background
        .setFontColor("#000000")
        .setHorizontalAlignment("center")
        .setWrap(true);

    // Freeze top row
    sheet.setFrozenRows(1);

    // Auto resize columns
    sheet.autoResizeColumns(1, headers.length);
}
