const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'controllers', 'patientForm', 'index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the scattered referrer.* projections with just "referrer": 1
content = content.replace(/"referrer\._id": 1,\s*"referrer\.name": 1,\s*"referrer\.userId": 1\s*,\s*"referrer\.position": 1,\s*"referrer\.parentUser": 1,/g, `"referrer": 1,`);

// Also check for the case before the second script just in case
content = content.replace(/"referrer\._id": 1,\s*"referrer\.name": 1,\s*"referrer\.userId": 1\s*,\s*"allParents": 1/g, `"referrer": 1,\n            "allParents": 1`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated patientForm/index.js to project the full referrer object");
