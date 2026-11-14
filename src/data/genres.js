export const GENRE_GROUPS = [
  { id: 'fiction', en: 'Fiction & Narrative', es: 'Ficción y narrativa' },
  { id: 'speculative', en: 'Science Fiction & Fantasy', es: 'Ciencia ficción y fantasía' },
  { id: 'mystery', en: 'Mystery, Thriller & Horror', es: 'Misterio, suspense y terror' },
  { id: 'romance_ya', en: 'Romance & Young Readers', es: 'Romance y juvenil' },
  { id: 'poetry_stage', en: 'Poetry, Drama & Visual', es: 'Poesía, teatro y visual' },
  { id: 'nonfiction', en: 'Nonfiction & Humanities', es: 'No ficción y humanidades' },
];

export const LITERARY_GENRES = [
  // Fiction & Narrative
  { id: 'Literary Fiction', group: 'fiction', en: 'Literary Fiction', es: 'Ficción literaria' },
  { id: 'Contemporary Fiction', group: 'fiction', en: 'Contemporary Fiction', es: 'Ficción contemporánea' },
  { id: 'Historical Fiction', group: 'fiction', en: 'Historical Fiction', es: 'Ficción histórica' },
  { id: 'Classic Literature', group: 'fiction', en: 'Classic Literature', es: 'Clásicos universales' },
  { id: 'Magical Realism', group: 'fiction', en: 'Magical Realism', es: 'Realismo mágico' },
  { id: 'Speculative Fiction', group: 'fiction', en: 'Speculative Fiction', es: 'Ficción especulativa' },
  { id: 'Coming of Age', group: 'fiction', en: 'Coming of Age (Bildungsroman)', es: 'Novela de aprendizaje' },
  { id: 'Epistolary Fiction', group: 'fiction', en: 'Epistolary Fiction', es: 'Ficción epistolar' },
  { id: 'Satire & Absurdist', group: 'fiction', en: 'Satire & Absurdist', es: 'Sátira y absurdo' },
  { id: 'Humor & Comedy', group: 'fiction', en: 'Humor & Comedy', es: 'Humor y comedia' },
  { id: 'Family Saga', group: 'fiction', en: 'Family & Domestic Saga', es: 'Saga familiar' },
  { id: 'War & Military Fiction', group: 'fiction', en: 'War & Military Fiction', es: 'Novela bélica' },
  { id: 'Western', group: 'fiction', en: 'Western', es: 'Western' },
  { id: 'Adventure', group: 'fiction', en: 'Adventure', es: 'Aventuras' },
  { id: 'Drama', group: 'fiction', en: 'Drama', es: 'Drama' },
  { id: 'Short Stories', group: 'fiction', en: 'Short Stories', es: 'Cuentos y relatos' },
  { id: 'Novella', group: 'fiction', en: 'Novella', es: 'Novela corta' },
  { id: 'Experimental Fiction', group: 'fiction', en: 'Experimental Fiction', es: 'Ficción experimental' },
  { id: 'Metafiction', group: 'fiction', en: 'Metafiction', es: 'Metaficción' },

  // Science Fiction & Fantasy
  { id: 'Science Fiction', group: 'speculative', en: 'Science Fiction', es: 'Ciencia ficción' },
  { id: 'Space Opera', group: 'speculative', en: 'Space Opera', es: 'Ópera espacial' },
  { id: 'Cyberpunk & Biopunk', group: 'speculative', en: 'Cyberpunk & Biopunk', es: 'Cyberpunk y biopunk' },
  { id: 'Steampunk & Dieselpunk', group: 'speculative', en: 'Steampunk & Dieselpunk', es: 'Steampunk y dieselpunk' },
  { id: 'Dystopian & Utopian', group: 'speculative', en: 'Dystopian & Utopian', es: 'Distopía y utopía' },
  { id: 'Post-Apocalyptic', group: 'speculative', en: 'Post-Apocalyptic', es: 'Postapocalíptico' },
  { id: 'Time Travel', group: 'speculative', en: 'Time Travel', es: 'Viajes en el tiempo' },
  { id: 'Fantasy', group: 'speculative', en: 'Fantasy', es: 'Fantasía' },
  { id: 'High Fantasy', group: 'speculative', en: 'High & Epic Fantasy', es: 'Alta fantasía' },
  { id: 'Urban Fantasy', group: 'speculative', en: 'Urban Fantasy', es: 'Fantasía urbana' },
  { id: 'Dark Fantasy', group: 'speculative', en: 'Dark Fantasy', es: 'Fantasía oscura' },
  { id: 'Grimdark', group: 'speculative', en: 'Grimdark', es: 'Fantasía grimdark' },
  { id: 'Mythic Fantasy', group: 'speculative', en: 'Mythic & Arthurian Fantasy', es: 'Fantasía mítica' },
  { id: 'Fairy Tales & Fables', group: 'speculative', en: 'Fairy Tales & Fables', es: 'Cuentos de hadas y fábulas' },
  { id: 'Mythology & Folklore', group: 'speculative', en: 'Mythology & Folklore', es: 'Mitología y folclore' },

  // Mystery, Thriller & Horror
  { id: 'Mystery & Detective', group: 'mystery', en: 'Mystery & Detective', es: 'Misterio y detectives' },
  { id: 'Cozy Mystery', group: 'mystery', en: 'Cozy Mystery', es: 'Misterio acogedor' },
  { id: 'Historical Mystery', group: 'mystery', en: 'Historical Mystery', es: 'Misterio histórico' },
  { id: 'Crime & Noir', group: 'mystery', en: 'Crime & Noir', es: 'Novela negra y noir' },
  { id: 'Police Procedural', group: 'mystery', en: 'Police Procedural', es: 'Novela policíaca' },
  { id: 'Thriller & Suspense', group: 'mystery', en: 'Thriller & Suspense', es: 'Suspense y thriller' },
  { id: 'Psychological Thriller', group: 'mystery', en: 'Psychological Thriller', es: 'Thriller psicológico' },
  { id: 'Espionage & Political', group: 'mystery', en: 'Espionage & Political Thriller', es: 'Espionaje y thriller político' },
  { id: 'Legal & Medical Thriller', group: 'mystery', en: 'Legal & Medical Thriller', es: 'Thriller legal y médico' },
  { id: 'Horror', group: 'mystery', en: 'Horror', es: 'Terror' },
  { id: 'Gothic Fiction', group: 'mystery', en: 'Gothic Fiction', es: 'Ficción gótica' },
  { id: 'Cosmic & Weird Horror', group: 'mystery', en: 'Cosmic & Weird Horror', es: 'Terror cósmico y extraño' },
  { id: 'Supernatural & Paranormal', group: 'mystery', en: 'Supernatural & Paranormal', es: 'Sobrenatural y paranormal' },

  // Romance & Young Readers
  { id: 'Romance', group: 'romance_ya', en: 'Romance', es: 'Romance' },
  { id: 'Contemporary Romance', group: 'romance_ya', en: 'Contemporary Romance', es: 'Romance contemporáneo' },
  { id: 'Historical Romance', group: 'romance_ya', en: 'Historical Romance', es: 'Romance histórico' },
  { id: 'Romantic Fantasy', group: 'romance_ya', en: 'Romantic Fantasy', es: 'Fantasía romántica' },
  { id: 'Young Adult', group: 'romance_ya', en: 'Young Adult', es: 'Juvenil' },
  { id: 'New Adult', group: 'romance_ya', en: 'New Adult', es: 'New Adult' },
  { id: 'Middle Grade & Children', group: 'romance_ya', en: "Middle Grade & Children's", es: 'Infantil y primer lector' },

  // Poetry, Stage & Visual
  { id: 'Poetry', group: 'poetry_stage', en: 'Poetry', es: 'Poesía' },
  { id: 'Epic Poetry', group: 'poetry_stage', en: 'Epic Poetry', es: 'Poesía épica' },
  { id: 'Theatre & Plays', group: 'poetry_stage', en: 'Theatre & Plays', es: 'Teatro y dramaturgia' },
  { id: 'Graphic Novel & Comics', group: 'poetry_stage', en: 'Graphic Novel & Comics', es: 'Novela gráfica y cómic' },
  { id: 'Manga', group: 'poetry_stage', en: 'Manga', es: 'Manga' },

  // Nonfiction & Humanities
  { id: 'Essays', group: 'nonfiction', en: 'Essays', es: 'Ensayo' },
  { id: 'Literary Criticism', group: 'nonfiction', en: 'Literary Criticism & Theory', es: 'Crítica y teoría literaria' },
  { id: 'Biography & Memoir', group: 'nonfiction', en: 'Biography & Memoir', es: 'Biografía y memorias' },
  { id: 'Autobiography & Letters', group: 'nonfiction', en: 'Autobiography & Letters', es: 'Autobiografía y cartas' },
  { id: 'History', group: 'nonfiction', en: 'History', es: 'Historia' },
  { id: 'Philosophy', group: 'nonfiction', en: 'Philosophy', es: 'Filosofía' },
  { id: 'Psychology', group: 'nonfiction', en: 'Psychology', es: 'Psicología' },
  { id: 'Sociology & Anthropology', group: 'nonfiction', en: 'Sociology & Anthropology', es: 'Sociología y antropología' },
  { id: 'Politics & Society', group: 'nonfiction', en: 'Politics & Society', es: 'Política y sociedad' },
  { id: 'Journalism & True Crime', group: 'nonfiction', en: 'Journalism & True Crime', es: 'Periodismo y crónica' },
  { id: 'Science & Nature', group: 'nonfiction', en: 'Science & Nature', es: 'Ciencia y naturaleza' },
  { id: 'Environment & Ecology', group: 'nonfiction', en: 'Environment & Ecology', es: 'Ecología y medio ambiente' },
  { id: 'Spirituality & Religion', group: 'nonfiction', en: 'Spirituality & Religion', es: 'Espiritualidad y religión' },
  { id: 'Self-Development', group: 'nonfiction', en: 'Self-Development', es: 'Desarrollo personal' },
  { id: 'Art & Architecture', group: 'nonfiction', en: 'Art & Architecture', es: 'Arte y arquitectura' },
  { id: 'Music & Cinema', group: 'nonfiction', en: 'Music & Cinema', es: 'Música y cine' },
  { id: 'Travel & Culture', group: 'nonfiction', en: 'Travel & Culture', es: 'Viajes y cultura' },
  { id: 'Economics & Business', group: 'nonfiction', en: 'Economics & Business', es: 'Economía y empresa' },
  { id: 'Technology', group: 'nonfiction', en: 'Technology', es: 'Tecnología' },
  { id: 'Health & Gastronomy', group: 'nonfiction', en: 'Health & Gastronomy', es: 'Salud y gastronomía' },
  { id: 'General', group: 'nonfiction', en: 'General', es: 'General' },
];

