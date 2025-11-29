function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = e.parameter.action;
    
    if (action === 'sync') {
      return syncData(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function syncData(payload) {
  const result = {};
  
  // Sync each table
  if (payload.users) result.users = syncTable('Users', payload.users, ['id', 'name', 'email', 'password', 'role', 'outlet_id', 'created_at', 'updated_at']);
  if (payload.outlets) result.outlets = syncTable('Outlets', payload.outlets, ['id', 'name', 'address', 'phone', 'created_at', 'updated_at']);
  if (payload.categories) result.categories = syncTable('Categories', payload.categories, ['id', 'name', 'outlet_id', 'created_at', 'updated_at']);
  if (payload.products) result.products = syncTable('Products', payload.products, ['id', 'name', 'image', 'stock', 'description', 'price', 'category_id', 'outlet_id', 'created_at', 'updated_at']);
  if (payload.transactions) result.transactions = syncTable('Transactions', payload.transactions, ['id', 'outlet_id', 'items', 'total', 'date', 'payment_method', 'created_at', 'updated_at']);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function syncTable(sheetName, localItems, columns) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  // Create sheet if not exists
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(columns);
  }
  
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  const remoteItems = [];
  
  // Map remote items
  for (let i = 1; i < values.length; i++) {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = values[i][index];
    });
    remoteItems.push(item);
  }
  
  // Merge Logic:
  // 1. Update Remote with Local (if Local is newer or new)
  localItems.forEach(local => {
    const remoteIndex = remoteItems.findIndex(r => r.id == local.id);
    
    if (remoteIndex >= 0) {
      // Exists, check timestamp (simple check: local wins for now as requested "data yang di local tersimpan di database")
      // In real app, compare updated_at
      const rowIndex = remoteIndex + 1 + 1; // +1 for header, +1 for 1-based index
      const rowData = columns.map(col => {
          if (col === 'items') return JSON.stringify(local[col]);
          return local[col];
      });
      sheet.getRange(rowIndex, 1, 1, columns.length).setValues([rowData]);
      
      // Update in-memory remoteItems to reflect change
      remoteItems[remoteIndex] = local;
    } else {
      // New item
      const rowData = columns.map(col => {
          if (col === 'items') return JSON.stringify(local[col]);
          return local[col] || '';
      });
      sheet.appendRow(rowData);
      remoteItems.push(local);
    }
  });
  
  // Return all remote items (merged) to client
  return remoteItems;
}

function doGet(e) {
  return ContentService.createTextOutput("POS Backend V2 is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}
