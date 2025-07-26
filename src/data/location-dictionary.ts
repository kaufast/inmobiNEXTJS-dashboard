/**
 * Dictionary of common location names in Inmobi
 * Used for search suggestions, typo correction, and internationalized searches
 */

/**
 * Major countries in their native and English forms
 */
export const COUNTRIES = [
  // English speaking countries
  'United States', 'USA', 'United Kingdom', 'UK', 'Great Britain', 'England', 'Britain',
  
  // Spanish speaking countries
  'España', 'Spain', 'México', 'Mexico', 'Mexique',
  
  // German speaking countries
  'Deutschland', 'Germany', 'Österreich', 'Austria', 'Schweiz', 'Switzerland',
  'Allemagne', 'Autriche', 'Suisse',
  
  // French speaking countries
  'France', 'Francia', 'Frankreich',
  
  // Catalan regions
  'Catalunya', 'Catalonia', 'Cataluña', 'Catalogne',
];

/**
 * Major cities by country
 */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  // United States
  'United States': [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'San Francisco', 'Seattle', 'Denver', 'Boston', 'Las Vegas', 'Miami',
    'Atlanta', 'Washington', 'Portland'
  ],
  
  // United Kingdom
  'United Kingdom': [
    'London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Liverpool',
    'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh', 'Cardiff', 'Belfast',
    'Oxford', 'Cambridge', 'York', 'Bath', 'Brighton', 'Southampton'
  ],
  
  // Spain
  'Spain': [
    'Madrid', 'Barcelona', 'València', 'Valencia', 'Sevilla', 'Seville',
    'Zaragoza', 'Málaga', 'Malaga', 'Murcia', 'Palma', 'Las Palmas',
    'Bilbao', 'Alicante', 'Córdoba', 'Cordoba', 'Granada', 'Vigo',
    'A Coruña', 'La Coruña', 'Coruña', 'Vitoria', 'Gijón', 'Gijon',
    'San Sebastián', 'San Sebastian', 'Santander', 'Valladolid', 'Salamanca',
    'Burgos', 'León', 'Pamplona', 'Logroño', 'Badajoz', 'Huelva',
    'Tarragona', 'Castellón', 'Lleida', 'Girona', 'Ourense', 'Pontevedra',
    'Lugo', 'Oviedo', 'Cáceres', 'Albacete', 'Cuenca', 'Guadalajara',
    'Toledo', 'Ciudad Real', 'Ávila', 'Segovia', 'Soria', 'Palencia',
    'Zamora', 'Teruel', 'Huesca', 'Jaén', 'Almería', 'Cádiz', 'Jerez',
    'Marbella', 'Torremolinos', 'Benidorm', 'Denia', 'Javea', 'Calpe',
    'Altea', 'Moraira', 'Sitges', 'Lloret de Mar', 'Tossa de Mar'
  ],
  
  // Mexico
  'Mexico': [
    'Ciudad de México', 'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla',
    'Tijuana', 'León', 'Leon', 'Juárez', 'Juarez', 'Cancún', 'Cancun',
    'Mérida', 'Merida', 'Querétaro', 'Queretaro', 'Veracruz', 'Acapulco',
    'Oaxaca', 'Cuernavaca', 'Morelia', 'Chihuahua', 'Tampico', 'Playa del Carmen',
    'Quintana Roo', 'Puerto Vallarta', 'Mazatlán', 'Tulum', 'Cozumel',
    'Los Cabos', 'Cabo San Lucas', 'San José del Cabo', 'La Paz', 'Loreto',
    'Ensenada', 'Rosarito', 'Mexicali', 'Hermosillo', 'Culiacán', 'Durango',
    'Zacatecas', 'San Luis Potosí', 'Aguascalientes', 'Guanajuato', 'Toluca',
    'Pachuca', 'Tlaxcala', 'Xalapa', 'Villahermosa', 'Tuxtla Gutiérrez',
    'Campeche', 'Chetumal', 'Colima', 'Tepic', 'Saltillo', 'Torreón',
    'Reynosa', 'Matamoros', 'Nuevo Laredo', 'Piedras Negras', 'Ciudad Victoria',
    'Ixtapa', 'Zihuatanejo', 'Huatulco', 'Puerto Escondido', 'Sayulita',
    'San Miguel de Allende', 'Taxco', 'Valle de Bravo', 'Tepoztlán'
  ],
  
  // Germany
  'Germany': [
    'Berlin', 'Hamburg', 'München', 'Munich', 'Muenchen', 'Köln', 'Cologne', 'Koeln',
    'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Duesseldorf', 'Dusseldorf', 'Leipzig',
    'Dresden', 'Hannover', 'Nürnberg', 'Nuremberg', 'Nuernberg', 'Bremen',
    'Bonn', 'Mannheim', 'Karlsruhe', 'Freiburg', 'Heidelberg', 'Dortmund',
    'Essen', 'Wiesbaden', 'Mainz', 'Augsburg'
  ],
  
  // Austria
  'Austria': [
    'Wien', 'Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck',
    'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'St. Poelten',
    'Dornbirn', 'Steyr', 'Wiener Neustadt', 'Feldkirch', 'Bregenz',
    'Leoben', 'Krems', 'Baden', 'Wolfsberg'
  ],
  
  // France
  'France': [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier',
    'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne',
    'Le Havre', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'
  ]
};

