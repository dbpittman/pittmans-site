// Pittmans site build: templates + content -> dist
const fs = require('fs');
const path = require('path');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const read = p => fs.readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));

const home      = json('content/home.json');
const wwb       = json('content/what-we-build.json');
const projPage  = json('content/projects-page.json');
const glob      = json('content/global.json');
const projects  = json('content/projects.json').items;
const record    = json('content/record.json').items;
const divisions = json('content/divisions.json').items;
const tech      = json('content/tech.json');
const why       = wwb.why;
const pages     = { hero: home.hero,
                    sectors: wwb,
                    projects_page: Object.assign({ see_all: home.see_all }, projPage),
                    contact: { heading: glob.contact_heading },
                    footer: glob.footer };
const settings  = glob;

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

const cardHTML = d => `      <div class="sector"><img src="${d.thumb}" alt="${esc(d.thumb_alt || d.title)}"${d.thumb_style ? ' ' + d.thumb_style : ''}><div class="sb"><div class="k">${esc(d.key)}</div><h3>${esc(d.title)}</h3><p>${esc(d.short_body)}</p></div></div>`;

const blockHTML = d => `      <article class="project reveal">
        <div class="p-img"><img src="${d.image}" alt="${esc(d.alt || d.title)}"${d.img_style ? ' ' + d.img_style : ''}></div>
        <div class="p-body">
          <div class="eyebrow">${esc(d.key)}</div>
          <h3>${esc(d.title)}</h3>
          <p>${esc(d.long_body)}</p>
          <div class="p-tags">${(d.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        </div>
      </article>`;

const techRow = r => `      <div class="sched-row"><div class="sc-no">${esc(r.no)}</div><div class="sc-name">${esc(r.name)}</div><div class="sc-desc">${esc(r.desc)}</div></div>`;

const whyCard = c => `      <div class="why-card"><h3><span>${esc(c.num)}</span> ${esc(c.title)}</h3><p>${esc(c.body)}</p></div>`;

const tbCell = c => `        <div class="tb"><div class="l">${esc(c.label)}</div><div class="v">${esc(c.value)}</div></div>`;

const flagship = projects.find(p => p.flagship) || projects[0];

const tokens = {
  '{{PROJECTS}}': projects.map(p => projectHTML(p, p.flagship)).join('\n\n'),
  '{{FLAGSHIP}}': projectHTML(flagship, true),
  '{{RECORD}}': record.map(recHTML).join('\n'),
  '{{DIVISION_CARDS}}': divisions.map(cardHTML).join('\n'),
  '{{DIVISION_BLOCKS}}': divisions.map(blockHTML).join('\n'),
  '{{TECH_ROWS}}': tech.rows.map(techRow).join('\n'),
  '{{TECH_HEADING}}': esc(tech.heading),
  '{{TECH_LEDE}}': esc(tech.lede),
  '{{WHY_CARDS}}': why.cards.map(whyCard).join('\n'),
  '{{WHY_H1}}': esc(why.heading_line1),
  '{{WHY_H2}}': esc(why.heading_line2),
  '{{TITLEBLOCK}}': pages.hero.titleblock.map(tbCell).join('\n'),
  '{{HERO_L1}}': esc(pages.hero.line1),
  '{{HERO_L2}}': esc(pages.hero.line2),
  '{{HERO_L3}}': esc(pages.hero.line3),
  '{{HERO_SUB}}': esc(pages.hero.sub),
  '{{BTN1}}': esc(pages.hero.btn_primary),
  '{{BTN2}}': esc(pages.hero.btn_secondary),
  '{{SEC_H1}}': esc(pages.sectors.heading_line1),
  '{{SEC_H2}}': esc(pages.sectors.heading_line2),
  '{{SEC_LEDE}}': esc(pages.sectors.lede),
  '{{ALSO_NOTE}}': esc(pages.sectors.also_note),
  '{{PROJ_H1}}': esc(pages.projects_page.heading_line1),
  '{{PROJ_H2}}': esc(pages.projects_page.heading_line2),
  '{{PROJ_LEDE}}': esc(pages.projects_page.lede),
  '{{REC_TITLE}}': esc(pages.projects_page.record_title),
  '{{REC_RANGE}}': esc(pages.projects_page.record_range),
  '{{REC_HINT}}': esc(pages.projects_page.record_hint),
  '{{SEE_ALL}}': esc(pages.projects_page.see_all),
  '{{CONTACT_HEADING}}': esc(pages.contact.heading),
  '{{FOOT_L}}': esc(pages.footer.left),
  '{{FOOT_M}}': esc(pages.footer.mid),
  '{{FOOT_R}}': esc(pages.footer.right),
  '{{PHONE}}': esc(settings.phone),
  '{{PHONE_DIGITS}}': String(settings.phone).replace(/\D/g, ''),
  '{{EMAIL}}': esc(settings.email),
  '{{HEAD_OFFICE}}': esc(settings.head_office),
};

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });

for (const f of fs.readdirSync('templates')) {
  let html = read(path.join('templates', f));
  for (const [k, v] of Object.entries(tokens)) html = html.split(k).join(v);
  const leftover = html.match(/{{[A-Z_0-9]+}}/);
  if (leftover) throw new Error(`Unreplaced token ${leftover[0]} in ${f}`);
  fs.writeFileSync(path.join('dist', f), html);
  console.log('built', f);
}

for (const f of ['robots.txt', 'llms.txt', 'CNAME', 'favicon.ico']) fs.copyFileSync(f, path.join('dist', f));
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join('dist', 'sitemap.xml'), fs.readFileSync('sitemap.xml', 'utf8').replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`));
fs.cpSync('images', 'dist/images', { recursive: true });
console.log('build complete');
