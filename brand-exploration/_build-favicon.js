// Favicon set for 京西智评.
// At 16px the full JP monogram collapses (the J hook merges into the P), so the
// primary favicon uses the "P" ribbon alone - it keeps a clear counter and
// silhouette at every size. The full lockup stays for the header.
const fs = require('fs');
const path = require('path');
const DIR = 'D:/项目评估系统/co-ai-portal/ai-eval-portal/assets';

const G = {
  blue:  '#2B9BF0',
  blue2: '#4C6FE0',
  purple:'#8E5FD8',
  purple2:'#A857C8',
  pink:  '#D62E92',
  pink2: '#E33C7A'
};
const NAVY = '#12143C';
const xml = s => '<?xml version="1.0" encoding="UTF-8"?>\n' + s;

const GRAD = `
  <linearGradient id="gJP" gradientUnits="userSpaceOnUse" x1="69" y1="5" x2="140" y2="52">
    <stop offset="0" stop-color="${G.blue2}"/>
    <stop offset=".42" stop-color="${G.purple}"/>
    <stop offset=".72" stop-color="${G.purple2}"/>
    <stop offset="1" stop-color="${G.pink}"/>
  </linearGradient>`;

// "P" ribbon: stem + bowl (counter is a real hole via evenodd)
const P_RIBBON = `
  <path d="M101 5 L125 5 L93 52 L69 52 Z"/>
  <path d="M101 5 L125 5
           C139 5 143 17 133 29
           L129 34
           C121 44 110 48 99 48
           L81 48 L89 33 L100 33
           C107 33 112 30 116 24
           L119 19
           C122 14 120 11 115 11
           L93 11 Z"/>`;
const P_COUNTER = `
  <path d="M107 19
           C112 19 115 23 111 29
           L106 36 L90 36 L97 25 Z"/>`;

// ---------- primary favicon: P ribbon on navy plate ----------
fs.writeFileSync(path.join(DIR, 'favicon.svg'), xml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
${GRAD}
  <rect width="64" height="64" rx="13" fill="${NAVY}"/>
  <g transform="translate(8,8) scale(0.40)">
    <g fill="url(#gJP)">
      <path d="M101 5 L125 5 L93 52 L69 52 Z"/>
      <path d="M101 5 L125 5 C139 5 143 17 133 29 L129 34 C121 44 110 48 99 48 L81 48 L89 33 L100 33 C107 33 112 30 116 24 L119 19 C122 14 120 11 115 11 L93 11 Z"/>
    </g>
    <g fill="${NAVY}">
      <path d="M107 19 C112 19 115 23 111 29 L106 36 L90 36 L97 25 Z"/>
    </g>
  </g>
</svg>\n`), 'utf8');

// ---------- large-icon variant: full JP monogram, navy plate ----------
fs.writeFileSync(path.join(DIR, 'icon.svg'), xml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <linearGradient id="gJP2" gradientUnits="userSpaceOnUse" x1="8" y1="4" x2="56" y2="44">
    <stop offset="0" stop-color="${G.blue}"/><stop offset=".42" stop-color="${G.purple}"/><stop offset="1" stop-color="${G.pink}"/>
  </linearGradient>
  <rect width="64" height="64" rx="13" fill="${NAVY}"/>
  <g transform="translate(7,19) scale(0.33)" fill="url(#gJP2)">
    <path d="M31 7 L55 7 L41 25 L17 25 Z"/>
    <path d="M61 5 L86 5 L46 43 C39 50 26 53 15 48 C6 44 4 33 11 27 C13 25 16 24 19 25 L26 40 C22 42 23 47 29 47 C35 47 41 42 45 35 Z"/>
    <path d="M101 5 L125 5 L93 52 L69 52 Z"/>
    <path d="M101 5 L125 5 C139 5 143 17 133 29 L129 34 C121 44 110 48 99 48 L81 48 L89 33 L100 33 C107 33 112 30 116 24 L119 19 C122 14 120 11 115 11 L93 11 Z"/>
  </g>
  <g transform="translate(7,19) scale(0.33)" fill="${NAVY}">
    <path d="M107 19 C112 19 115 23 111 29 L106 36 L90 36 L97 25 Z"/>
  </g>
</svg>\n`), 'utf8');

// ---------- monochrome ----------
fs.writeFileSync(path.join(DIR, 'favicon-mono.svg'), xml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="13" fill="${NAVY}"/>
  <g transform="translate(8,8) scale(0.40)">
    <g fill="#FFFFFF">
      <path d="M101 5 L125 5 L93 52 L69 52 Z"/>
      <path d="M101 5 L125 5 C139 5 143 17 133 29 L129 34 C121 44 110 48 99 48 L81 48 L89 33 L100 33 C107 33 112 30 116 24 L119 19 C122 14 120 11 115 11 L93 11 Z"/>
    </g>
    <g fill="${NAVY}">
      <path d="M107 19 C112 19 115 23 111 29 L106 36 L90 36 L97 25 Z"/>
    </g>
  </g>
</svg>\n`), 'utf8');

console.log('wrote favicon.svg, icon.svg, favicon-mono.svg');