/**
 * Get all cities as a flat array
 * Used for search suggestions and corrections
 */
export function getAllCities(): string[] {
  return Object.values(CITIES_BY_COUNTRY).flat();
}

/**
 * Get all locations (countries and cities) as a flat array
 * Used for comprehensive search suggestions and corrections
 */
export function getAllLocations(): string[] {
  return [...COUNTRIES, ...getAllCities()];
}

/**
 * Get locations by language/locale for more relevant suggestions
 * @param locale The current locale (e.g., 'en-US', 'es-MX')
 * @returns An array of locations (countries and cities) relevant to that locale
 */
export function getLocationsByLocale(locale: string): string[] {
  if (!locale) return getAllLocations();
  
  // Get cities for this locale
  const cities = getCitiesByLocale(locale);
  
  // Get relevant countries based on locale
  const countries: string[] = [];
  
  if (locale.startsWith('en-US')) {
    countries.push('United States', 'USA');
  } else if (locale.startsWith('en-GB')) {
    countries.push('United Kingdom', 'UK', 'Great Britain', 'England', 'Britain');
  } else if (locale.startsWith('en')) {
    countries.push('United States', 'USA', 'United Kingdom', 'UK', 'Great Britain', 'England', 'Britain');
  }
  
  if (locale.startsWith('es-ES')) {
    countries.push('España', 'Spain');
  } else if (locale.startsWith('es-MX')) {
    countries.push('México', 'Mexico');
  } else if (locale.startsWith('es')) {
    countries.push('España', 'Spain', 'México', 'Mexico');
  }
  
  if (locale.startsWith('de-DE')) {
    countries.push('Deutschland', 'Germany');
  } else if (locale.startsWith('de-AT')) {
    countries.push('Österreich', 'Austria');
  } else if (locale.startsWith('de')) {
    countries.push('Deutschland', 'Germany', 'Österreich', 'Austria', 'Schweiz', 'Switzerland');
  }
  
  if (locale.startsWith('fr-FR')) {
    countries.push('France', 'Francia', 'Frankreich');
  }
  
  if (locale.startsWith('ca-ES')) {
    countries.push('España', 'Spain', 'Catalunya', 'Catalonia', 'Cataluña');
  }
  
  return [...countries, ...cities];
}

/**
 * Get cities by language/locale
 * @param locale The current locale (e.g., 'en-US', 'es-MX')
 * @returns An array of cities relevant to that locale
 */
