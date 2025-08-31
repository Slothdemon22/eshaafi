const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', '@100mslive', 'hms-virtual-background', 'dist', 'esm', 'index.js');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Patch named import to default import
  content = content.replace(
    /import \{ SelfieSegmentation \} from "@mediapipe\/selfie_segmentation";/,
    'import SelfieSegmentation from "@mediapipe/selfie_segmentation";'
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Patched @100mslive/hms-virtual-background to use default import for SelfieSegmentation.');
} else {
  console.warn('Could not find @100mslive/hms-virtual-background index.js to patch.');
}
