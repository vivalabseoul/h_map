const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf-8');
const env = {};
content.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"]/g, '').trim();
});
const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/workshops?select=id,name';
fetch(url, { headers: { 'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.NEXT_PUBLIC_SUPABASE_ANON_KEY } })
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
