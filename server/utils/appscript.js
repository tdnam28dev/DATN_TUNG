function doGet(request) {
  var parameters = 5;
  var sheet = SpreadsheetApp.openById("Sheet_ID").getSheetByName("sheet1");
  // Lấy tên các cột
  var headnames = sheet.getRange(1, 1, 1, parameters).getValues()[0];

  // Lấy tất cả dữ liệu từ bảng tính
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(lastRow - 1, 1, 2, parameters);
  // Lấy 2 giao dịch cuối cùng
  var values = range.getValues();

  var rows = [];
  values.forEach(function (row) {
    var newRow = {};
    headnames.forEach(function (item, index) {
      newRow[item] = row[index];
    });
    rows.push(newRow);
  });

  return ContentService.createTextOutput(
    JSON.stringify({ data: rows, error: false })
  ).setMimeType(ContentService.MimeType.JSON);
}
