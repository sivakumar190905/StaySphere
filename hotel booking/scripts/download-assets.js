const fs = require('fs');
const path = require('path');
const https = require('https');

const baseDir = path.join(__dirname, '..', 'public', 'images');
const dirs = [
  path.join(baseDir, 'hero'),
  path.join(baseDir, 'cities'),
  path.join(baseDir, 'hotels'),
  path.join(baseDir, 'rooms'),
  path.join(baseDir, 'users')
];

// Create dirs
dirs.forEach(d => {
  fs.mkdirSync(d, { recursive: true });
});

const assets = {
  hero: {
    'hero1.jpg': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'hero2.jpg': 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=1200&q=80',
    'hero3.jpg': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    'hero4.jpg': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    'hero5.jpg': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    'hero6.jpg': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80'
  },
  cities: {
    'goa.jpg': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    'udaipur.jpg': 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=600&q=80',
    'jaipur.jpg': 'https://images.unsplash.com/photo-1598977123418-45f04b6141a5?auto=format&fit=crop&w=600&q=80',
    'manali.jpg': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80',
    'pondicherry.jpg': 'https://images.unsplash.com/photo-1589136775550-189f38a763c3?auto=format&fit=crop&w=600&q=80',
    'ooty.jpg': 'https://images.unsplash.com/photo-1612448378516-7d6368d1b11a?auto=format&fit=crop&w=600&q=80',
    'chennai.jpg': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    'bangalore.jpg': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    'hyderabad.jpg': 'https://images.unsplash.com/photo-1608958416715-4fa79383637a?auto=format&fit=crop&w=600&q=80',
    'mumbai.jpg': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    'delhi.jpg': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    'pune.jpg': 'https://images.unsplash.com/photo-1601999109332-542b18dbec97?auto=format&fit=crop&w=600&q=80',
    'kochi.jpg': 'https://images.unsplash.com/photo-1588598126715-db143a53d332?auto=format&fit=crop&w=600&q=80',
    'coimbatore.jpg': 'https://images.unsplash.com/photo-1606306734199-e653818e6988?auto=format&fit=crop&w=600&q=80',
    'vellore.jpg': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80',
    'madurai.jpg': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    'salem.jpg': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    'tirupati.jpg': 'https://images.unsplash.com/photo-1608958416715-4fa79383637a?auto=format&fit=crop&w=600&q=80',
    'vizag.jpg': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    'mysore.jpg': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    'kodaikanal.jpg': 'https://images.unsplash.com/photo-1612448378516-7d6368d1b11a?auto=format&fit=crop&w=600&q=80'
  },
  hotels: {
    'hotel-0.jpg': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'hotel-1.jpg': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    'hotel-2.jpg': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    'hotel-3.jpg': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    'hotel-4.jpg': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    'hotel-5.jpg': 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=800&q=80',
    'hotel-6.jpg': 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
    'hotel-7.jpg': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
    'hotel-8.jpg': 'https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=800&q=80',
    'hotel-9.jpg': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    'hotel-10.jpg': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    'hotel-11.jpg': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
  },
  rooms: {
    'deluxe.jpg': 'https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=800&q=80',
    'superior.jpg': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    'cityView.jpg': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    'lakeView.jpg': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    'executiveSuite.jpg': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    'royalSuite.jpg': 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    'presidentialSuite.jpg': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    'luxuryVilla.jpg': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    'poolVilla.jpg': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    'heritageSuite.jpg': 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=800&q=80'
  },
  users: {
    'user1.jpg': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'user2.jpg': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'user3.jpg': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (Status Code: ${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading local high-res JPEG assets...');
  for (const [category, files] of Object.entries(assets)) {
    const catDir = path.join(baseDir, category);
    for (const [filename, url] of Object.entries(files)) {
      const dest = path.join(catDir, filename);
      try {
        await downloadFile(url, dest);
        console.log(`✓ Downloaded ${category}/${filename}`);
      } catch (err) {
        console.error(`✗ Failed ${category}/${filename}:`, err.message);
      }
    }
  }
  console.log('All local JPEG assets have been fetched permanently!');
}

run();
