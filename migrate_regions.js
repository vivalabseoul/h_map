const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://fjwyzhvuskciecqlmcep.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqd3l6aHZ1c2tjaWVjcWxtY2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mjk2ODUsImV4cCI6MjA5NzAwNTY4NX0.Bkcl2_BhY59k4tL6jWqpCivLdtFy-lypMdl7Sf7HCHM');

async function run() {
  console.log("Starting migration...");
  
  const { data: wsUpdate1, error: wsError1 } = await supabase
    .from('workshops')
    .update({ region: 'canada' })
    .eq('region', 'north_america');
  
  if (wsError1) console.error("Error updating north_america:", wsError1);
  else console.log("Updated north_america to canada");

  const { data: wsUpdate2, error: wsError2 } = await supabase
    .from('workshops')
    .update({ region: 'thailand' })
    .eq('region', 'southeast_asia');
    
  if (wsError2) console.error("Error updating southeast_asia:", wsError2);
  else console.log("Updated southeast_asia to thailand");

  const { data: wsUpdate3, error: wsError3 } = await supabase
    .from('workshops')
    .update({ region: 'uk' })
    .eq('region', 'northern_europe');
    
  if (wsError3) console.error("Error updating northern_europe:", wsError3);
  else console.log("Updated northern_europe to uk");

  console.log("Migration complete.");
}

run();