export function getCitiesByLocale(locale: string): string[] {
  if (!locale) return getAllCities();
  
  // Map locale to countries
  const countriesForLocale: string[] = [];
  
  if (locale.startsWith('en-US')) {
    countriesForLocale.push('United States');
  } else if (locale.startsWith('en-GB')) {
    countriesForLocale.push('United Kingdom');
  } else if (locale.startsWith('es-ES')) {
    countriesForLocale.push('Spain');
  } else if (locale.startsWith('es-MX')) {
    countriesForLocale.push('Mexico');
  } else if (locale.startsWith('de-DE')) {
    countriesForLocale.push('Germany');
  } else if (locale.startsWith('de-AT')) {
    countriesForLocale.push('Austria');
  } else if (locale.startsWith('ca-ES')) {
    countriesForLocale.push('Spain'); // Catalonia is part of Spain
  } else if (locale.startsWith('fr-FR')) {
    countriesForLocale.push('France');
  }
  
  // If no specific locale match, return all cities
  if (countriesForLocale.length === 0) {
    return getAllCities();
  }
  
  // Return cities for the matched countries
  return countriesForLocale
    .map(country => CITIES_BY_COUNTRY[country] || [])
    .flat();
}

/**
 * Postal code to city mapping for major areas
 * Maps postal code patterns to their corresponding cities
 */
