export const GENRES = [
  'All',
  'Literary Fiction',
  'Speculative Fiction',
  'Science Fiction',
  'Literary Mystery',
  'Philosophy',
  'Nature & Essays',
];

export const SEED_BOOKS = [
  {
    id: 'piranesi',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    genre: 'Speculative Fiction',
    year: 2020,
    totalPages: 245,
    cover: '/covers/piranesi.jpg',
    synopsis:
      'Piranesi lives in the House—an infinite labyrinth of classical halls lined with thousands of marble statues and flooded at its lower levels by rhythmic ocean tides. Armed only with meticulous journals and an unshakeable kindness, he begins to uncover traces of another visitor and a forgotten truth.',
  },
  {
    id: 'shadow-wind',
    title: 'The Shadow of the Wind',
    author: 'Carlos Ruiz Zafón',
    genre: 'Literary Mystery',
    year: 2001,
    totalPages: 487,
    cover: '/covers/shadow-wind.jpg',
    synopsis:
      'At dawn in postwar Barcelona, a young boy is led by his antiquarian father into the secret Cemetery of Forgotten Books and chooses a single haunting novel. Years later, he discovers someone has been systematically burning every remaining copy—drawing him into a shadowy web of obsession and lost love.',
  },
  {
    id: 'invisible-cities',
    title: 'Invisible Cities',
    author: 'Italo Calvino',
    genre: 'Literary Fiction',
    year: 1972,
    totalPages: 165,
    cover: '/covers/invisible-cities.jpg',
    synopsis:
      'Inside a quiet twilight garden, the explorer Marco Polo describes fifty-five imagined metropolises—cities of memory, desire, mirrors, and suspended thread—to an aging Kublai Khan. Each crystalline miniature reveals another facet of Venice, language, and the architecture of human longing.',
  },
  {
    id: 'left-hand',
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    genre: 'Science Fiction',
    year: 1969,
    totalPages: 304,
    cover: '/covers/left-hand.jpg',
    synopsis:
      'A lone human envoy is sent to Winter, a frozen planet whose inhabitants possess no fixed gender, hoping to bring their nations into an interstellar coalition. Cast out across a merciless polar glacier with a disgraced royal adviser, survival hinges on shedding every assumption about difference and trust.',
  },
  {
    id: 'sweetgrass',
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    genre: 'Nature & Essays',
    year: 2013,
    totalPages: 390,
    cover: '/covers/sweetgrass.jpg',
    synopsis:
      'Drawing on her dual training as a botanist and her Indigenous Potawatomi heritage, Robin Wall Kimmerer listens closely to moss, maple trees, salamanders, and sweetgrass. In lyrical essays, she explores reciprocity with the living earth as an antidote to extraction and disconnection.',
  },
  {
    id: 'station-eleven',
    title: 'Station Eleven',
    author: 'Emily St. John Mandel',
    genre: 'Speculative Fiction',
    year: 2014,
    totalPages: 333,
    cover: '/covers/station-eleven.jpg',
    synopsis:
      'Twenty years after a swift pandemic dissolves modern civilization, a nomadic troupe of actors and musicians travels between scattered settlements performing Shakespeare. Moving gracefully across timelines before and after the collapse, the novel traces the quiet persistence of art and memory.',
  },
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    genre: 'Philosophy',
    year: 180,
    totalPages: 256,
    cover: '/covers/meditations.jpg',
    synopsis:
      'Composed by candlelight during military campaigns along the Danube frontier, these private notebooks were never meant for publication. In clear, unadorned reflections, the Roman emperor reminds himself how to meet impermanence, duty, anger, and solitude with composure.',
  },
  {
    id: 'memory-police',
    title: 'The Memory Police',
    author: 'Yoko Ogawa',
    genre: 'Literary Fiction',
    year: 1994,
    totalPages: 274,
    cover: '/covers/memory-police.jpg',
    synopsis:
      'On a mist-shrouded island, ribbons, photographs, roses, and eventually novels vanish one by one—erased not just from drawers and streets, but from collective memory itself. When a young novelist discovers her editor can still remember what was lost, she hides him beneath her floorboards.',
  },
];

export const INITIAL_STATE = {
  books: SEED_BOOKS,
  wishlistIds: ['invisible-cities', 'left-hand'],
  reading: {
    piranesi: {
      currentPage: 118,
      startedAt: '2026-11-10T20:15:00.000Z',
      sessions: [
        {
          id: 'seed-session-1',
          timestamp: '2026-11-10T21:05:00.000Z',
          startPage: 0,
          endPage: 62,
          pagesRead: 62,
          durationSeconds: 3240,
        },
        {
          id: 'seed-session-2',
          timestamp: '2026-11-12T22:18:00.000Z',
          startPage: 62,
          endPage: 118,
          pagesRead: 56,
          durationSeconds: 3120,
        },
      ],
    },
  },
  completed: {
    'shadow-wind': {
      completedAt: '2026-11-06T22:40:00.000Z',
      totalReadingSeconds: 23040,
      sessionsCount: 6,
      sessions: [
        {
          id: 'sw-s1',
          timestamp: '2026-10-28T21:00:00.000Z',
          startPage: 0,
          endPage: 84,
          pagesRead: 84,
          durationSeconds: 3900,
        },
        {
          id: 'sw-s2',
          timestamp: '2026-10-30T21:30:00.000Z',
          startPage: 84,
          endPage: 170,
          pagesRead: 86,
          durationSeconds: 4020,
        },
        {
          id: 'sw-s3',
          timestamp: '2026-11-01T20:45:00.000Z',
          startPage: 170,
          endPage: 256,
          pagesRead: 86,
          durationSeconds: 3840,
        },
        {
          id: 'sw-s4',
          timestamp: '2026-11-03T22:00:00.000Z',
          startPage: 256,
          endPage: 340,
          pagesRead: 84,
          durationSeconds: 3780,
        },
        {
          id: 'sw-s5',
          timestamp: '2026-11-05T21:15:00.000Z',
          startPage: 340,
          endPage: 418,
          pagesRead: 78,
          durationSeconds: 3720,
        },
        {
          id: 'sw-s6',
          timestamp: '2026-11-06T22:40:00.000Z',
          startPage: 418,
          endPage: 487,
          pagesRead: 69,
          durationSeconds: 3780,
        },
      ],
      rating: 5,
      review:
        'A love letter to quiet bookshops, rain-slicked midnight streets, and stories that refuse to be erased. The pacing accelerates from atmospheric mystery into something genuinely sweeping in the final hundred pages.',
    },
  },
  timer: {
    activeBookId: 'piranesi',
    isRunning: false,
    elapsedSeconds: 0,
    lastStartedAtMs: null,
  },
};
