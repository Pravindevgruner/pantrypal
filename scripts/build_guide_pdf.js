const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, 'guide.html');
const pdfDestProject = path.join(__dirname, '..', 'PantryPal_Fulfillment_and_Testing_Guide.pdf');
const pdfDestArtifacts = '/Users/pravinsharma/.gemini/antigravity/brain/95d84fad-e111-4416-9757-75c4e668759d/PantryPal_Fulfillment_and_Testing_Guide.pdf';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const cmd = `"${chromePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfDestProject}" "file://${htmlPath}"`;

console.log('Generating PDF via Headless Chrome...');
try {
  execSync(cmd, { stdio: 'inherit' });
  // Copy to artifacts directory
  fs.copyFileSync(pdfDestProject, pdfDestArtifacts);
  console.log('PDF successfully created:');
  console.log('1. ' + pdfDestProject);
  console.log('2. ' + pdfDestArtifacts);
} catch (err) {
  console.error('Error generating PDF:', err);
  process.exit(1);
}