export const POSTAL_CODE_TO_CITY: Record<string, { city: string; country: string }> = {
  // United States (ZIP codes)
  '10001': { city: 'New York', country: 'United States' },
  '10002': { city: 'New York', country: 'United States' },
  '10003': { city: 'New York', country: 'United States' },
  '10004': { city: 'New York', country: 'United States' },
  '10005': { city: 'New York', country: 'United States' },
  '90210': { city: 'Los Angeles', country: 'United States' },
  '90211': { city: 'Los Angeles', country: 'United States' },
  '90212': { city: 'Los Angeles', country: 'United States' },
  '60601': { city: 'Chicago', country: 'United States' },
  '60602': { city: 'Chicago', country: 'United States' },
  '77001': { city: 'Houston', country: 'United States' },
  '77002': { city: 'Houston', country: 'United States' },
  '33101': { city: 'Miami', country: 'United States' },
  '33102': { city: 'Miami', country: 'United States' },
  
  // United Kingdom (postcodes)
  'SW1A': { city: 'London', country: 'United Kingdom' },
  'SW1B': { city: 'London', country: 'United Kingdom' },
  'SW1H': { city: 'London', country: 'United Kingdom' },
  'SW1P': { city: 'London', country: 'United Kingdom' },
  'SW1V': { city: 'London', country: 'United Kingdom' },
  'SW1W': { city: 'London', country: 'United Kingdom' },
  'SW1X': { city: 'London', country: 'United Kingdom' },
  'SW1Y': { city: 'London', country: 'United Kingdom' },
  'EC1A': { city: 'London', country: 'United Kingdom' },
  'EC1M': { city: 'London', country: 'United Kingdom' },
  'EC1N': { city: 'London', country: 'United Kingdom' },
  'EC1R': { city: 'London', country: 'United Kingdom' },
  'EC1V': { city: 'London', country: 'United Kingdom' },
  'EC1Y': { city: 'London', country: 'United Kingdom' },
  'M1': { city: 'Manchester', country: 'United Kingdom' },
  'M2': { city: 'Manchester', country: 'United Kingdom' },
  'M3': { city: 'Manchester', country: 'United Kingdom' },
  'M4': { city: 'Manchester', country: 'United Kingdom' },
  'B1': { city: 'Birmingham', country: 'United Kingdom' },
  'B2': { city: 'Birmingham', country: 'United Kingdom' },
  'B3': { city: 'Birmingham', country: 'United Kingdom' },
  'L1': { city: 'Liverpool', country: 'United Kingdom' },
  'L2': { city: 'Liverpool', country: 'United Kingdom' },
  'L3': { city: 'Liverpool', country: 'United Kingdom' },
  
  // Spain (códigos postales)
  '28001': { city: 'Madrid', country: 'Spain' },
  '28002': { city: 'Madrid', country: 'Spain' },
  '28003': { city: 'Madrid', country: 'Spain' },
  '28004': { city: 'Madrid', country: 'Spain' },
  '28005': { city: 'Madrid', country: 'Spain' },
  '28006': { city: 'Madrid', country: 'Spain' },
  '28007': { city: 'Madrid', country: 'Spain' },
  '28008': { city: 'Madrid', country: 'Spain' },
  '28009': { city: 'Madrid', country: 'Spain' },
  '28010': { city: 'Madrid', country: 'Spain' },
  '28011': { city: 'Madrid', country: 'Spain' },
  '28012': { city: 'Madrid', country: 'Spain' },
  '28013': { city: 'Madrid', country: 'Spain' },
  '28014': { city: 'Madrid', country: 'Spain' },
  '28015': { city: 'Madrid', country: 'Spain' },
  '28016': { city: 'Madrid', country: 'Spain' },
  '28017': { city: 'Madrid', country: 'Spain' },
  '28018': { city: 'Madrid', country: 'Spain' },
  '28019': { city: 'Madrid', country: 'Spain' },
  '28020': { city: 'Madrid', country: 'Spain' },
  '08001': { city: 'Barcelona', country: 'Spain' },
  '08002': { city: 'Barcelona', country: 'Spain' },
  '08003': { city: 'Barcelona', country: 'Spain' },
  '08004': { city: 'Barcelona', country: 'Spain' },
  '08005': { city: 'Barcelona', country: 'Spain' },
  '08006': { city: 'Barcelona', country: 'Spain' },
  '08007': { city: 'Barcelona', country: 'Spain' },
  '08008': { city: 'Barcelona', country: 'Spain' },
  '08009': { city: 'Barcelona', country: 'Spain' },
  '08010': { city: 'Barcelona', country: 'Spain' },
  '08011': { city: 'Barcelona', country: 'Spain' },
  '08012': { city: 'Barcelona', country: 'Spain' },
  '08013': { city: 'Barcelona', country: 'Spain' },
  '08014': { city: 'Barcelona', country: 'Spain' },
  '08015': { city: 'Barcelona', country: 'Spain' },
  '08016': { city: 'Barcelona', country: 'Spain' },
  '08017': { city: 'Barcelona', country: 'Spain' },
  '08018': { city: 'Barcelona', country: 'Spain' },
  '08019': { city: 'Barcelona', country: 'Spain' },
  '08020': { city: 'Barcelona', country: 'Spain' },
  '46001': { city: 'Valencia', country: 'Spain' },
  '46002': { city: 'Valencia', country: 'Spain' },
  '46003': { city: 'Valencia', country: 'Spain' },
  '46004': { city: 'Valencia', country: 'Spain' },
  '46005': { city: 'Valencia', country: 'Spain' },
  '46006': { city: 'Valencia', country: 'Spain' },
  '46007': { city: 'Valencia', country: 'Spain' },
  '46008': { city: 'Valencia', country: 'Spain' },
  '46009': { city: 'Valencia', country: 'Spain' },
  '46010': { city: 'Valencia', country: 'Spain' },
  '41001': { city: 'Seville', country: 'Spain' },
  '41002': { city: 'Seville', country: 'Spain' },
  '41003': { city: 'Seville', country: 'Spain' },
  '41004': { city: 'Seville', country: 'Spain' },
  '41005': { city: 'Seville', country: 'Spain' },
  '41006': { city: 'Seville', country: 'Spain' },
  '41007': { city: 'Seville', country: 'Spain' },
  '41008': { city: 'Seville', country: 'Spain' },
  '41009': { city: 'Seville', country: 'Spain' },
  '41010': { city: 'Seville', country: 'Spain' },
  '29001': { city: 'Málaga', country: 'Spain' },
  '29002': { city: 'Málaga', country: 'Spain' },
  '29003': { city: 'Málaga', country: 'Spain' },
  '29004': { city: 'Málaga', country: 'Spain' },
  '29005': { city: 'Málaga', country: 'Spain' },
  '29006': { city: 'Málaga', country: 'Spain' },
  '03001': { city: 'Alicante', country: 'Spain' },
  '03002': { city: 'Alicante', country: 'Spain' },
  '03003': { city: 'Alicante', country: 'Spain' },
  '03004': { city: 'Alicante', country: 'Spain' },
  '03005': { city: 'Alicante', country: 'Spain' },
  '03006': { city: 'Alicante', country: 'Spain' },
  '03007': { city: 'Alicante', country: 'Spain' },
  '03008': { city: 'Alicante', country: 'Spain' },
  '03009': { city: 'Alicante', country: 'Spain' },
  '03010': { city: 'Alicante', country: 'Spain' },
  '03011': { city: 'Alicante', country: 'Spain' },
  '03012': { city: 'Alicante', country: 'Spain' },
  '03013': { city: 'Alicante', country: 'Spain' },
  '03014': { city: 'Alicante', country: 'Spain' },
  '03015': { city: 'Alicante', country: 'Spain' },
  '03016': { city: 'Alicante', country: 'Spain' },
  '03540': { city: 'Alicante', country: 'Spain' },
  '03550': { city: 'Alicante', country: 'Spain' },
  '03560': { city: 'Alicante', country: 'Spain' },
  '03570': { city: 'Alicante', country: 'Spain' },
  '03580': { city: 'Alicante', country: 'Spain' },
  '03590': { city: 'Alicante', country: 'Spain' },
  '11510': { city: 'Cádiz', country: 'Spain' },
  '11511': { city: 'Cádiz', country: 'Spain' },
  '11512': { city: 'Cádiz', country: 'Spain' },
  '11513': { city: 'Cádiz', country: 'Spain' },
  '11514': { city: 'Cádiz', country: 'Spain' },
  '11515': { city: 'Cádiz', country: 'Spain' },
  '11516': { city: 'Cádiz', country: 'Spain' },
  '11517': { city: 'Cádiz', country: 'Spain' },
  '11518': { city: 'Cádiz', country: 'Spain' },
  '11519': { city: 'Cádiz', country: 'Spain' },
  '11520': { city: 'Cádiz', country: 'Spain' },
  
  // Mexico (códigos postales)
  '01000': { city: 'Ciudad de México', country: 'Mexico' },
  '01001': { city: 'Ciudad de México', country: 'Mexico' },
  '01002': { city: 'Ciudad de México', country: 'Mexico' },
  '01003': { city: 'Ciudad de México', country: 'Mexico' },
  '01004': { city: 'Ciudad de México', country: 'Mexico' },
  '01005': { city: 'Ciudad de México', country: 'Mexico' },
  '44100': { city: 'Guadalajara', country: 'Mexico' },
  '44101': { city: 'Guadalajara', country: 'Mexico' },
  '44102': { city: 'Guadalajara', country: 'Mexico' },
  '44103': { city: 'Guadalajara', country: 'Mexico' },
  '44104': { city: 'Guadalajara', country: 'Mexico' },
  '44105': { city: 'Guadalajara', country: 'Mexico' },
  '64000': { city: 'Monterrey', country: 'Mexico' },
  '64001': { city: 'Monterrey', country: 'Mexico' },
  '64002': { city: 'Monterrey', country: 'Mexico' },
  '64003': { city: 'Monterrey', country: 'Mexico' },
  '64004': { city: 'Monterrey', country: 'Mexico' },
  '64005': { city: 'Monterrey', country: 'Mexico' },
  '77500': { city: 'Cancún', country: 'Mexico' },
  '77501': { city: 'Cancún', country: 'Mexico' },
  '77502': { city: 'Cancún', country: 'Mexico' },
  '77503': { city: 'Cancún', country: 'Mexico' },
  '77504': { city: 'Cancún', country: 'Mexico' },
  '77505': { city: 'Cancún', country: 'Mexico' },
  '48300': { city: 'Puerto Vallarta', country: 'Mexico' },
  '48301': { city: 'Puerto Vallarta', country: 'Mexico' },
  '48302': { city: 'Puerto Vallarta', country: 'Mexico' },
  '48303': { city: 'Puerto Vallarta', country: 'Mexico' },
  '48304': { city: 'Puerto Vallarta', country: 'Mexico' },
  '48305': { city: 'Puerto Vallarta', country: 'Mexico' },
  '23000': { city: 'Los Cabos', country: 'Mexico' },
  '23001': { city: 'Los Cabos', country: 'Mexico' },
  '23002': { city: 'Los Cabos', country: 'Mexico' },
  '23003': { city: 'Los Cabos', country: 'Mexico' },
  '23004': { city: 'Los Cabos', country: 'Mexico' },
  '23005': { city: 'Los Cabos', country: 'Mexico' },
  
  // Germany (Postleitzahlen)
  '10115': { city: 'Berlin', country: 'Germany' },
  '10116': { city: 'Berlin', country: 'Germany' },
  '10117': { city: 'Berlin', country: 'Germany' },
  '10118': { city: 'Berlin', country: 'Germany' },
  '10119': { city: 'Berlin', country: 'Germany' },
  '10120': { city: 'Berlin', country: 'Germany' },
  '80331': { city: 'München', country: 'Germany' },
  '80332': { city: 'München', country: 'Germany' },
  '80333': { city: 'München', country: 'Germany' },
  '80334': { city: 'München', country: 'Germany' },
  '80335': { city: 'München', country: 'Germany' },
  '80336': { city: 'München', country: 'Germany' },
  '50667': { city: 'Köln', country: 'Germany' },
  '50668': { city: 'Köln', country: 'Germany' },
  '50669': { city: 'Köln', country: 'Germany' },
  '50670': { city: 'Köln', country: 'Germany' },
  '50671': { city: 'Köln', country: 'Germany' },
  '50672': { city: 'Köln', country: 'Germany' },
  '60311': { city: 'Frankfurt', country: 'Germany' },
  '60312': { city: 'Frankfurt', country: 'Germany' },
  '60313': { city: 'Frankfurt', country: 'Germany' },
  '60314': { city: 'Frankfurt', country: 'Germany' },
  '60315': { city: 'Frankfurt', country: 'Germany' },
  '60316': { city: 'Frankfurt', country: 'Germany' },
  '70173': { city: 'Stuttgart', country: 'Germany' },
  '70174': { city: 'Stuttgart', country: 'Germany' },
  '70175': { city: 'Stuttgart', country: 'Germany' },
  '70176': { city: 'Stuttgart', country: 'Germany' },
  '70177': { city: 'Stuttgart', country: 'Germany' },
  '70178': { city: 'Stuttgart', country: 'Germany' },
  '40210': { city: 'Düsseldorf', country: 'Germany' },
  '40211': { city: 'Düsseldorf', country: 'Germany' },
  '40212': { city: 'Düsseldorf', country: 'Germany' },
  '40213': { city: 'Düsseldorf', country: 'Germany' },
  '40214': { city: 'Düsseldorf', country: 'Germany' },
  '40215': { city: 'Düsseldorf', country: 'Germany' },
  
  // Austria (Postleitzahlen)
  '1010': { city: 'Wien', country: 'Austria' },
  '1020': { city: 'Wien', country: 'Austria' },
  '1030': { city: 'Wien', country: 'Austria' },
  '1040': { city: 'Wien', country: 'Austria' },
  '1050': { city: 'Wien', country: 'Austria' },
  '1060': { city: 'Wien', country: 'Austria' },
  '1070': { city: 'Wien', country: 'Austria' },
  '1080': { city: 'Wien', country: 'Austria' },
  '1090': { city: 'Wien', country: 'Austria' },
  '1100': { city: 'Wien', country: 'Austria' },
  '8010': { city: 'Graz', country: 'Austria' },
  '8020': { city: 'Graz', country: 'Austria' },
  '8030': { city: 'Graz', country: 'Austria' },
  '8040': { city: 'Graz', country: 'Austria' },
  '8050': { city: 'Graz', country: 'Austria' },
  '8060': { city: 'Graz', country: 'Austria' },
  '4020': { city: 'Linz', country: 'Austria' },
  '4030': { city: 'Linz', country: 'Austria' },
  '4040': { city: 'Linz', country: 'Austria' },
  '4050': { city: 'Linz', country: 'Austria' },
  '4060': { city: 'Linz', country: 'Austria' },
  '4070': { city: 'Linz', country: 'Austria' },
  '5020': { city: 'Salzburg', country: 'Austria' },
  '5030': { city: 'Salzburg', country: 'Austria' },
  '5040': { city: 'Salzburg', country: 'Austria' },
  '5050': { city: 'Salzburg', country: 'Austria' },
  '5060': { city: 'Salzburg', country: 'Austria' },
  '5070': { city: 'Salzburg', country: 'Austria' },
  '6020': { city: 'Innsbruck', country: 'Austria' },
  '6030': { city: 'Innsbruck', country: 'Austria' },
  '6040': { city: 'Innsbruck', country: 'Austria' },
  '6050': { city: 'Innsbruck', country: 'Austria' },
  '6060': { city: 'Innsbruck', country: 'Austria' },
  '6070': { city: 'Innsbruck', country: 'Austria' },
  
  // France (codes postaux)
  '75001': { city: 'Paris', country: 'France' },
  '75002': { city: 'Paris', country: 'France' },
  '75003': { city: 'Paris', country: 'France' },
  '75004': { city: 'Paris', country: 'France' },
  '75005': { city: 'Paris', country: 'France' },
  '75006': { city: 'Paris', country: 'France' },
  '75007': { city: 'Paris', country: 'France' },
  '75008': { city: 'Paris', country: 'France' },
  '75009': { city: 'Paris', country: 'France' },
  '75010': { city: 'Paris', country: 'France' },
  '75011': { city: 'Paris', country: 'France' },
  '75012': { city: 'Paris', country: 'France' },
  '75013': { city: 'Paris', country: 'France' },
  '75014': { city: 'Paris', country: 'France' },
  '75015': { city: 'Paris', country: 'France' },
  '75016': { city: 'Paris', country: 'France' },
  '75017': { city: 'Paris', country: 'France' },
  '75018': { city: 'Paris', country: 'France' },
  '75019': { city: 'Paris', country: 'France' },
  '75020': { city: 'Paris', country: 'France' },
  '13001': { city: 'Marseille', country: 'France' },
  '13002': { city: 'Marseille', country: 'France' },
  '13003': { city: 'Marseille', country: 'France' },
  '13004': { city: 'Marseille', country: 'France' },
  '13005': { city: 'Marseille', country: 'France' },
  '13006': { city: 'Marseille', country: 'France' },
  '69001': { city: 'Lyon', country: 'France' },
  '69002': { city: 'Lyon', country: 'France' },
  '69003': { city: 'Lyon', country: 'France' },
  '69004': { city: 'Lyon', country: 'France' },
  '69005': { city: 'Lyon', country: 'France' },
  '69006': { city: 'Lyon', country: 'France' },
  '31000': { city: 'Toulouse', country: 'France' },
  '31001': { city: 'Toulouse', country: 'France' },
  '31002': { city: 'Toulouse', country: 'France' },
  '31003': { city: 'Toulouse', country: 'France' },
  '31004': { city: 'Toulouse', country: 'France' },
  '31005': { city: 'Toulouse', country: 'France' },
  '06000': { city: 'Nice', country: 'France' },
  '06001': { city: 'Nice', country: 'France' },
  '06002': { city: 'Nice', country: 'France' },
  '06003': { city: 'Nice', country: 'France' },
  '06004': { city: 'Nice', country: 'France' },
  '06005': { city: 'Nice', country: 'France' },
  '44000': { city: 'Nantes', country: 'France' },
  '44001': { city: 'Nantes', country: 'France' },
  '44002': { city: 'Nantes', country: 'France' },
  '44003': { city: 'Nantes', country: 'France' },
  '44004': { city: 'Nantes', country: 'France' },
  '44005': { city: 'Nantes', country: 'France' },
};

