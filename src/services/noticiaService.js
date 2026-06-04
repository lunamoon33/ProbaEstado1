const KEYWORDS = {
  accidente: ['accidente','choque','atropell','volcó','colisión'],
  incendio: ['incendio','llamas','fuego','bomberos'],
  delito: ['robo','asalt','crimen','asesin','delito','policial'],
  trafico: ['tráfico','tránsito','congestión','bloqueo','paro']
};

const LIMA_PALABRAS = ['lima','callao','miraflores','surco','ate','comas','chorrillos'];

const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

export async function getNoticias(proxyIdx = 0) {
  const RSS = 'https://rpp.pe/rss/ultimas-noticias.xml';
  const url = PROXIES[proxyIdx] + encodeURIComponent(RSS);
  const res = await fetch(url);
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const items = Array.from(xml.querySelectorAll('item'));

  return items.map(item => {
    const titulo = item.querySelector('title')?.textContent || '';
    const desc = item.querySelector('description')?.textContent?.replace(/<[^>]+>/g,'') || '';
    const link = item.querySelector('link')?.textContent || '#';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const full = (titulo + ' ' + desc).toLowerCase();
    const esLima = LIMA_PALABRAS.some(p => full.includes(p));
    const cat = Object.entries(KEYWORDS).find(([,palabras]) =>
      palabras.some(p => full.includes(p))
    )?.[0] || (esLima ? 'otro' : null);
    if (!cat) return null;
    return { titulo, desc, link, pubDate, cat };
  }).filter(Boolean);
}