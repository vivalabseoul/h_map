const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
});

const apiKey = env['FESTIVAL_API_KEY'];

if (!apiKey) {
  console.log('No FESTIVAL_API_KEY found in .env.local');
  process.exit(1);
}

async function testApi() {
  console.log('Testing with key:', apiKey.substring(0, 10) + '...');
  
  // Try directly
  const url1 = `https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api?serviceKey=${apiKey}&pageNo=1&numOfRows=10&type=json`;
  
  try {
    const res = await fetch(url1);
    const text = await res.text();
    console.log('Response Status:', res.status);
    console.log('Response Text (first 500 chars):', text.substring(0, 500));
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

testApi();