/**
 * Check if a string looks like a postal code
 * @param text Input text to check
 * @returns boolean indicating if it looks like a postal code
 */
export function isPostalCode(text: string): boolean {
  if (!text) return false;
  
  const trimmed = text.trim();
  
  // US ZIP codes (5 digits or 5+4 format)
  if (/^\d{5}(-\d{4})?$/.test(trimmed)) return true;
  
  // UK postcodes (various formats with optional spaces)
  // Examples: SW1A 1AA, SW1A1AA, M1 1AA, M11AA, B33 8TH, etc.
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(trimmed)) return true;
  
  // German postcodes (5 digits)
  if (/^\d{5}$/.test(trimmed)) return true;
  
  // Austrian postcodes (4 digits)
  if (/^\d{4}$/.test(trimmed)) return true;
  
  // French postcodes (5 digits)
  if (/^\d{5}$/.test(trimmed)) return true;
  
  // Spanish postcodes (5 digits)
  if (/^\d{5}$/.test(trimmed)) return true;
  
  // Mexican postcodes (5 digits)
  if (/^\d{5}$/.test(trimmed)) return true;
  
  // Canadian postcodes (K1A 0A6 format)
  if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(trimmed)) return true;
  
  // Italian postcodes (5 digits)
  if (/^\d{5}$/.test(trimmed)) return true;
  
  // Portuguese postcodes (4 digits followed by dash and 3 digits)
  if (/^\d{4}-\d{3}$/.test(trimmed)) return true;
  
  // Netherlands postcodes (4 digits followed by 2 letters)
  if (/^\d{4}\s?[A-Z]{2}$/i.test(trimmed)) return true;
  
  // Swiss postcodes (4 digits)
  if (/^\d{4}$/.test(trimmed)) return true;
  
  return false;
}

