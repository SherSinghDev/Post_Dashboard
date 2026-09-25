const fs = require('fs');
const path = 'C:\\Users\\Acer\\Desktop\\ERA\\any web\\dashboard\\Server\\src\\controllers\\patientForm\\index.js';

let content = fs.readFileSync(path, 'utf8');

// The block that is duplicated inside if-else blocks:
const blockRegex = /[\t ]*let dateQuery = req\.query\.date;[\s\S]*?endDate\.setHours\(23, 59, 59, 999\);/g;

// Remove all instances of the block
content = content.replace(blockRegex, '');

// Now we need to insert the block ONCE at the top of every route that uses dateQuery
// We can find `try {` followed by `let user = await Users.findOne`
// or just look for `res.render` calls that use `selectedDate: dateQuery` and then find the nearest route start.

// Actually, we can just find all router.get(...) handlers and inject the date setup if they use dateQuery.
const insertBlock = `
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

const routeMatches = [...content.matchAll(/router\.get\('[^']+', async \(req, res\) => \{[\s\S]*?(?=router\.get|$)/g)];

let newContent = content;

for (let match of routeMatches) {
    let routeContent = match[0];
    if (routeContent.includes('dateQuery')) {
        // inject right after `let user = await Users.findOne({ _id: req.session.userId })`
        // or just after `try {`
        if (routeContent.includes('let user = await Users.findOne')) {
            let newRouteContent = routeContent.replace(/let user = await Users\.findOne[^\n]+\n/, (m) => m + insertBlock);
            newContent = newContent.replace(routeContent, newRouteContent);
        }
    }
}

fs.writeFileSync(path, newContent);
console.log("Fixed dateQuery scope!");
