// Script para reemplazar '\\' por '/' en lcov.info tras los tests
const fs = require('fs');
const path = require('path');

const lcovPath = path.join(__dirname, 'coverage', 'lcov.info');
if (fs.existsSync(lcovPath)) {
  let content = fs.readFileSync(lcovPath, 'utf8');
  // Reemplaza solo en las líneas SF:
  content = content.replace(/^SF:(.*)\\/gm, (m) => m.replace(/\\/g, '/'));
  fs.writeFileSync(lcovPath, content, 'utf8');
  console.log('Rutas de lcov.info corregidas a formato Unix.');
} else {
  console.error('No se encontró coverage/lcov.info');
  process.exit(1);
}