/**
 * Get city and country from postal code
 * @param postalCode The postal code to look up
 * @returns Object with city and country, or null if not found
 */
export function getCityFromPostalCode(postalCode: string): { city: string; country: string } | null {
  if (!postalCode) return null;
  
  const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '');
  
  // Direct lookup
  if (POSTAL_CODE_TO_CITY[normalized]) {
    return POSTAL_CODE_TO_CITY[normalized];
  }
  
  // Try with original spacing for UK postcodes
  const originalNormalized = postalCode.trim().toUpperCase();
  if (POSTAL_CODE_TO_CITY[originalNormalized]) {
    return POSTAL_CODE_TO_CITY[originalNormalized];
  }
  
  // For UK postcodes, try partial matches (e.g., "SW1A 1AA" -> "SW1A")
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(originalNormalized)) {
    const partial = originalNormalized.split(/\s/)[0];
    if (POSTAL_CODE_TO_CITY[partial]) {
      return POSTAL_CODE_TO_CITY[partial];
    }
    
    // Also try without spaces
    const partialNoSpace = normalized.substring(0, 4);
    if (POSTAL_CODE_TO_CITY[partialNoSpace]) {
      return POSTAL_CODE_TO_CITY[partialNoSpace];
    }
  }
  
  // For US ZIP+4, try the 5-digit version
  if (/^\d{5}-\d{4}$/.test(originalNormalized)) {
    const fiveDigit = originalNormalized.split('-')[0];
    if (POSTAL_CODE_TO_CITY[fiveDigit]) {
      return POSTAL_CODE_TO_CITY[fiveDigit];
    }
  }
  
  // For Canadian postcodes, normalize and try lookup
  if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(originalNormalized)) {
    // Try both with and without spaces
    const canadianNormalized = originalNormalized.replace(/\s/g, '');
    if (POSTAL_CODE_TO_CITY[canadianNormalized]) {
      return POSTAL_CODE_TO_CITY[canadianNormalized];
    }
    if (POSTAL_CODE_TO_CITY[originalNormalized]) {
      return POSTAL_CODE_TO_CITY[originalNormalized];
    }
  }
  
  // For Netherlands postcodes (1234AB format), normalize and try lookup
  if (/^\d{4}\s?[A-Z]{2}$/i.test(originalNormalized)) {
    const dutchNormalized = originalNormalized.replace(/\s/g, '');
    if (POSTAL_CODE_TO_CITY[dutchNormalized]) {
      return POSTAL_CODE_TO_CITY[dutchNormalized];
    }
  }
  
  // For Portuguese postcodes (1234-567 format), try lookup
  if (/^\d{4}-\d{3}$/.test(originalNormalized)) {
    if (POSTAL_CODE_TO_CITY[originalNormalized]) {
      return POSTAL_CODE_TO_CITY[originalNormalized];
    }
  }
  
  return null;
}