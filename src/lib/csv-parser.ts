/**
 * CSV Parser and Validation for Bulk Property Upload
 */

import * as XLSX from 'xlsx';

export interface PropertyRow {
  id: string;
  title: string;
  country: string;
  address: string;
  city: string;
  zipCode: string;
  telephone: string;
  price: number;
  propertyType: string;
  listingType: 'Sale' | 'Rent';
  bedrooms: number;
  toilets: number;
  propertySize: number;
  yearBuilt?: number;
  parkingSpace?: string;
  description: string;
  // Validation flags
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ParsedData {
  properties: PropertyRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
}

export interface ValidationRule {
  field: keyof PropertyRow;
  required: boolean;
  type: 'string' | 'number' | 'enum';
  min?: number;
  max?: number;
  enumValues?: string[];
  pattern?: RegExp;
}

// Validation rules for property fields
const VALIDATION_RULES: ValidationRule[] = [
  { field: 'title', required: true, type: 'string', min: 5, max: 200 },
  { field: 'country', required: true, type: 'enum', enumValues: ['US', 'Mexico', 'Spain', 'Germany', 'Austria', 'United Kingdom'] },
  { field: 'address', required: true, type: 'string', min: 5, max: 500 },
  { field: 'city', required: true, type: 'string', min: 2, max: 100 },
  { field: 'zipCode', required: true, type: 'string', min: 3, max: 20 },
  { field: 'telephone', required: true, type: 'string', min: 8, max: 20 },
  { field: 'price', required: true, type: 'number', min: 0 },
  { field: 'propertyType', required: true, type: 'enum', enumValues: ['House', 'Apartment', 'Condo', 'Villa', 'Townhouse', 'Commercial', 'Land'] },
  { field: 'listingType', required: true, type: 'enum', enumValues: ['Sale', 'Rent'] },
  { field: 'bedrooms', required: true, type: 'number', min: 0, max: 20 },
  { field: 'toilets', required: true, type: 'number', min: 0, max: 20 },
  { field: 'propertySize', required: true, type: 'number', min: 1 },
  { field: 'yearBuilt', required: false, type: 'number', min: 1800, max: new Date().getFullYear() + 5 },
  { field: 'parkingSpace', required: false, type: 'string', max: 100 },
  { field: 'description', required: true, type: 'string', min: 10, max: 2000 }
];

// Country-City validation data
export const COUNTRY_CITIES: Record<string, string[]> = {
  'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh', 'Omaha', 'Miami', 'Oakland', 'Minneapolis', 'Tulsa', 'Cleveland', 'Wichita', 'Arlington', 'New Orleans'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Cancún', 'Mérida', 'Acapulco', 'Querétaro', 'Toluca', 'Chihuahua', 'Aguascalientes', 'Hermosillo', 'Saltillo', 'Mexicali', 'Culiacán', 'Tampico', 'Morelia', 'Reynosa', 'Xalapa', 'Veracruz', 'Coatzacoalcos', 'Villahermosa', 'Cuernavaca', 'Oaxaca', 'Tuxtla Gutiérrez', 'Mazatlán', 'Durango', 'Ensenada', 'Campeche', 'La Paz', 'Zacatecas', 'Colima', 'Tepic', 'Pachuca', 'Tlaxcala', 'Chetumal'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet de Llobregat', 'Vitoria-Gasteiz', 'A Coruña', 'Granada', 'Elche', 'Oviedo', 'Badalona', 'Cartagena', 'Terrassa', 'Jerez de la Frontera', 'Sabadell', 'Móstoles', 'Santa Cruz de Tenerife', 'Pamplona', 'Almería', 'Alcalá de Henares', 'Fuenlabrada', 'Leganés', 'Santander', 'Burgos', 'Castellón de la Plana', 'Albacete', 'Alcorcón', 'Getafe', 'Salamanca'],
  'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Mönchengladbach', 'Gelsenkirchen', 'Aachen', 'Braunschweig', 'Chemnitz', 'Kiel', 'Halle', 'Magdeburg', 'Freiburg', 'Krefeld', 'Mainz', 'Lübeck', 'Erfurt', 'Oberhausen', 'Rostock', 'Kassel'],
  'Austria': ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn', 'Wiener Neustadt', 'Steyr', 'Feldkirch', 'Bregenz', 'Leonding', 'Klosterneuburg', 'Baden', 'Wolfsberg', 'Leoben', 'Krems', 'Traun', 'Amstetten', 'Kapfenberg', 'Mödling', 'Hallein', 'Kufstein', 'Traiskirchen', 'Schwechat', 'Braunau am Inn', 'Stockerau'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Liverpool', 'Bristol', 'Leeds', 'Sheffield', 'Cardiff', 'Belfast', 'Newcastle', 'Nottingham', 'Leicester', 'Coventry', 'Hull', 'Bradford', 'Stoke-on-Trent', 'Wolverhampton', 'Plymouth', 'Derby', 'Swansea', 'Southampton', 'Salford', 'Aberdeen', 'Westminster', 'Portsmouth', 'York', 'Peterborough', 'Dundee', 'Lancaster', 'Oxford', 'Newport', 'Preston', 'St Albans', 'Norwich', 'Chester', 'Cambridge', 'Salisbury', 'Exeter']
};

/**
 * Parse CSV or Excel file and convert to PropertyRow array
 */
