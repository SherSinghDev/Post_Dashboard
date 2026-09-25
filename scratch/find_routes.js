const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Acer\\Desktop\\ERA\\any web\\dashboard\\Server\\src\\controllers\\patientForm\\index.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('router.get(')) {
        console.log(index + 1, line.trim());
    }
});
