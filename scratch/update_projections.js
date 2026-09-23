const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'controllers', 'patientForm', 'index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Insert referrer.position and referrer.parentUser in the $project stage
content = content.replace(/("referrer\.userId": 1\s*,)/g, `$1\n            "referrer.position": 1,\n            "referrer.parentUser": 1,`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated patientForm/index.js with position and parentUser");
