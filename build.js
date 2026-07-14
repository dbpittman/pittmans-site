// Pittmans site build: templates + content -> dist
const fs = require('fs');
const path = require('path');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const read = p => fs.readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));

const settings = json('content/settings.json');
const projects = json('content/projects.json').items;
const record = json('content/record.json').items;

const projectHTML = (p, flag) => `      <article class="project${flag ? ' flag' : ''} reveal">
        <div class="p-img">
          <img src="${p.image}" alt="${esc(p.alt || p.title)}">
        </div>
        <div class="p-body">
          <div class="eyebrow"><span class="shno">${esc(p.sheet)}</span>${esc(p.location)}</div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.body)}</p>
          <div class="p-tags">${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        </div>
      </article>`;

const recHTML = r => `        <div class="rec"><img src="${r.image}" alt="${esc(r.alt || r.label)}"><div class="rc"><div class="ry">${esc(r.year)}</div><div class="rn">${esc(r.label)}</div></div></div>`;

const flagship = projects.find(p => p.flagship) || projects[0];

const tokens = {
  '{{PROJECTS}}': projects.map(p => projectHTML(p, p.flagship)).join('\n\n'),
  '{{FLAGSHIP}}': projectHTML(flagship, true),
  '{{RECORD}}': record.map(recHTML).join('\n'),
  '{{PHONE}}': esc(settings.phone),
  '{{PHONE_DIGITS}}': String(settings.phone).replace(/\D/g, ''),
  '{{EMAIL}}': esc(settings.email),
  '{{HEAD_OFFICE}}': esc(settings.head_office),
  '{{OPERATING}}': esc(settings.operating),
};

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });

for (const f of fs.readdirSync('templates')) {
  let html = read(path.join('templates', f));
  for (const [k, v] of Object.entries(tokens)) html = html.split(k).join(v);
  const leftover = html.match(/{{[A-Z_]+}}/);
  if (leftover) throw new Error(`Unreplaced token ${leftover[0]} in ${f}`);
  fs.writeFileSync(path.join('dist', f), html);
  console.log('built', f);
}

// static passthrough
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
  fs.copyFileSync(f, path.join('dist', f));
}
fs.cpSync('images', 'dist/images', { recursive: true });
fs.cpSync('admin', 'dist/admin', { recursive: true });
console.log('build complete');
