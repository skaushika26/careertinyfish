const fs = require('fs');
const path = require('path');

/**
 * Extract text from uploaded file (PDF or DOCX or TXT)
 */
async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf8');
  }

  if (ext === '.pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (err) {
      throw new Error('Failed to parse PDF: ' + err.message);
    }
  }

  if (ext === '.docx') {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (err) {
      throw new Error('Failed to parse DOCX: ' + err.message);
    }
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

module.exports = { extractTextFromFile };
