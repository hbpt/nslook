#!/usr/bin/env node
// /workspaces/nslook/src/app.js
// Simple DNS-over-HTTPS client for dns.google
// Usage: node app.js <name> [type]
// Example: node app.js example.com A

const [, , name = 'example.com', type = 'A'] = process.argv;

let fetchFn = global.fetch;
if (!fetchFn) {
    // lazy dynamic import for node-fetch if global fetch isn't available
    fetchFn = (...args) => import('node-fetch').then(m => m.default(...args));
}
function getdm(i) {
    var s = '', p = parseInt(i / 26), d = i % 26
    if (p) s += getdm(p - 1)
    s += String.fromCharCode(97 + d)
    return s
}
function rgetdm(i) {
    var s = -1, p = i.toLowerCase()
    for (var c of p) s = (s + 1) * 26 + c.charCodeAt(0) - 97
    return s
}
const fs = require('fs');
function savedm(i) {
    fs.appendFileSync('.dm', i + '\n');
}
//console.log(getdm(rgetdm('aa')+1))
let num = rgetdm('aa')
async function look(name) {
    try {
        const url = `https://dns.google/resolve?name=${name}&type=NS`;
        const res = await fetchFn(url, { headers: { 'Accept': 'application/dns-json' } });
        const data = await res.json();

        console.log('// Request URL:', url);
        console.log('// HTTP status:', res.status);
        //console.log(JSON.stringify(data, null, 2));
        return data.Answer || !data.Authority
    } catch (err) {
        console.error('Fetch error:', err.message || err);
    }
}
(async () => {
    try {
        while (true) {
            const dm = getdm(num)
            if (dm.length > 2) break
            const found = await look(dm + '.al');
            if (!found) {
                console.log(`// No NS records found for ${dm}`);
                savedm(dm);
            }
            num++
        }
    } catch (err) {
        console.error('Fetch error:', err.message || err);
        process.exit(1);
    }
})();
console.log('// Done.');