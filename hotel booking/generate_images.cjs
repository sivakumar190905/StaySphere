const fs = require('fs');
const path = require('path');

const dirs = [
  'public/images/hero',
  'public/images/cities',
  'public/images/hotels',
  'public/images/rooms',
  'public/images/users'
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(__dirname, d), { recursive: true });
});

// Helper to write SVG with a nice gradient and label
function writeSvg(filePath, title, subtitle, bgGradStart, bgGradEnd, iconType) {
  let iconSvg = '';
  if (iconType === 'palace') {
    iconSvg = `<path d="M20 180h360M60 180V100l40-30 40 30v80M140 180v-50l30-20 30 20v50M200 180V70l40-40 40 40v110M280 180v-50l30-20 30 20v50M340 180V100l30-20 30 20v80" stroke="#FFD700" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (iconType === 'beach') {
    iconSvg = `<path d="M100 180 L200 140 L240 160 L320 120" stroke="#FFD700" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="280" cy="70" r="25" fill="#FFD700" opacity="0.8"/><path d="M150 180 C 180 150, 220 150, 250 180" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  } else if (iconType === 'mountain') {
    iconSvg = `<path d="M40 180 L140 80 L200 130 L290 50 L370 180 Z" fill="none" stroke="#FFD700" stroke-width="4" stroke-linejoin="round"/><path d="M110 110 L140 130 L160 115" stroke="#FFFFFF" stroke-width="3" fill="none"/>`;
  } else if (iconType === 'room') {
    iconSvg = `<rect x="80" y="100" width="240" height="70" rx="10" fill="none" stroke="#FFD700" stroke-width="4"/><path d="M100 100v-30h200v30" fill="none" stroke="#FFD700" stroke-width="4"/><circle cx="120" cy="50" r="10" fill="#FFD700"/><circle cx="280" cy="50" r="10" fill="#FFD700"/>`;
  } else if (iconType === 'user') {
    iconSvg = `<circle cx="200" cy="100" r="40" fill="none" stroke="#FFD700" stroke-width="4"/><path d="M130 180 C 130 140, 160 130, 200 130 C 240 130, 270 140, 270 180" fill="none" stroke="#FFD700" stroke-width="4"/>`;
  } else {
    iconSvg = `<rect x="140" y="40" width="120" height="140" rx="10" fill="none" stroke="#FFD700" stroke-width="4"/><rect x="170" y="70" width="20" height="20" rx="3" fill="#FFD700" opacity="0.7"/><rect x="210" y="70" width="20" height="20" rx="3" fill="#FFD700" opacity="0.7"/><rect x="170" y="110" width="20" height="20" rx="3" fill="#FFD700" opacity="0.7"/><rect x="210" y="110" width="20" height="20" rx="3" fill="#FFD700" opacity="0.7"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}" />
        <stop offset="100%" stop-color="${bgGradEnd}" />
      </linearGradient>
      <clipPath id="rectClip">
        <rect width="400" height="300" rx="20" />
      </clipPath>
    </defs>
    <g clip-path="url(#rectClip)">
      <rect width="400" height="300" fill="url(#bgGrad)" />
      <circle cx="350" cy="50" r="120" fill="#ffffff" opacity="0.03" />
      <circle cx="50" cy="250" r="80" fill="#ffffff" opacity="0.04" />
      <g transform="translate(0, 10)" opacity="0.85">
        ${iconSvg}
      </g>
      <rect x="20" y="200" width="360" height="80" rx="15" fill="#0b1437" fill-opacity="0.6" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5" style="backdrop-filter: blur(10px);" />
      <text x="40" y="235" font-family="'Playfair Display', 'Georgia', serif" font-size="18" font-weight="bold" fill="#ffffff">${title}</text>
      <text x="40" y="260" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#d4a017" letter-spacing="1.5" text-transform="uppercase">${subtitle}</text>
      <rect x="310" y="222" width="50" height="22" rx="8" fill="#ffd700" />
      <text x="335" y="237" font-family="'Inter', sans-serif" font-size="11" font-weight="bold" fill="#0b1437" text-anchor="middle">★ 4.9</text>
    </g>
  </svg>`;

  fs.writeFileSync(filePath, svg);
}

// Write Hero images
for (let i = 1; i <= 6; i++) {
  writeSvg(`public/images/hero/hero${i}.svg`, `StaySphere Collection ${i}`, 'Luxury Signature Experience', '#0f172a', '#1e1b4b', 'palace');
}

// Write cities
const cities = ['goa', 'udaipur', 'jaipur', 'manali', 'pondicherry', 'chennai', 'bangalore', 'hyderabad', 'kochi', 'ooty', 'kodaikanal', 'mysore', 'mumbai', 'delhi', 'pune', 'coimbatore', 'vellore', 'madurai', 'salem', 'tirupati', 'vizag'];
cities.forEach(c => {
  const name = c.charAt(0).toUpperCase() + c.slice(1);
  const icon = c === 'goa' || c === 'pondicherry' ? 'beach' : c === 'manali' || c === 'ooty' || c === 'kodaikanal' ? 'mountain' : 'palace';
  writeSvg(`public/images/cities/${c}.svg`, name, 'Elite Holiday Destination', '#020617', '#1e293b', icon);
});

// Write general hotel exterior templates
for (let i = 0; i < 12; i++) {
  writeSvg(`public/images/hotels/hotel-${i}.svg`, `StaySphere Grand Manor ${i + 1}`, 'Premium Palace Resort', '#090d16', '#1a233a', 'palace');
}

// Write room templates
const roomTypes = ['deluxe', 'superior', 'cityView', 'lakeView', 'executiveSuite', 'royalSuite', 'presidentialSuite', 'luxuryVilla', 'poolVilla', 'heritageSuite'];
roomTypes.forEach((rt, idx) => {
  const label = rt.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  writeSvg(`public/images/rooms/${rt}.svg`, label, 'Luxury Room Category', '#0B1437', '#111c44', 'room');
});

// Write user avatars
for (let i = 1; i <= 3; i++) {
  writeSvg(`public/images/users/user${i}.svg`, `Guest Reviewer ${i}`, 'StaySphere Member Choice', '#1e293b', '#0f172a', 'user');
}

console.log('Successfully generated all offline SVG visual assets!');
