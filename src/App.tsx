// ════════════════════════════════════════════════════════════════════════════
// HABLA PERRO — Quiz Results Receiver
// Google Apps Script — paste this entire file into your Apps Script editor
//
// SETUP (one time, ~10 minutes):
// 1. Open your Google Sheet (or create a new one)
// 2. Click Extensions → Apps Script
// 3. Delete everything in the editor, paste this entire file
// 4. Change SHEET_NAME and DRIVE_FOLDER_ID below
// 5. Click Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy the deployment URL
// 7. Paste it into App.tsx where it says PASTE_YOUR_APPS_SCRIPT_URL_HERE
// ════════════════════════════════════════════════════════════════════════════

// ── CONFIG ───────────────────────────────────────────────────────────────────
const SHEET_NAME     = 'Resultados';      // Name of the tab in your Google Sheet
const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID'; // Google Drive folder ID for PDF storage
                                           // Get this from the folder URL:
                                           // drive.google.com/drive/folders/THIS_PART
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_NAMES = {
  red_bull:             'Red Bull Dog',
  alcalde_amiguero:     'Alcalde Amiguero',
  protector_preocupado: 'Protector Preocupado',
  dramatico:            'Dramático',
  independiente:        'Independiente',
  sombra:               'Sombra',
  genio_selectivo:      'Genio Selectivo',
  oportunista:          'Oportunista',
};

const CATEGORY_DESCRIPTIONS = {
  red_bull:             'Activación crónica alta. No puede regularse cuando se activa.',
  alcalde_amiguero:     'Sobremotivación social. Sin inhibición antes del acceso social.',
  protector_preocupado: 'Reactividad basada en miedo. Conductas de distancia aumentada.',
  dramatico:            'Intolerancia a la frustración. Escala cuando se le bloquea el acceso.',
  independiente:        'Bajo engagement con el dueño. El entorno vale más que el handler.',
  sombra:               'Dependencia emocional del dueño. Sin habilidades de regulación autónoma.',
  genio_selectivo:      'Comportamiento context-dependiente. Falta de generalización.',
  oportunista:          'Conductas auto-reforzadas. El entorno paga mejor que el dueño.',
};

