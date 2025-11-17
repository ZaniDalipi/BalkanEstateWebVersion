// Balkan countries and their major cities
export interface CityData {
  name: string;
  lat: number;
  lng: number;
}

export interface CountryData {
  name: string;
  code: string;
  cities: CityData[];
}

export const BALKAN_LOCATIONS: CountryData[] = [
  {
    name: 'Kosovo',
    code: 'XK',
    cities: [
      { name: 'Prishtina', lat: 42.6629, lng: 21.1655 },
      { name: 'Prizren', lat: 42.2139, lng: 20.7397 },
      { name: 'Peja', lat: 42.6589, lng: 20.2881 },
      { name: 'Gjakova', lat: 42.3803, lng: 20.4308 },
      { name: 'Ferizaj', lat: 42.3700, lng: 21.1483 },
      { name: 'Gjilan', lat: 42.4636, lng: 21.4694 },
      { name: 'Mitrovica', lat: 42.8914, lng: 20.8661 },
    ],
  },
  {
    name: 'Albania',
    code: 'AL',
    cities: [
      { name: 'Tirana', lat: 41.3275, lng: 19.8187 },
      { name: 'Durres', lat: 41.3245, lng: 19.4564 },
      { name: 'Vlore', lat: 40.4686, lng: 19.4914 },
      { name: 'Shkoder', lat: 42.0687, lng: 19.5126 },
      { name: 'Elbasan', lat: 41.1125, lng: 20.0822 },
      { name: 'Korce', lat: 40.6186, lng: 20.7808 },
    ],
  },
  {
    name: 'North Macedonia',
    code: 'MK',
    cities: [
      { name: 'Skopje', lat: 41.9973, lng: 21.4280 },
      { name: 'Bitola', lat: 41.0311, lng: 21.3347 },
      { name: 'Kumanovo', lat: 42.1322, lng: 21.7144 },
      { name: 'Prilep', lat: 41.3453, lng: 21.5547 },
      { name: 'Tetovo', lat: 42.0103, lng: 20.9714 },
      { name: 'Ohrid', lat: 41.1172, lng: 20.8017 },
    ],
  },
  {
    name: 'Serbia',
    code: 'RS',
    cities: [
      { name: 'Belgrade', lat: 44.7866, lng: 20.4489 },
      { name: 'Novi Sad', lat: 45.2671, lng: 19.8335 },
      { name: 'Nis', lat: 43.3209, lng: 21.8958 },
      { name: 'Kragujevac', lat: 44.0125, lng: 20.9114 },
      { name: 'Subotica', lat: 46.1005, lng: 19.6670 },
    ],
  },
  {
    name: 'Bosnia and Herzegovina',
    code: 'BA',
    cities: [
      { name: 'Sarajevo', lat: 43.8563, lng: 18.4131 },
      { name: 'Banja Luka', lat: 44.7722, lng: 17.1910 },
      { name: 'Mostar', lat: 43.3438, lng: 17.8078 },
      { name: 'Tuzla', lat: 44.5385, lng: 18.6708 },
      { name: 'Zenica', lat: 44.2019, lng: 17.9061 },
    ],
  },
  {
    name: 'Croatia',
    code: 'HR',
    cities: [
      { name: 'Zagreb', lat: 45.8150, lng: 15.9819 },
      { name: 'Split', lat: 43.5081, lng: 16.4402 },
      { name: 'Rijeka', lat: 45.3271, lng: 14.4422 },
      { name: 'Osijek', lat: 45.5550, lng: 18.6955 },
      { name: 'Zadar', lat: 44.1194, lng: 15.2314 },
    ],
  },
  {
    name: 'Montenegro',
    code: 'ME',
    cities: [
      { name: 'Podgorica', lat: 42.4304, lng: 19.2594 },
      { name: 'Niksic', lat: 42.7731, lng: 18.9497 },
      { name: 'Pljevlja', lat: 43.3569, lng: 19.3578 },
      { name: 'Bijelo Polje', lat: 43.0320, lng: 19.7470 },
      { name: 'Kotor', lat: 42.4247, lng: 18.7712 },
    ],
  },
  {
    name: 'Greece',
    code: 'GR',
    cities: [
      { name: 'Athens', lat: 37.9838, lng: 23.7275 },
      { name: 'Thessaloniki', lat: 40.6401, lng: 22.9444 },
      { name: 'Patras', lat: 38.2466, lng: 21.7346 },
      { name: 'Heraklion', lat: 35.3387, lng: 25.1442 },
      { name: 'Larissa', lat: 39.6390, lng: 22.4190 },
    ],
  },
  {
    name: 'Bulgaria',
    code: 'BG',
    cities: [
      { name: 'Sofia', lat: 42.6977, lng: 23.3219 },
      { name: 'Plovdiv', lat: 42.1354, lng: 24.7453 },
      { name: 'Varna', lat: 43.2141, lng: 27.9147 },
      { name: 'Burgas', lat: 42.5048, lng: 27.4626 },
      { name: 'Ruse', lat: 43.8350, lng: 25.9653 },
    ],
  },
  {
    name: 'Romania',
    code: 'RO',
    cities: [
      { name: 'Bucharest', lat: 44.4268, lng: 26.1025 },
      { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236 },
      { name: 'Timisoara', lat: 45.7489, lng: 21.2087 },
      { name: 'Iasi', lat: 47.1585, lng: 27.6014 },
      { name: 'Constanta', lat: 44.1598, lng: 28.6348 },
    ],
  },
];
