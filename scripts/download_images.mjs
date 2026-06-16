import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import https from 'https';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials. Make sure to run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80",
  "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&q=80",
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
  "https://images.unsplash.com/photo-1602874801007-bd458cb6c507?w=800&q=80",
  "https://images.unsplash.com/photo-1596041697334-080c35456fbd?w=800&q=80",
  "https://images.unsplash.com/photo-1599643478524-fb5244197e4b?w=800&q=80",
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80",
  "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80",
  "https://images.unsplash.com/photo-1582200216259-3a6d9de42b26?w=800&q=80",
  "https://images.unsplash.com/photo-1583091173872-cb1e6a9787ff?w=800&q=80",
  "https://images.unsplash.com/photo-1589146182103-b09e1e2d4d98?w=800&q=80",
  "https://images.unsplash.com/photo-1565194488347-f77eecafcd6c?w=800&q=80",
  "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
  "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80",
  "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800&q=80",
  "https://images.unsplash.com/photo-1522880922851-4033320f78d9?w=800&q=80",
  "https://images.unsplash.com/photo-1563821016839-446735edc6fa?w=800&q=80",
  "https://images.unsplash.com/photo-1596700010915-1845bb02029c?w=800&q=80",
  "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=80"
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  const publicDir = path.join(process.cwd(), 'public', 'images', 'workshops');
  
  console.log("Downloading 20 images to local public directory...");
  const downloadedPaths = [];
  
  for (let i = 0; i < IMAGE_URLS.length; i++) {
    const filename = `mock_${i + 1}.jpg`;
    const filepath = path.join(publicDir, filename);
    const relativePath = `/images/workshops/${filename}`;
    
    try {
      await downloadImage(IMAGE_URLS[i], filepath);
      downloadedPaths.push(relativePath);
      console.log(`Downloaded: ${filename}`);
    } catch (e) {
      console.error(`Error downloading image ${i + 1}:`, e.message);
    }
  }

  console.log("Updating workshops in database with local image paths...");
  const { data: workshops, error } = await supabase.from('workshops').select('id');
  if (error) {
    console.error("Failed to fetch workshops:", error);
    return;
  }

  let updateCount = 0;
  for (let i = 0; i < workshops.length; i++) {
    const imagePath = downloadedPaths[i % downloadedPaths.length];
    await supabase.from('workshops').update({ images: [imagePath] }).eq('id', workshops[i].id);
    updateCount++;
  }

  console.log(`Successfully updated ${updateCount} workshops with diverse local images!`);
}

run().catch(console.error);