const TRAINING_FOCUS = {
  red_bull:             'Calma como estado entrenado → Control de impulsos bajo activación graduada',
  alcalde_amiguero:     'Impulso control en contextos sociales → Acceso contingente a saludos',
  protector_preocupado: 'Regulación emocional y seguridad → Exposición gradual con respuestas alternativas',
  dramatico:            'Tolerancia a la frustración → Reforzamiento diferencial de calma',
  independiente:        'Construir valor del handler → Engagement como base antes de obediencia',
  sombra:               'Autonomía e independencia → Tolerancia gradual a la separación',
  genio_selectivo:      'Generalización en contextos variados → Consistencia en reforzamiento',
  oportunista:          'Manejo del entorno → Shift del reforzamiento hacia el handler',
};

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // If this is a phone update (user filled phone after initial submission)
    if (data.update && data.phone && data.phone !== '—') {
      updatePhoneInSheet(data);
      return ContentService.createTextOutput(JSON.stringify({ status: 'updated' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Otherwise it's a new submission
    const pdfUrl = generatePDF(data);
    writeToSheet(data, pdfUrl);

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', pdf: pdfUrl }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow CORS preflight
function doGet(e) {
  return ContentService.createTextOutput('Habla Perro Quiz API — OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── WRITE TO SHEET ────────────────────────────────────────────────────────────
function writeToSheet(data, pdfUrl) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet and headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Fecha y Hora',
      'Nombre Dueño',
      'Nombre Perro',
      'Teléfono',
      'Categoría Principal',
      'Categoría Secundaria',
      'Perfil Combinado',
      'Activación',
      'Impulsos',
      'Sensibilidad',
      'Control Social',
      'Conexión',
      'Auto-reforzadas',
      'Reporte PDF',
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0F2451');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Set column widths
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 140);
    sheet.setColumnWidth(3, 140);
    sheet.setColumnWidth(4, 140);
    sheet.setColumnWidth(5, 180);
    sheet.setColumnWidth(6, 180);
    sheet.setColumnWidth(14, 200);
  }

  const catName  = CATEGORY_NAMES[data.category]  || data.category;
  const cat2Name = data.mixed ? (CATEGORY_NAMES[data.category2] || data.category2) : '—';

  const row = [
    new Date(data.timestamp),
    data.owner_name || '—',
    data.dog_name   || '—',
    data.phone      || '—',
    catName,
    cat2Name,
    data.mixed ? 'Sí' : 'No',
    data.activacion,
    data.impulsos,
    data.sensibilidad,
    data.social,
    data.conexion,
    data.auto_ref,
    pdfUrl ? pdfUrl : '(generando...)',
  ];

  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 1, 1, row.length).setValues([row]);

  // Format date cell
  sheet.getRange(newRow, 1).setNumberFormat('dd/MM/yyyy HH:mm');

  // Make PDF cell a hyperlink if URL exists
  if (pdfUrl) {
    sheet.getRange(newRow, 14).setFormula(`=HYPERLINK("${pdfUrl}","Ver PDF")`);
    sheet.getRange(newRow, 14).setFontColor('#0F2451');
  }

  // Alternate row colors
  if (newRow % 2 === 0) {
    sheet.getRange(newRow, 1, 1, row.length).setBackground('#F5F5F4');
  }
}

// ── UPDATE PHONE ──────────────────────────────────────────────────────────────
function updatePhoneInSheet(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;

  // Find the row with matching dog name and owner name (most recent)
  const lastRow = sheet.getLastRow();
  for (let i = lastRow; i >= 2; i--) {
    const rowOwner = sheet.getRange(i, 2).getValue();
    const rowDog   = sheet.getRange(i, 3).getValue();
    const rowPhone = sheet.getRange(i, 4).getValue();
    if (rowOwner === data.owner_name && rowDog === data.dog_name && rowPhone === '—') {
      sheet.getRange(i, 4).setValue(data.phone);
      break;
    }
  }
}

// ── GENERATE PDF ──────────────────────────────────────────────────────────────
function generatePDF(data) {
  const catName   = CATEGORY_NAMES[data.category]       || data.category;
  const cat2Name  = data.mixed ? (CATEGORY_NAMES[data.category2] || data.category2) : null;
  const catDesc   = CATEGORY_DESCRIPTIONS[data.category] || '';
  const trainFocus = TRAINING_FOCUS[data.category]       || '';

  // Build the document HTML
  const timestamp = new Date(data.timestamp);
  const dateStr   = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');

  const doc  = DocumentApp.create(`HP_Quiz_${data.dog_name}_${data.owner_name}_${Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyyMMdd')}`);
  const body = doc.getBody();

  // Set page margins
  body.setMarginTop(36).setMarginBottom(36).setMarginLeft(54).setMarginRight(54);

  // ── HEADER ──
  const title = body.appendParagraph('HABLA PERRO — Reporte de Evaluación Canina');
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  const titleText = title.editAsText();
  titleText.setFontSize(16);
  titleText.setForegroundColor('#0F2451');
  titleText.setBold(true);

  body.appendParagraph('').setSpacingBefore(0).setSpacingAfter(0);

  const subtitle = body.appendParagraph('Reporte Interno de Evaluación — Habla Perro · escuela canina–humana');
  subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  subtitle.editAsText().setFontSize(9).setForegroundColor('#718096').setItalic(true);

  addDivider(body);

  // ── CLIENT INFO ──
  addSection(body, 'DATOS DEL CLIENTE', '#0F2451');
  addInfoTable(body, [
    ['Nombre del dueño', data.owner_name || '—'],
    ['Nombre del perro', data.dog_name   || '—'],
    ['Teléfono',         data.phone      || '—'],
    ['Fecha evaluación', dateStr],
  ]);

  addDivider(body);

  // ── RESULT ──
  addSection(body, 'RESULTADO DE LA EVALUACIÓN', '#0F2451');

  if (data.mixed && cat2Name) {
    addInfoTable(body, [
      ['Tipo de perfil',      'COMBINADO'],
      ['Perfil principal',    catName],
      ['Perfil secundario',   cat2Name],
    ]);
  } else {
    addInfoTable(body, [
      ['Categoría',    catName],
      ['Tipo de perfil', 'SIMPLE'],
    ]);
  }

  body.appendParagraph('').setSpacingAfter(4);

  const descPara = body.appendParagraph(`Descripción: ${catDesc}`);
  descPara.editAsText().setFontSize(10).setForegroundColor('#4A5568').setItalic(true);
  descPara.setSpacingAfter(6);

  addDivider(body);

  // ── TRAIT SCORES ──
  addSection(body, 'PERFIL DE RASGOS (escala 1–5)', '#0F2451');
  addInfoTable(body, [
    ['Nivel de Activación',       formatScore(data.activacion)   + getScoreNote('activacion',   data.activacion)],
    ['Control de Impulsos',       formatScore(data.impulsos)     + getScoreNote('impulsos',     data.impulsos)],
    ['Sensibilidad Emocional',    formatScore(data.sensibilidad) + getScoreNote('sensibilidad', data.sensibilidad)],
    ['Control Social',            formatScore(data.social)       + getScoreNote('social',       data.social)],
    ['Conexión con el Dueño',     formatScore(data.conexion)     + getScoreNote('conexion',     data.conexion)],
    ['Conductas Auto-reforzadas', formatScore(data.auto_ref)     + getScoreNote('auto_ref',     data.auto_ref)],
  ]);

  const notesPara = body.appendParagraph('⚠ Nota: En Control de Impulsos y Control Social, un puntaje BAJO indica menos regulación (más problemático).');
  notesPara.editAsText().setFontSize(9).setForegroundColor('#C0392B').setItalic(true);
  notesPara.setSpacingBefore(8).setSpacingAfter(4);

  addDivider(body);

  // ── TRAINING FOCUS ──
  addSection(body, 'ENFOQUE DE ENTRENAMIENTO RECOMENDADO', '#0F2451');

  const focusPara = body.appendParagraph(trainFocus);
  focusPara.editAsText().setFontSize(10).setForegroundColor('#0F2451').setBold(false);
  focusPara.setSpacingAfter(8);

  if (data.mixed && cat2Name) {
    const focus2 = TRAINING_FOCUS[data.category2] || '';
    const focus2Para = body.appendParagraph(`Perfil secundario (${cat2Name}): ${focus2}`);
    focus2Para.editAsText().setFontSize(10).setForegroundColor('#4A5568').setItalic(true);
    focus2Para.setSpacingAfter(8);
  }

  addDivider(body);

  // ── NOTES SECTION ──
  addSection(body, 'NOTAS DEL ENTRENADOR', '#0F2451');
  for (let i = 0; i < 6; i++) {
    const linePara = body.appendParagraph('_'.repeat(90));
    linePara.editAsText().setFontSize(9).setForegroundColor('#E2E8F0');
    linePara.setSpacingAfter(10);
  }

  addDivider(body);

  // ── FOOTER ──
  const footer = body.appendParagraph('Habla Perro · Cuernavaca, Morelos · hablaperro.com · Documento de uso interno exclusivo del entrenador');
  footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  footer.editAsText().setFontSize(8).setForegroundColor('#718096').setItalic(true);

  doc.saveAndClose();

  // Convert to PDF and save to Drive
  const docFile = DriveApp.getFileById(doc.getId());
  const pdfBlob = docFile.getAs('application/pdf');
  pdfBlob.setName(`HP_${data.dog_name}_${data.owner_name}_${Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyyMMdd')}.pdf`);

  let folder;
  try {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (_) {
    folder = DriveApp.getRootFolder();
  }

  const pdfFile = folder.createFile(pdfBlob);
  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Delete the Google Doc (we only need the PDF)
  docFile.setTrashed(true);

  return pdfFile.getUrl();
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function addSection(body, text, color) {
  const para = body.appendParagraph(text);
  para.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  para.editAsText().setFontSize(11).setForegroundColor(color || '#0F2451').setBold(true);
  para.setSpacingBefore(10).setSpacingAfter(6);
}

function addDivider(body) {
  const para = body.appendParagraph('─'.repeat(80));
  para.editAsText().setFontSize(6).setForegroundColor('#E2E8F0');
  para.setSpacingBefore(6).setSpacingAfter(6);
}

function addInfoTable(body, rows) {
  const table = body.appendTable();
  rows.forEach(([label, value]) => {
    const row  = table.appendTableRow();
    const cell1 = row.appendTableCell(label);
    const cell2 = row.appendTableCell(String(value));
    cell1.editAsText().setFontSize(10).setForegroundColor('#0F2451').setBold(true);
    cell2.editAsText().setFontSize(10).setForegroundColor('#4A5568');
    cell1.setPaddingTop(4).setPaddingBottom(4).setPaddingLeft(6).setPaddingRight(6);
    cell2.setPaddingTop(4).setPaddingBottom(4).setPaddingLeft(6).setPaddingRight(6);
  });
  // Remove table border
  const tableBorder = table.getBorderColor();
  table.setBorderColor('#E2E8F0');
  body.appendParagraph('').setSpacingAfter(0);
}

function formatScore(val) {
  return val ? val.toFixed(1) + ' / 5.0' : '—';
}

function getScoreNote(trait, val) {
  if (!val) return '';
  const v = parseFloat(val);
  if (trait === 'impulsos' || trait === 'social') {
    // Inverted — low is problematic
    if (v <= 2)   return ' ⚠ Bajo (problema)';
    if (v >= 4)   return ' ✓ Alto (bien regulado)';
    return ' — Moderado';
  } else {
    if (v >= 4.5) return ' ⚠ Muy alto';
    if (v >= 3.5) return ' ↑ Alto';
    if (v <= 1.5) return ' ↓ Muy bajo';
    return '';
  }
}
