const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'controllers', 'patientForm', 'index.js');
let content = fs.readFileSync(filePath, 'utf8');

const graphLookupStage = `
        {
          $graphLookup: {
            from: "users",
            startWith: "$referrer.parentUser",
            connectFromField: "parentUser",
            connectToField: "_id",
            as: "allParents",
            depthField: "level"
          }
        },`;

// Insert the graphLookup stage after the unwind for referrer
content = content.replace(/(\$unwind: {\s*path: "\$referrer",\s*preserveNullAndEmptyArrays: true[^\}]*\s*\}\s*\},)/g, `$1${graphLookupStage}`);

// Insert allParents: 1 in the $project stage
content = content.replace(/("referrer\.userId": 1\s*)/g, `$1,\n            "allParents": 1`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated patientForm/index.js");