const GENRE_BY_ID = new Map(LITERARY_GENRES.map((g) => [g.id.toLowerCase(), g]));

const CATEGORY_ALIASES = {
  fiction: { en: 'Fiction', es: 'Ficción' },
  'horror & gothic': { en: 'Horror & Gothic', es: 'Terror y gótico' },
  'humor & satire': { en: 'Humor & Satire', es: 'Humor y sátira' },
  'juvenile fiction': { en: 'Young Adult', es: 'Juvenil' },
  'young adult fiction': { en: 'Young Adult', es: 'Juvenil' },
  'biography & autobiography': { en: 'Biography & Memoir', es: 'Biografía y memorias' },
  nature: { en: 'Science & Nature', es: 'Ciencia y naturaleza' },
  science: { en: 'Science & Nature', es: 'Ciencia y naturaleza' },
  religion: { en: 'Spirituality & Religion', es: 'Espiritualidad y religión' },
  'body, mind & spirit': { en: 'Spirituality & Religion', es: 'Espiritualidad y religión' },
  'self-help': { en: 'Self-Development', es: 'Desarrollo personal' },
  'business & economics': { en: 'Economics & Business', es: 'Economía y empresa' },
  'political science': { en: 'Politics & Society', es: 'Política y sociedad' },
  'social science': { en: 'Sociology & Anthropology', es: 'Sociología y antropología' },
  'comics & graphic novels': { en: 'Graphic Novel & Comics', es: 'Novela gráfica y cómic' },
  art: { en: 'Art & Architecture', es: 'Arte y arquitectura' },
  architecture: { en: 'Art & Architecture', es: 'Arte y arquitectura' },
  music: { en: 'Music & Cinema', es: 'Música y cine' },
  'performing arts': { en: 'Theatre & Plays', es: 'Teatro y dramaturgia' },
  travel: { en: 'Travel & Culture', es: 'Viajes y cultura' },
  humor: { en: 'Humor & Comedy', es: 'Humor y comedia' },
  computers: { en: 'Technology', es: 'Tecnología' },
  cooking: { en: 'Health & Gastronomy', es: 'Salud y gastronomía' },
  'health & fitness': { en: 'Health & Gastronomy', es: 'Salud y gastronomía' },
  'literary criticism': { en: 'Literary Criticism & Theory', es: 'Crítica y teoría literaria' },
  'true crime': { en: 'Journalism & True Crime', es: 'Periodismo y crónica' },
};

export function translateGenre(rawGenre, lang = 'en') {
  if (!rawGenre) return 'General';
  const key = rawGenre.trim().toLowerCase();
  const exact = GENRE_BY_ID.get(key);
  if (exact) return exact[lang] || exact.en;
  const alias = CATEGORY_ALIASES[key];
  if (alias) return alias[lang] || alias.en;
  return rawGenre;
}
