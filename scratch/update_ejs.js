const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'views', 'forms.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Use regex to replace the specific table cells
content = content.replace(/<%= app\.referrer\?[\s\S]*?: 'NA' %>/g, `<%= (app.referrer && app.referrer.name) ? (app.referrer.name + ' (id: ' + app.referrer.userId + ')' + (app.referrer.position ? ' - ' + app.referrer.position : '')) : (app.referredBy || 'NA') %>`);

content = content.replace(/<% if \(app\.allParents && app\.allParents\.length > 0\) { %>[\s\S]*?<% } else { %>\s*NA\s*<% } %>/g, `<% if (app.allParents && app.allParents.length > 0) { %>
                                                                                                    <% app.allParents.sort((a,b) => a.level - b.level).forEach(parent => { %>
                                                                                                        <div style="white-space: nowrap; margin-bottom: 4px;">
                                                                                                            <%= parent.name %> (id: <%= parent.userId %>)<%= parent.position ? ' - ' + parent.position : '' %>
                                                                                                        </div>
                                                                                                    <% }) %>
                                                                                                <% } else { %>
                                                                                                    <%= app.referredBy || 'NA' %>
                                                                                                <% } %>`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated forms.ejs logic using regex");
