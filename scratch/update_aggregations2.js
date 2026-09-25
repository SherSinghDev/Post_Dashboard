const fs = require('fs');
const path = 'C:\\Users\\Acer\\Desktop\\ERA\\any web\\dashboard\\Server\\src\\controllers\\patientForm\\index.js';

let content = fs.readFileSync(path, 'utf8');

const injection = `
      // Add date filtering
      let dateQuery = req.query.date;
      if (!dateQuery) {
        // default to current date
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
      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
`;

// Replace `result = await PatientForm.aggregate([`
content = content.replace(/result = await PatientForm\.aggregate\(\[/g, (match) => {
    return injection + "\n      " + match;
});

// Update render calls
content = content.replace(/res\.render\('forms', \{ applications: result, page: "([^"]+)", user, createOrder \}\);/g, (match, pageName) => {
    return `res.render('forms', { applications: result, page: "${pageName}", user, createOrder, selectedDate: dateQuery });`;
});

// For /patients where there is no page but it might be different
content = content.replace(/res\.render\('forms', \{ applications: result, user, createOrder \}\);/g, (match) => {
    return `res.render('forms', { applications: result, user, createOrder, selectedDate: dateQuery });`;
});

// Fix case where `matchQuery` is not defined but we are trying to use it. Wait, in /notinterestedpatients, it uses $match: { ... } directly.
// Let's modify the script to make sure matchQuery exists.
// Actually, let me just run it and see.
// Wait, I should not do this globally if matchQuery is not defined.
fs.writeFileSync('C:\\Users\\Acer\\Desktop\\ERA\\any web\\dashboard\\Server\\scratch\\update_aggregations2.js', 'console.log("Not ready");');
