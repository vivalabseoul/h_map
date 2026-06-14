const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const insertData = {
    creator_id: 'api_sync',
    creator_name: '지역 축제 알리미',
    name: { ko: 'Test Festival', en: '', ja: '', zh: '' },
    date: '2024-01-01',
    address: { ko: 'Seoul', en: '', ja: '', zh: '' },
    lat: 37.5,
    lng: 127.0,
    admissionFee: '무료',
    description: { ko: 'Test', en: '', ja: '', zh: '' },
    phone: '',
    website: '',
    source: 'api',
    external_id: 'test_ext_id'
  };

  const { data, error } = await supabase.from('flea_markets').insert([insertData]);
  console.log('Result:', { data, error });
}
main();
