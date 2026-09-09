const http = require('http');

const req = http.request('http://localhost:3200/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, (res) => {
    let cookie = res.headers['set-cookie'];
    console.log('Login status:', res.statusCode);

    const getReq = http.request('http://localhost:3200/users/network', {
        method: 'GET',
        headers: { 'Cookie': cookie }
    }, (getRes) => {
        console.log('Network page status:', getRes.statusCode);
        let data = '';
        getRes.on('data', chunk => data += chunk);
        getRes.on('end', () => {
            console.log('HTML length:', data.length);
            console.log('Has main-wrapper show?', data.includes('id="main-wrapper" class="show"'));
            console.log('Has global.min.js?', data.includes('/vendor/global/global.min.js'));
            console.log('Has custom.js?', data.includes('/js/custom.js'));
            console.log('Has deznav-init.js?', data.includes('/js/deznav-init.js'));
            console.log('Has 5-Level User Network text?', data.includes('My 5-Level User Network'));
            console.log('Has Level 1 Alice Brown?', data.includes('Alice Brown'));
            console.log('Has Level 2 Bob Smith?', data.includes('Bob Smith'));
        });
    });
    getReq.end();
});
req.write(JSON.stringify({ email: 'demouser@bsrf.com', password: '1234' }));
req.end();
