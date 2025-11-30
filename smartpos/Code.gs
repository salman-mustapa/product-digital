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
  if (payload.users) result.users = syncTable('Users', payload.users, ['id', 'name', 'email', 'password', 'role', 'outlet_id', 'deleted', 'created_at', 'updated_at']);
  if (payload.outlets) result.outlets = syncTable('Outlets', payload.outlets, ['id', 'name', 'address', 'phone', 'type', 'parent_id', 'deleted', 'created_at', 'updated_at']);
  if (payload.categories) result.categories = syncTable('Categories', payload.categories, ['id', 'name', 'outlet_id', 'deleted', 'created_at', 'updated_at']);
  if (payload.products) result.products = syncTable('Products', payload.products, ['id', 'name', 'image', 'stock', 'description', 'price', 'category_id', 'outlet_id', 'deleted', 'created_at', 'updated_at']);
  if (payload.transactions) result.transactions = syncTable('Transactions', payload.transactions, ['id', 'outlet_id', 'items', 'total', 'date', 'payment_method', 'user_id', 'user_name', 'outlet_name', 'deleted', 'created_at', 'updated_at']);
  
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
  
  // Update Headers if new columns exist
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1);
  let headers = headerRange.getValues()[0];
  
  // If sheet is empty (newly created but appendRow might have failed or logic above)
  if (!headers || headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
      sheet.appendRow(columns);
      headers = columns;
  }

  const missingColumns = columns.filter(col => !headers.includes(col));
  if (missingColumns.length > 0) {
    // Append missing columns to header
    const startCol = headers.length + 1;
    sheet.getRange(1, startCol, 1, missingColumns.length).setValues([missingColumns]);
    // Refresh headers
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }
  
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  // headers is already fresh
  const remoteItems = [];
  
  // Map remote items
  // Start from row 1 (index 1) as row 0 is header
  for (let i = 1; i < values.length; i++) {
    const item = {};
    headers.forEach((header, index) => {
      // Only map if header is not empty
      if (header) item[header] = values[i][index];
    });
    remoteItems.push(item);
  }
  
  // Merge Logic
  localItems.forEach(local => {
    const remoteIndex = remoteItems.findIndex(r => r.id == local.id);
    
    // Prepare row data based on ACTUAL sheet headers
    const rowData = headers.map(header => {
        let val = local[header];
        if (header === 'items' && typeof val === 'object') val = JSON.stringify(val);
        if (val === undefined || val === null) val = '';
        
        const strVal = String(val);
        if (strVal.length > 49000) return '[DATA_TOO_LARGE]';
        return val;
    });
    
    if (remoteIndex >= 0) {
      // Update existing
      const rowIndex = remoteIndex + 2; // +1 for header, +1 for 1-based index
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
      remoteItems[remoteIndex] = local;
    } else {
      // Insert new
      sheet.appendRow(rowData);
      remoteItems.push(local);
    }
  });
  
  return remoteItems;
}

function doGet(e) {
  const action = e.parameter.action;
  
  if (action) {
    // For GET requests, we might not have a payload, but syncData expects one.
    // However, getProducts/getTransactions are usually GETs.
    // But our syncData function is designed for a full sync payload.
    // Let's make a simple handler for GETs.
    
    if (action === 'getProducts') {
      const products = readTable('Products');
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: products }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getTransactions') {
      const transactions = readTable('Transactions');
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: transactions }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'getUsers') {
      const users = readTable('Users');
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: users }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'getOutlets') {
      const outlets = readTable('Outlets');
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: outlets }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput("POS Backend V2 is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function readTable(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const results = [];
  
  for (let i = 1; i < data.length; i++) {
    const item = {};
    headers.forEach((h, index) => {
      let val = data[i][index];
      if (h === 'items') {
        try { val = JSON.parse(val); } catch(e) { val = []; }
      }
      item[h] = val;
    });
    results.push(item);
  }
  return results;
}
