const fs = require('fs');
const path = 'C:\\Users\\Acer\\Desktop\\ERA\\any web\\dashboard\\Server\\src\\controllers\\patientForm\\index.js';

let content = fs.readFileSync(path, 'utf8');

const dateLogic = `
      let dateQuery = req.query.date;
      if (!dateQuery) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateQuery = \`\${yyyy}-\${mm}-\${dd}\`;
      }
      let startDate = new Date(dateQuery);
      startDate.setHours(0, 0, 0, 0);
      let endDate = new Date(dateQuery);
      endDate.setHours(23, 59, 59, 999);
`;

// Insert dateLogic before `result = await PatientForm.aggregate([`
content = content.replace(/result = await PatientForm\.aggregate\(\[/g, (match) => {
    return dateLogic + "\n      " + match;
});

// Update $match: matchQuery to include date
content = content.replace(/\$match: matchQuery/g, '$match: { ...matchQuery, createdAt: { $gte: startDate, $lte: endDate } }');

// Update $match: { to include date (excluding the ones we just did, wait, those were matchQuery, not {)
content = content.replace(/\$match:\s*\{/g, '$match: {\n              createdAt: { $gte: startDate, $lte: endDate },');

// Pass selectedDate in res.render
content = content.replace(/res\.render\('forms', \{([^}]+)\}\);/g, (match, p1) => {
    // If selectedDate is already there, do nothing
    if (p1.includes('selectedDate')) return match;
    return `res.render('forms', {${p1}, selectedDate: dateQuery });`;
});

fs.writeFileSync(path, content);
console.log("Successfully updated index.js");