export function parseFile(file: File): Promise<PropertyRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook: XLSX.WorkBook;
        
        if (file.name.endsWith('.csv')) {
          workbook = XLSX.read(data, { type: 'binary' });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          workbook = XLSX.read(data, { type: 'binary' });
        } else {
          throw new Error('Unsupported file format. Please use CSV or Excel files.');
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const properties = parseRowsToProperties(jsonData as string[][]);
        resolve(properties);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Convert raw CSV rows to PropertyRow objects
 */
function parseRowsToProperties(rows: string[][]): PropertyRow[] {
  if (rows.length === 0) return [];
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Map headers to expected field names
  const headerMap = createHeaderMap(headers);
  
  return dataRows.map((row, index) => {
    const property: Partial<PropertyRow> = {
      id: `temp_${Date.now()}_${index}`,
      isValid: true,
      errors: [],
      warnings: []
    };
    
    // Map each cell to the corresponding property field
    headers.forEach((header, colIndex) => {
      const fieldName = headerMap[header.toLowerCase().trim()];
      if (fieldName && row[colIndex] !== undefined) {
        const value = row[colIndex]?.toString().trim();
        if (value) {
          property[fieldName] = convertValue(fieldName, value);
        }
      }
    });
    
    return property as PropertyRow;
  });
}

/**
 * Create mapping from CSV headers to PropertyRow fields
 */
function createHeaderMap(headers: string[]): Record<string, keyof PropertyRow> {
  const map: Record<string, keyof PropertyRow> = {};
  
  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().trim();
    switch (normalizedHeader) {
      case 'property title':
      case 'title':
        map[normalizedHeader] = 'title';
        break;
      case 'country':
        map[normalizedHeader] = 'country';
        break;
      case 'address':
        map[normalizedHeader] = 'address';
        break;
      case 'city':
        map[normalizedHeader] = 'city';
        break;
      case 'zip code':
      case 'zipcode':
      case 'postal code':
        map[normalizedHeader] = 'zipCode';
        break;
      case 'telephone':
      case 'phone':
      case 'phone number':
        map[normalizedHeader] = 'telephone';
        break;
      case 'price':
        map[normalizedHeader] = 'price';
        break;
      case 'property type':
      case 'type':
        map[normalizedHeader] = 'propertyType';
        break;
      case 'listing type':
        map[normalizedHeader] = 'listingType';
        break;
      case 'bedrooms':
      case 'beds':
        map[normalizedHeader] = 'bedrooms';
        break;
      case 'toilets':
      case 'bathrooms':
      case 'baths':
        map[normalizedHeader] = 'toilets';
        break;
      case 'property size':
      case 'size':
      case 'square feet':
      case 'sqft':
        map[normalizedHeader] = 'propertySize';
        break;
      case 'year built':
      case 'built year':
        map[normalizedHeader] = 'yearBuilt';
        break;
      case 'parking space':
      case 'parking':
        map[normalizedHeader] = 'parkingSpace';
        break;
      case 'property description':
      case 'description':
        map[normalizedHeader] = 'description';
        break;
    }
  });
  
  return map;
}

/**
 * Convert string values to appropriate types
 */
function convertValue(fieldName: keyof PropertyRow, value: string): any {
  switch (fieldName) {
    case 'price':
    case 'bedrooms':
    case 'toilets':
    case 'propertySize':
    case 'yearBuilt':
      const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return isNaN(numValue) ? 0 : numValue;
    case 'listingType':
      return value.toLowerCase() === 'rent' ? 'Rent' : 'Sale';
    default:
      return value;
  }
}

/**
 * Validate a single property row
 */
export function validateProperty(property: PropertyRow): PropertyRow {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Apply validation rules
  VALIDATION_RULES.forEach(rule => {
    const value = property[rule.field];
    
    // Required field validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} is required`);
      return;
    }
    
    // Skip further validation if field is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return;
    }
    
    // Type validation
    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push(`${rule.field} must be a string`);
    } else if (rule.type === 'number' && typeof value !== 'number') {
      errors.push(`${rule.field} must be a number`);
    } else if (rule.type === 'enum' && rule.enumValues && !rule.enumValues.includes(value as string)) {
      errors.push(`${rule.field} must be one of: ${rule.enumValues.join(', ')}`);
    }
    
    // Length/range validation
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.min && value.length < rule.min) {
        errors.push(`${rule.field} must be at least ${rule.min} characters`);
      }
      if (rule.max && value.length > rule.max) {
        errors.push(`${rule.field} must be no more than ${rule.max} characters`);
      }
    } else if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${rule.field} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${rule.field} must be no more than ${rule.max}`);
      }
    }
    
    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push(`${rule.field} has invalid format`);
    }
  });
  
  // Country-City validation
  if (property.country && property.city) {
    const validCities = COUNTRY_CITIES[property.country];
    if (validCities && !validCities.includes(property.city)) {
      warnings.push(`City "${property.city}" may not be valid for country "${property.country}"`);
    }
  }
  
  return {
    ...property,
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate all properties in the array
 */
export function validateProperties(properties: PropertyRow[]): ParsedData {
  const validatedProperties = properties.map(validateProperty);
  
  return {
    properties: validatedProperties,
    totalRows: properties.length,
    validRows: validatedProperties.filter(p => p.isValid).length,
    invalidRows: validatedProperties.filter(p => !p.isValid).length,
    errors: validatedProperties.flatMap(p => p.errors)
  };
}

/**
 * Get cities for a specific country
 */
export function getCitiesForCountry(country: string): string[] {
  return COUNTRY_CITIES[country] || [];
}

/**
 * Check if a city is valid for a country
 */
export function isCityValidForCountry(city: string, country: string): boolean {
  const validCities = COUNTRY_CITIES[country];
  return validCities ? validCities.includes(city) : true;
}