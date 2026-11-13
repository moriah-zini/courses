// Google Apps Script backend for "Our Groceries"
// -------------------------------------------------------------
// Instructions:
// 1. Open your Google Spreadsheet in Google Drive.
// 2. Click "Extensions" > "Apps Script".
// 3. Replace all existing code in Code.gs with the code below.
// 4. Click "Deploy" > "Manage deployments" > Edit (pencil icon) > choose "New version" > click "Deploy".
//    (Make sure "Who has access" is set to "Anyone").
// -------------------------------------------------------------

function getGrocerySheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Safe fallback: uses "Groceries", "Sheet1", or simply the first tab
  var sheet = ss.getSheetByName("Groceries") || ss.getSheetByName("Sheet1") || ss.getSheets()[0];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["id", "text", "checked"]);
  }
  return sheet;
}

function doGet() {
  var sheet = getGrocerySheet();
  var data = sheet.getDataRange().getValues();
  var items = [];
  
  // Skip header row (row index 0)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] !== "" && row[0] !== undefined) {
      items.push({
        id: String(row[0]),
        text: String(row[1] || ""),
        checked: Boolean(row[2])
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(items))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = getGrocerySheet();
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var item = contents.item || {};
    var id = String(contents.id || item.id || "");
    
    var data = sheet.getDataRange().getValues();
    
    if (action === "add") {
      sheet.appendRow([item.id, item.text, Boolean(item.checked)]);
    } else if (action === "update") {
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === id) {
          if (item.text !== undefined) {
            sheet.getRange(i + 1, 2).setValue(item.text);
          }
          sheet.getRange(i + 1, 3).setValue(Boolean(item.checked));
          break;
        }
      }
    } else if (action === "delete") {
      for (var j = 1; j < data.length; j++) {
        if (String(data[j][0]) === id) {
          sheet.deleteRow(j + 1);
          break;
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
