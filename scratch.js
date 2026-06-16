const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://fjwyzhvuskciecqlmcep.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqd3l6aHZ1c2tjaWVjcWxtY2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mjk2ODUsImV4cCI6MjA5NzAwNTY4NX0.Bkcl2_BhY59k4tL6jWqpCivLdtFy-lypMdl7Sf7HCHM');

async function check() {
  const { data, error } = await supabase.from('workshops').select('*');
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}

check();
