export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  director: string;
  description: string;
  x: number;
  y: number;
  z: number;
  brightness: number;
  size: number;
}

const GENRES = [
  "Sci-Fi", "Drama", "Thriller", "Action", "Horror",
  "Romance", "Comedy", "Crime", "Mystery", "Adventure",
  "Animation", "Biography", "Fantasy", "History", "War"
];

const DIRECTORS = [
  "Christopher Nolan", "Denis Villeneuve", "Alfonso Cuarón", "Ridley Scott",
  "Stanley Kubrick", "David Fincher", "Quentin Tarantino", "Steven Spielberg",
  "Martin Scorsese", "James Cameron", "Darren Aronofsky", "Wes Anderson",
  "Paul Thomas Anderson", "Coen Brothers", "David Lynch", "Guillermo del Toro",
  "Bong Joon-ho", "Park Chan-wook", "Wong Kar-wai", "Akira Kurosawa"
];

const MOVIE_NAMES = [
  "Interstellar", "Blade Runner 2049", "Arrival", "Inception", "Dune",
  "The Matrix", "2001: A Space Odyssey", "Gravity", "The Martian", "Ex Machina",
  "Her", "Moon", "Annihilation", "Prometheus", "Alien",
  "The Social Network", "Fight Club", "Se7en", "Zodiac", "Gone Girl",
  "Parasite", "Memories of Murder", "Oldboy", "The Handmaiden", "Burning",
  "Pulp Fiction", "Reservoir Dogs", "Django Unchained", "Inglourious Basterds", "The Hateful Eight",
  "There Will Be Blood", "Magnolia", "Boogie Nights", "Punch-Drunk Love", "Phantom Thread",
  "No Country for Old Men", "True Grit", "Fargo", "The Big Lebowski", "Blood Simple",
  "Mulholland Drive", "Blue Velvet", "Eraserhead", "Lost Highway", "Twin Peaks",
  "The Grand Budapest Hotel", "Moonrise Kingdom", "Rushmore", "The Royal Tenenbaums", "Fantastic Mr. Fox",
  "Pan's Labyrinth", "The Shape of Water", "Crimson Peak", "Mimic", "Hellboy",
  "Requiem for a Dream", "Black Swan", "Pi", "The Fountain", "mother!",
  "Spirited Away", "Princess Mononoke", "Howl's Moving Castle", "Nausicaä", "My Neighbor Totoro",
  "Children of Men", "Y Tu Mamá También", "Rome", "The Lubricant", "Gravity",
  "Heat", "Collateral", "Manhunter", "Miami Vice", "Ali",
  "The Dark Knight", "Memento", "Prestige", "Following", "Insomnia",
  "Sicario", "Prisoners", "Enemy", "Incendies", "Polytechnique",
  "12 Years a Slave", "Selma", "Moonlight", "If Beale Street Could Talk", "Queen & Slim",
  "Shutter Island", "Cape Fear", "Taxi Driver", "Raging Bull", "Goodfellas",
  "Schindler's List", "Saving Private Ryan", "A.I.", "Minority Report", "Lincoln",
  "The Revenant", "Birdman", "Amores Perros", "21 Grams", "Babel",
  "Joker", "Whiplash", "Black Swan", "Nightcrawler", "Drive",
  "A Quiet Place", "Hereditary", "Midsommar", "The Witch", "Us",
  "Mad Max: Fury Road", "Terminator 2", "RoboCop", "Total Recall", "Starship Troopers",
  "Snowpiercer", "Okja", "The Host", "Mother", "Memories of Murder",
  "Eternal Sunshine", "Being John Malkovich", "Adaptation", "Synecdoche", "Anomalisa",
  "The Lighthouse", "The Witch", "Midsommar", "Mandy", "Color Out of Space"
];

const DESCRIPTIONS = [
  "A mind-bending journey through the fabric of time and space.",
  "In a dystopian future, one man searches for answers.",
  "Love and loss intertwined with the mysteries of the universe.",
  "When technology surpasses humanity, what remains?",
  "An intimate portrait of ambition, obsession, and consequence.",
  "The line between reality and illusion dissolves.",
  "A story of survival against impossible odds.",
  "Power corrupts, but memory endures.",
  "Beauty found in the darkest corners of existence.",
  "One choice ripples across generations.",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function generateMovies(count: number = 4500): Movie[] {
  const movies: Movie[] = [];
  
  for (let i = 0; i < count; i++) {
    const r1 = seededRandom(i * 7);
    const r2 = seededRandom(i * 13);
    const r3 = seededRandom(i * 17);
    const r4 = seededRandom(i * 23);
    const r5 = seededRandom(i * 31);
    const r6 = seededRandom(i * 37);
    const r7 = seededRandom(i * 41);
    const r8 = seededRandom(i * 43);
    const r9 = seededRandom(i * 47);
    const r10 = seededRandom(i * 53);
    
    const z = (r1 - 0.5) * 200;
    const depth = (z + 100) / 200;
    const brightness = 0.2 + depth * 0.8;
    const size = 0.3 + depth * 1.4;
    
    const nameIdx = Math.floor(r4 * MOVIE_NAMES.length);
    const dirIdx = Math.floor(r5 * DIRECTORS.length);
    const descIdx = Math.floor(r8 * DESCRIPTIONS.length);
    
    const numGenres = 1 + Math.floor(r9 * 2);
    const genres: string[] = [];
    for (let g = 0; g < numGenres; g++) {
      const gIdx = Math.floor(seededRandom(i * 59 + g * 7) * GENRES.length);
      if (!genres.includes(GENRES[gIdx])) genres.push(GENRES[gIdx]);
    }
    
    movies.push({
      id: i,
      title: i < MOVIE_NAMES.length ? MOVIE_NAMES[i] : `${MOVIE_NAMES[nameIdx]} ${Math.floor(r10 * 9) + 2}`,
      year: 1970 + Math.floor(r6 * 54),
      rating: 5 + Math.round(r7 * 50) / 10,
      genre: genres,
      director: DIRECTORS[dirIdx],
      description: DESCRIPTIONS[descIdx],
      x: (r2 - 0.5) * 160,
      y: (r3 - 0.5) * 100,
      z,
      brightness,
      size,
    });
  }
  
  return movies;
}

export const MOVIES = generateMovies(4500);
