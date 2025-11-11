import { Municipality } from '../types';

// This is the new raw data structure. It's hierarchical.
// We define it here and it will be processed into the format the app uses.
// FIX: The complex and incorrect type definition was replaced with the simple and correct one.
export const MUNICIPALITY_RAW_DATA: Record<string, Municipality[]> = {
  
  "Greece": [
    {
      "name": "Athens",
      "latitude": 37.9838,
      "longitude": 23.7275,
      "settlements": [
        { "name": "Piraeus", "latitude": 37.9422, "longitude": 23.6472 },
        { "name": "Glyfada", "latitude": 37.8667, "longitude": 23.7500 },
        { "name": "Kifisia", "latitude": 38.0667, "longitude": 23.8167 },
        { "name": "Marousi", "latitude": 38.0500, "longitude": 23.8000 },
        { "name": "Nea Smyrni", "latitude": 37.9500, "longitude": 23.7167 }
      ]
    },
    {
      "name": "Thessaloniki",
      "latitude": 40.6401,
      "longitude": 22.9444,
      "settlements": [
        { "name": "Thessaloniki", "latitude": 40.6401, "longitude": 22.9444 },
        { "name": "Kalamaria", "latitude": 40.5825, "longitude": 22.9500 },
        { "name": "Pylaia", "latitude": 40.6000, "longitude": 22.9867 },
        { "name": "Neapoli", "latitude": 40.6500, "longitude": 22.9417 },
        { "name": "Stavroupoli", "latitude": 40.6667, "longitude": 22.9333 }
      ]
    },
    {
      "name": "Patras",
      "latitude": 38.2464,
      "longitude": 21.7350,
      "settlements": [
        { "name": "Patras", "latitude": 38.2464, "longitude": 21.7350 }
      ]
    },
    {
      "name": "Heraklion",
      "latitude": 35.3387,
      "longitude": 25.1442,
      "settlements": [
        { "name": "Heraklion", "latitude": 35.3387, "longitude": 25.1442 },
        { "name": "Knossos", "latitude": 35.3000, "longitude": 25.1600 }
      ]
    },
    {
      "name": "Larissa",
      "latitude": 39.6417,
      "longitude": 22.4167,
      "settlements": [
        { "name": "Larissa", "latitude": 39.6417, "longitude": 22.4167 }
      ]
    },
    {
      "name": "Volos",
      "latitude": 39.3667,
      "longitude": 22.9333,
      "settlements": [
        { "name": "Volos", "latitude": 39.3667, "longitude": 22.9333 }
      ]
    },
    {
      "name": "Rhodes",
      "latitude": 36.4400,
      "longitude": 28.2220,
      "settlements": [
        { "name": "Rhodes", "latitude": 36.4400, "longitude": 28.2220 },
        { "name": "Faliraki", "latitude": 36.3333, "longitude": 28.2000 }
      ]
    },
    {
      "name": "Ioannina",
      "latitude": 39.6639,
      "longitude": 20.8522,
      "settlements": [
        { "name": "Ioannina", "latitude": 39.6639, "longitude": 20.8522 }
      ]
    },
    {
      "name": "Chania",
      "latitude": 35.5112,
      "longitude": 24.0298,
      "settlements": [
        { "name": "Chania", "latitude": 35.5112, "longitude": 24.0298 },
        { "name": "Platanias", "latitude": 35.5167, "longitude": 23.9167 }
      ]
    },
    {
      "name": "Kavala",
      "latitude": 40.9394,
      "longitude": 24.4019,
      "settlements": [
        { "name": "Kavala", "latitude": 40.9394, "longitude": 24.4019 }
      ]
    },
    {
      "name": "Santorini",
      "latitude": 36.4192,
      "longitude": 25.4323,
      "settlements": [
        { "name": "Fira", "latitude": 36.4167, "longitude": 25.4333 },
        { "name": "Oia", "localNames": ["Οία"], "latitude": 36.4620, "longitude": 25.3750 },
        { "name": "Kamari", "latitude": 36.3700, "longitude": 25.4800 },
        { "name": "Perissa", "latitude": 36.3500, "longitude": 25.4700 }
      ]
    },
    {
      "name": "Mykonos",
      "latitude": 37.4467,
      "longitude": 25.3289,
      "settlements": [
        { "name": "Mykonos Town", "latitude": 37.4467, "longitude": 25.3289 },
        { "name": "Ornos", "latitude": 37.4167, "longitude": 25.3167 }
      ]
    },
    {
      "name": "Corfu",
      "latitude": 39.6240,
      "longitude": 19.9210,
      "settlements": [
        { "name": "Corfu Town", "latitude": 39.6240, "longitude": 19.9210 },
        { "name": "Kavos", "latitude": 39.4000, "longitude": 20.1167 }
      ]
    },
    {
      "name": "Kalamata",
      "latitude": 37.0389,
      "longitude": 22.1142,
      "settlements": [
        { "name": "Kalamata", "latitude": 37.0389, "longitude": 22.1142 }
      ]
    },
    {
      "name": "Trikala",
      "latitude": 39.5550,
      "longitude": 21.7678,
      "settlements": [
        { "name": "Trikala", "latitude": 39.5550, "longitude": 21.7678 }
      ]
    },
    {
      "name": "Serres",
      "latitude": 41.0856,
      "longitude": 23.5497,
      "settlements": [
        { "name": "Serres", "latitude": 41.0856, "longitude": 23.5497 }
      ]
    },
    {
      "name": "Alexandroupoli",
      "latitude": 40.8475,
      "longitude": 25.8744,
      "settlements": [
        { "name": "Alexandroupoli", "latitude": 40.8475, "longitude": 25.8744 }
      ]
    },
    {
      "name": "Xanthi",
      "latitude": 41.1414,
      "longitude": 24.8836,
      "settlements": [
        { "name": "Xanthi", "latitude": 41.1414, "longitude": 24.8836 }
      ]
    },
    {
      "name": "Komotini",
      "latitude": 41.1167,
      "longitude": 25.4167,
      "settlements": [
        { "name": "Komotini", "latitude": 41.1167, "longitude": 25.4167 }
      ]
    },
    {
      "name": "Veroia",
      "latitude": 40.5236,
      "longitude": 22.2022,
      "settlements": [
        { "name": "Veroia", "latitude": 40.5236, "longitude": 22.2022 }
      ]
    },
    {
      "name": "Nafplio",
      "latitude": 37.5656,
      "longitude": 22.8000,
      "settlements": [
        { "name": "Nafplio", "latitude": 37.5656, "longitude": 22.8000 }
      ]
    },
    {
      "name": "Kozani",
      "latitude": 40.3000,
      "longitude": 21.7833,
      "settlements": [
        { "name": "Kozani", "latitude": 40.3000, "longitude": 21.7833 }
      ]
    },
    {
      "name": "Agrinio",
      "latitude": 38.6214,
      "longitude": 21.4078,
      "settlements": [
        { "name": "Agrinio", "latitude": 38.6214, "longitude": 21.4078 }
      ]
    },
    {
      "name": "Katerini",
      "latitude": 40.2719,
      "longitude": 22.5025,
      "settlements": [
        { "name": "Katerini", "latitude": 40.2719, "longitude": 22.5025 }
      ]
    },
    {
      "name": "Tripoli",
      "latitude": 37.5089,
      "longitude": 22.3794,
      "settlements": [
        { "name": "Tripoli", "latitude": 37.5089, "longitude": 22.3794 }
      ]
    },
    {
      "name": "Lamia",
      "latitude": 38.9000,
      "longitude": 22.4333,
      "settlements": [
        { "name": "Lamia", "latitude": 38.9000, "longitude": 22.4333 }
      ]
    },
    {
      "name": "Kos",
      "latitude": 36.8933,
      "longitude": 27.2889,
      "settlements": [
        { "name": "Kos Town", "latitude": 36.8933, "longitude": 27.2889 }
      ]
    },
    {
      "name": "Mytilene",
      "latitude": 39.1044,
      "longitude": 26.5528,
      "settlements": [
        { "name": "Mytilene", "latitude": 39.1044, "longitude": 26.5528 }
      ]
    },
    {
      "name": "Chalkida",
      "latitude": 38.4636,
      "longitude": 23.5994,
      "settlements": [
        { "name": "Chalkida", "latitude": 38.4636, "longitude": 23.5994 }
      ]
    },
    {
      "name": "Sparta",
      "latitude": 37.0733,
      "longitude": 22.4297,
      "settlements": [
        { "name": "Sparta", "latitude": 37.0733, "longitude": 22.4297 }
      ]
    },
    {
      "name": "Pyrgos",
      "latitude": 37.6750,
      "longitude": 21.4417,
      "settlements": [
        { "name": "Pyrgos", "latitude": 37.6750, "longitude": 21.4417 }
      ]
    }
  ],
  "Bulgaria": [
    {
      "name": "Sofia",
      "latitude": 42.6977,
      "longitude": 23.3219,
      "settlements": [
        { "name": "Sofia", "latitude": 42.6977, "longitude": 23.3219 },
        { "name": "Boyana", "latitude": 42.6400, "longitude": 23.2700 },
        { "name": "Pancharevo", "latitude": 42.5900, "longitude": 23.4100 },
        { "name": "Dragalevtsi", "latitude": 42.6200, "longitude": 23.3500 },
        { "name": "Simeonovo", "latitude": 42.6100, "longitude": 23.3300 }
      ]
    },
    {
      "name": "Plovdiv",
      "latitude": 42.1354,
      "longitude": 24.7453,
      "settlements": [
        { "name": "Plovdiv", "latitude": 42.1354, "longitude": 24.7453 },
        { "name": "Maritsa", "latitude": 42.1600, "longitude": 24.7800 },
        { "name": "Rhodopi", "latitude": 42.1200, "longitude": 24.7200 },
        { "name": "Karshiaka", "latitude": 42.1500, "longitude": 24.7000 }
      ]
    },
    {
      "name": "Varna",
      "latitude": 43.2147,
      "longitude": 27.9147,
      "settlements": [
        { "name": "Varna", "latitude": 43.2147, "longitude": 27.9147 },
        { "name": "Golden Sands", "latitude": 43.2800, "longitude": 28.0400 },
        { "name": "Saints Constantine and Helena", "latitude": 43.2300, "longitude": 27.9800 },
        { "name": "Asparuhovo", "latitude": 43.1900, "longitude": 27.9000 }
      ]
    },
    {
      "name": "Burgas",
      "latitude": 42.5048,
      "longitude": 27.4626,
      "settlements": [
        { "name": "Burgas", "latitude": 42.5048, "longitude": 27.4626 },
        { "name": "Sarafovo", "latitude": 42.5600, "longitude": 27.5100 },
        { "name": "Kraimorie", "latitude": 42.4800, "longitude": 27.4700 }
      ]
    },
    {
      "name": "Ruse",
      "latitude": 43.8564,
      "longitude": 25.9708,
      "settlements": [
        { "name": "Ruse", "latitude": 43.8564, "longitude": 25.9708 }
      ]
    },
    {
      "name": "Stara Zagora",
      "latitude": 42.4258,
      "longitude": 25.6344,
      "settlements": [
        { "name": "Stara Zagora", "latitude": 42.4258, "longitude": 25.6344 }
      ]
    },
    {
      "name": "Pleven",
      "latitude": 43.4133,
      "longitude": 24.6169,
      "settlements": [
        { "name": "Pleven", "latitude": 43.4133, "longitude": 24.6169 }
      ]
    },
    {
      "name": "Sliven",
      "latitude": 42.6819,
      "longitude": 26.3228,
      "settlements": [
        { "name": "Sliven", "latitude": 42.6819, "longitude": 26.3228 }
      ]
    },
    {
      "name": "Dobrich",
      "latitude": 43.5667,
      "longitude": 27.8333,
      "settlements": [
        { "name": "Dobrich", "latitude": 43.5667, "longitude": 27.8333 }
      ]
    },
    {
      "name": "Shumen",
      "latitude": 43.2714,
      "longitude": 26.9233,
      "settlements": [
        { "name": "Shumen", "latitude": 43.2714, "longitude": 26.9233 }
      ]
    },
    {
      "name": "Pernik",
      "latitude": 42.6000,
      "longitude": 23.0333,
      "settlements": [
        { "name": "Pernik", "latitude": 42.6000, "longitude": 23.0333 }
      ]
    },
    {
      "name": "Haskovo",
      "latitude": 41.9344,
      "longitude": 25.5556,
      "settlements": [
        { "name": "Haskovo", "latitude": 41.9344, "longitude": 25.5556 }
      ]
    },
    {
      "name": "Yambol",
      "latitude": 42.4833,
      "longitude": 26.5000,
      "settlements": [
        { "name": "Yambol", "latitude": 42.4833, "longitude": 26.5000 }
      ]
    },
    {
      "name": "Pazardzhik",
      "latitude": 42.2000,
      "longitude": 24.3333,
      "settlements": [
        { "name": "Pazardzhik", "latitude": 42.2000, "longitude": 24.3333 }
      ]
    },
    {
      "name": "Blagoevgrad",
      "latitude": 42.0167,
      "longitude": 23.0833,
      "settlements": [
        { "name": "Blagoevgrad", "latitude": 42.0167, "longitude": 23.0833 }
      ]
    },
    {
      "name": "Veliko Tarnovo",
      "latitude": 43.0811,
      "longitude": 25.6294,
      "settlements": [
        { "name": "Veliko Tarnovo", "latitude": 43.0811, "longitude": 25.6294 }
      ]
    },
    {
      "name": "Vratsa",
      "latitude": 43.2100,
      "longitude": 23.5625,
      "settlements": [
        { "name": "Vratsa", "latitude": 43.2100, "longitude": 23.5625 }
      ]
    },
    {
      "name": "Gabrovo",
      "latitude": 42.8742,
      "longitude": 25.3178,
      "settlements": [
        { "name": "Gabrovo", "latitude": 42.8742, "longitude": 25.3178 }
      ]
    },
    {
      "name": "Asenovgrad",
      "latitude": 42.0167,
      "longitude": 24.8667,
      "settlements": [
        { "name": "Asenovgrad", "latitude": 42.0167, "longitude": 24.8667 }
      ]
    },
    {
      "name": "Vidin",
      "latitude": 43.9900,
      "longitude": 22.8725,
      "settlements": [
        { "name": "Vidin", "latitude": 43.9900, "longitude": 22.8725 }
      ]
    },
    {
      "name": "Kazanlak",
      "latitude": 42.6194,
      "longitude": 25.3931,
      "settlements": [
        { "name": "Kazanlak", "latitude": 42.6194, "longitude": 25.3931 }
      ]
    },
    {
      "name": "Kyustendil",
      "latitude": 42.2839,
      "longitude": 22.6911,
      "settlements": [
        { "name": "Kyustendil", "latitude": 42.2839, "longitude": 22.6911 }
      ]
    },
    {
      "name": "Montana",
      "latitude": 43.4125,
      "longitude": 23.2250,
      "settlements": [
        { "name": "Montana", "latitude": 43.4125, "longitude": 23.2250 }
      ]
    },
    {
      "name": "Dimitrovgrad",
      "latitude": 42.0500,
      "longitude": 25.6000,
      "settlements": [
        { "name": "Dimitrovgrad", "latitude": 42.0500, "longitude": 25.6000 }
      ]
    },
    {
      "name": "Targovishte",
      "latitude": 43.2500,
      "longitude": 26.5667,
      "settlements": [
        { "name": "Targovishte", "latitude": 43.2500, "longitude": 26.5667 }
      ]
    },
    {
      "name": "Silistra",
      "latitude": 44.1167,
      "longitude": 27.2667,
      "settlements": [
        { "name": "Silistra", "latitude": 44.1167, "longitude": 27.2667 }
      ]
    },
    {
      "name": "Lovech",
      "latitude": 43.1333,
      "longitude": 24.7167,
      "settlements": [
        { "name": "Lovech", "latitude": 43.1333, "longitude": 24.7167 }
      ]
    },
    {
      "name": "Razgrad",
      "latitude": 43.5333,
      "longitude": 26.5167,
      "settlements": [
        { "name": "Razgrad", "latitude": 43.5333, "longitude": 26.5167 }
      ]
    },
    {
      "name": "Petrich",
      "latitude": 41.4000,
      "longitude": 23.2167,
      "settlements": [
        { "name": "Petrich", "latitude": 41.4000, "longitude": 23.2167 }
      ]
    },
    {
      "name": "Sandanski",
      "latitude": 41.5667,
      "longitude": 23.2833,
      "settlements": [
        { "name": "Sandanski", "latitude": 41.5667, "longitude": 23.2833 }
      ]
    },
    {
      "name": "Samokov",
      "latitude": 42.3372,
      "longitude": 23.5550,
      "settlements": [
        { "name": "Samokov", "latitude": 42.3372, "longitude": 23.5550 }
      ]
    },
    {
      "name": "Lom",
      "latitude": 43.8278,
      "longitude": 23.2361,
      "settlements": [
        { "name": "Lom", "latitude": 43.8278, "longitude": 23.2361 }
      ]
    },
    {
      "name": "Sevlievo",
      "latitude": 43.0258,
      "longitude": 25.1136,
      "settlements": [
        { "name": "Sevlievo", "latitude": 43.0258, "longitude": 25.1136 }
      ]
    },
    {
      "name": "Nova Zagora",
      "latitude": 42.4833,
      "longitude": 26.0167,
      "settlements": [
        { "name": "Nova Zagora", "latitude": 42.4833, "longitude": 26.0167 }
      ]
    },
    {
      "name": "Velingrad",
      "latitude": 42.0275,
      "longitude": 23.9911,
      "settlements": [
        { "name": "Velingrad", "latitude": 42.0275, "longitude": 23.9911 }
      ]
    },
    {
      "name": "Smolyan",
      "latitude": 41.5833,
      "longitude": 24.7000,
      "settlements": [
        { "name": "Smolyan", "latitude": 41.5833, "longitude": 24.7000 }
      ]
    },
    {
      "name": "Botevgrad",
      "latitude": 42.9000,
      "longitude": 23.7833,
      "settlements": [
        { "name": "Botevgrad", "latitude": 42.9000, "longitude": 23.7833 }
      ]
    },
    {
      "name": "Gotse Delchev",
      "latitude": 41.5667,
      "longitude": 23.7333,
      "settlements": [
        { "name": "Gotse Delchev", "latitude": 41.5667, "longitude": 23.7333 }
      ]
    },
    {
      "name": "Peshtera",
      "latitude": 42.0333,
      "longitude": 24.3000,
      "settlements": [
        { "name": "Peshtera", "latitude": 42.0333, "longitude": 24.3000 }
      ]
    },
    {
      "name": "Harmanli",
      "latitude": 41.9333,
      "longitude": 25.9000,
      "settlements": [
        { "name": "Harmali", "latitude": 41.9333, "longitude": 25.9000 }
      ]
    },
    {
      "name": "Karnobat",
      "latitude": 42.6500,
      "longitude": 26.9833,
      "settlements": [
        { "name": "Karnobat", "latitude": 42.6500, "longitude": 26.9833 }
      ]
    },
    {
      "name": "Svishtov",
      "latitude": 43.6167,
      "longitude": 25.3500,
      "settlements": [
        { "name": "Svishtov", "latitude": 43.6167, "longitude": 25.3500 }
      ]
    },
    {
      "name": "Panagyurishte",
      "latitude": 42.5000,
      "longitude": 24.1833,
      "settlements": [
        { "name": "Panagyurishte", "latitude": 42.5000, "longitude": 24.1833 }
      ]
    },
    {
      "name": "Popovo",
      "latitude": 43.3500,
      "longitude": 26.2333,
      "settlements": [
        { "name": "Popovo", "latitude": 43.3500, "longitude": 26.2333 }
      ]
    },
    {
      "name": "Chirpan",
      "latitude": 42.2000,
      "longitude": 25.3333,
      "settlements": [
        { "name": "Chirpan", "latitude": 42.2000, "longitude": 25.3333 }
      ]
    },
    {
      "name": "Parvomay",
      "latitude": 42.1000,
      "longitude": 25.2167,
      "settlements": [
        { "name": "Parvomay", "latitude": 42.1000, "longitude": 25.2167 }
      ]
    },
    {
      "name": "Rakovski",
      "latitude": 42.3000,
      "longitude": 24.9667,
      "settlements": [
        { "name": "Rakovski", "latitude": 42.3000, "longitude": 24.9667 }
      ]
    },
    {
      "name": "Bansko",
      "latitude": 41.8383,
      "longitude": 23.4886,
      "settlements": [
        { "name": "Bansko", "latitude": 41.8383, "longitude": 23.4886 }
      ]
    },
    {
      "name": "Belogradchik",
      "latitude": 43.6272,
      "longitude": 22.6836,
      "settlements": [
        { "name": "Belogradchik", "latitude": 43.6272, "longitude": 22.6836 }
      ]
    },
    {
      "name": "Tryavna",
      "latitude": 42.8667,
      "longitude": 25.5000,
      "settlements": [
        { "name": "Tryavna", "latitude": 42.8667, "longitude": 25.5000 }
      ]
    },
    {
      "name": "Pomorie",
      "latitude": 42.5500,
      "longitude": 27.6500,
      "settlements": [
        { "name": "Pomorie", "latitude": 42.5500, "longitude": 27.6500 }
      ]
    },
    {
      "name": "Nesebar",
      "latitude": 42.6583,
      "longitude": 27.7347,
      "settlements": [
        { "name": "Nesebar", "latitude": 42.6583, "longitude": 27.7347 }
      ]
    },
    {
      "name": "Sozopol",
      "latitude": 42.4167,
      "longitude": 27.7000,
      "settlements": [
        { "name": "Sozopol", "latitude": 42.4167, "longitude": 27.7000 }
      ]
    },
    {
      "name": "Primorsko",
      "latitude": 42.2667,
      "longitude": 27.7667,
      "settlements": [
        { "name": "Primorsko", "latitude": 42.2667, "longitude": 27.7667 }
      ]
    },
    {
      "name": "Kiten",
      "latitude": 42.2344,
      "longitude": 27.7742,
      "settlements": [
        { "name": "Kiten", "latitude": 42.2344, "longitude": 27.7742 }
      ]
    },
    {
      "name": "Ahtopol",
      "latitude": 42.1000,
      "longitude": 27.9500,
      "settlements": [
        { "name": "Ahtopol", "latitude": 42.1000, "longitude": 27.9500 }
      ]
    }
  ],
  "North Macedonia": [
    {
      "name": "Skopje",
      "latitude": 41.9981,
      "longitude": 21.4254,
      "settlements": [
        { "name": "Skopje", "latitude": 41.9981, "longitude": 21.4254 },
        { "name": "Aerodrom", "latitude": 41.9800, "longitude": 21.4700 },
        { "name": "Karpoš", "latitude": 42.0000, "longitude": 21.3900 },
        { "name": "Gazi Baba", "latitude": 42.0100, "longitude": 21.4800 },
        { "name": "Centar", "latitude": 41.9950, "longitude": 21.4300 },
        { "name": "Čair", "latitude": 42.0050, "longitude": 21.4400 },
        { "name": "Butel", "latitude": 42.0300, "longitude": 21.4500 },
        { "name": "Šuto Orizari", "latitude": 42.0400, "longitude": 21.4200 }
      ]
    },
    {
      "name": "Bitola",
      "latitude": 41.0319,
      "longitude": 21.3347,
      "settlements": [
        { "name": "Bitola", "latitude": 41.0319, "longitude": 21.3347 },
        { "name": "Bukovo", "latitude": 40.9900, "longitude": 21.3300 },
        { "name": "Lavci", "latitude": 41.0400, "longitude": 21.3000 },
        { "name": "Bistrica", "latitude": 41.0200, "longitude": 21.3500 }
      ]
    },
    {
      "name": "Kumanovo",
      "latitude": 42.1322,
      "longitude": 21.7144,
      "settlements": [
        { "name": "Kumanovo", "latitude": 42.1322, "longitude": 21.7144 },
        { "name": "Romanovce", "latitude": 42.1000, "longitude": 21.7000 }
      ]
    },
    {
      "name": "Prilep",
      "latitude": 41.3453,
      "longitude": 21.5550,
      "settlements": [
        { "name": "Prilep", "latitude": 41.3453, "longitude": 21.5550 },
        { "name": "Varoš", "latitude": 41.3300, "longitude": 21.5700 }
      ]
    },
    {
      "name": "Tetovo",
      "latitude": 42.0106,
      "longitude": 20.9714,
      "settlements": [
        { "name": "Tetovo", "latitude": 42.0106, "longitude": 20.9714 },
        { "name": "Šipkovica", "latitude": 42.0500, "longitude": 20.9000 }
      ]
    },
    {
      "name": "Veles",
      "latitude": 41.7156,
      "longitude": 21.7756,
      "settlements": [
        { "name": "Veles", "latitude": 41.7156, "longitude": 21.7756 }
      ]
    },
    {
      "name": "Štip",
      "latitude": 41.7361,
      "longitude": 22.1936,
      "settlements": [
        { "name": "Štip", "latitude": 41.7361, "longitude": 22.1936 }
      ]
    },
    {
      "name": "Ohrid",
      "latitude": 41.1171,
      "longitude": 20.8016,
      "settlements": [
        { "name": "Ohrid", "latitude": 41.1171, "longitude": 20.8016 },
        { "name": "Peštani", "latitude": 41.0100, "longitude": 20.8100 },
        { "name": "Trpejca", "latitude": 40.9800, "longitude": 20.7800 },
        { "name": "Velgošti", "latitude": 41.1300, "longitude": 20.8500 },
        { "name": "Dolno Konjsko", "latitude": 41.1500, "longitude": 20.8000 }
      ]
    },
    {
      "name": "Gostivar",
      "latitude": 41.7972,
      "longitude": 20.9083,
      "settlements": [
        { "name": "Gostivar", "latitude": 41.7972, "longitude": 20.9083 }
      ]
    },
    {
      "name": "Strumica",
      "latitude": 41.4375,
      "longitude": 22.6433,
      "settlements": [
        { "name": "Strumica", "latitude": 41.4375, "longitude": 22.6433 }
      ]
    },
    {
      "name": "Kavadarci",
      "latitude": 41.4331,
      "longitude": 22.0119,
      "settlements": [
        { "name": "Kavadarci", "latitude": 41.4331, "longitude": 22.0119 }
      ]
    },
    {
      "name": "Kočani",
      "latitude": 41.9167,
      "longitude": 22.4125,
      "settlements": [
        { "name": "Kočani", "latitude": 41.9167, "longitude": 22.4125 }
      ]
    },
    {
      "name": "Kičevo",
      "latitude": 41.5147,
      "longitude": 20.9633,
      "settlements": [
        { "name": "Kičevo", "latitude": 41.5147, "longitude": 20.9633 }
      ]
    },
    {
      "name": "Struga",
      "latitude": 41.1778,
      "longitude": 20.6783,
      "settlements": [
        { "name": "Struga", "latitude": 41.1778, "longitude": 20.6783 },
        { "name": "Radožda", "latitude": 41.0800, "longitude": 20.6400 },
        { "name": "Kališta", "latitude": 41.1300, "longitude": 20.6400 },
        { "name": "Labuništa", "latitude": 41.2667, "longitude": 20.6000 }
      ]
    },
    {
      "name": "Radoviš",
      "latitude": 41.6383,
      "longitude": 22.4647,
      "settlements": [
        { "name": "Radoviš", "latitude": 41.6383, "longitude": 22.4647 }
      ]
    },
    {
      "name": "Gevgelija",
      "latitude": 41.1392,
      "longitude": 22.5025,
      "settlements": [
        { "name": "Gevgelija", "latitude": 41.1392, "longitude": 22.5025 },
        { "name": "Bogorodica", "latitude": 41.1000, "longitude": 22.5500 }
      ]
    },
    {
      "name": "Debar",
      "latitude": 41.5250,
      "longitude": 20.5272,
      "settlements": [
        { "name": "Debar", "latitude": 41.5250, "longitude": 20.5272 }
      ]
    },
    {
      "name": "Kriva Palanka",
      "latitude": 42.2019,
      "longitude": 22.3317,
      "settlements": [
        { "name": "Kriva Palanka", "latitude": 42.2019, "longitude": 22.3317 }
      ]
    },
    {
      "name": "Sveti Nikole",
      "latitude": 41.8650,
      "longitude": 21.9422,
      "settlements": [
        { "name": "Sveti Nikole", "latitude": 41.8650, "longitude": 21.9422 }
      ]
    },
    {
      "name": "Negotino",
      "latitude": 41.4842,
      "longitude": 22.0892,
      "settlements": [
        { "name": "Negotino", "latitude": 41.4842, "longitude": 22.0892 }
      ]
    },
    {
      "name": "Delčevo",
      "latitude": 41.9667,
      "longitude": 22.7750,
      "settlements": [
        { "name": "Delčevo", "latitude": 41.9667, "longitude": 22.7750 }
      ]
    },
    {
      "name": "Vinica",
      "latitude": 41.8831,
      "longitude": 22.5092,
      "settlements": [
        { "name": "Vinica", "latitude": 41.8831, "longitude": 22.5092 }
      ]
    },
    {
      "name": "Probištip",
      "latitude": 42.0031,
      "longitude": 22.1783,
      "settlements": [
        { "name": "Probištip", "latitude": 42.0031, "longitude": 22.1783 }
      ]
    },
    {
      "name": "Berovo",
      "latitude": 41.7072,
      "longitude": 22.8578,
      "settlements": [
        { "name": "Berovo", "latitude": 41.7072, "longitude": 22.8578 }
      ]
    },
    {
      "name": "Kratovo",
      "latitude": 42.0792,
      "longitude": 22.1806,
      "settlements": [
        { "name": "Kratovo", "latitude": 42.0792, "longitude": 22.1806 }
      ]
    },
    {
      "name": "Krusevo",
      "latitude": 41.3689,
      "longitude": 21.2483,
      "settlements": [
        { "name": "Krusevo", "latitude": 41.3689, "longitude": 21.2483 }
      ]
    },
    {
      "name": "Makedonski Brod",
      "latitude": 41.5136,
      "longitude": 21.2153,
      "settlements": [
        { "name": "Makedonski Brod", "latitude": 41.5136, "longitude": 21.2153 }
      ]
    },
    {
      "name": "Resen",
      "latitude": 41.0889,
      "longitude": 21.0122,
      "settlements": [
        { "name": "Resen", "latitude": 41.0889, "longitude": 21.0122 },
        { "name": "Krani", "localNames": ["Крани"], "latitude": 40.9750, "longitude": 21.0600 },
        { "name": "Nakolec", "localNames": ["Наколец"], "latitude": 40.9200, "longitude": 21.0900 },
        { "name": "Brajčino", "localNames": ["Брајчино"], "latitude": 40.9250, "longitude": 21.1660 },
        { "name": "Stenje", "localNames": ["Стење"], "latitude": 40.9500, "longitude": 21.0830 },
        { "name": "Ljubojno", "latitude": 40.8900, "longitude": 21.1400 },
        { "name": "Dolno Dupeni", "latitude": 40.8700, "longitude": 21.1100 }
      ]
    },
    {
      "name": "Makedonska Kamenica",
      "latitude": 42.0200,
      "longitude": 22.5919,
      "settlements": [
        { "name": "Makedonska Kamenica", "latitude": 42.0200, "longitude": 22.5919 }
      ]
    },
    {
      "name": "Demir Hisar",
      "latitude": 41.2208,
      "longitude": 21.2031,
      "settlements": [
        { "name": "Demir Hisar", "latitude": 41.2208, "longitude": 21.2031 }
      ]
    },
    {
      "name": "Demir Kapija",
      "latitude": 41.4064,
      "longitude": 22.2464,
      "settlements": [
        { "name": "Demir Kapija", "latitude": 41.4064, "longitude": 22.2464 }
      ]
    },
    {
      "name": "Valandovo",
      "latitude": 41.3172,
      "longitude": 22.5611,
      "settlements": [
        { "name": "Valandovo", "latitude": 41.3172, "longitude": 22.5611 }
      ]
    },
    {
      "name": "Bogdanci",
      "latitude": 41.2031,
      "longitude": 22.5756,
      "settlements": [
        { "name": "Bogdanci", "latitude": 41.2031, "longitude": 22.5756 }
      ]
    },
    {
      "name": "Novo Selo",
      "latitude": 41.4147,
      "longitude": 22.8800,
      "settlements": [
        { "name": "Novo Selo", "latitude": 41.4147, "longitude": 22.8800 }
      ]
    },
    {
      "name": "Bosilovo",
      "latitude": 41.4406,
      "longitude": 22.7278,
      "settlements": [
        { "name": "Bosilovo", "latitude": 41.4406, "longitude": 22.7278 }
      ]
    },
    {
      "name": "Vasilevo",
      "latitude": 41.4761,
      "longitude": 22.6419,
      "settlements": [
        { "name": "Vasilevo", "latitude": 41.4761, "longitude": 22.6419 }
      ]
    },
    {
      "name": "Konče",
      "latitude": 41.4958,
      "longitude": 22.3839,
      "settlements": [
        { "name": "Konče", "latitude": 41.4958, "longitude": 22.3839 }
      ]
    },
    {
      "name": "Belčišta",
      "latitude": 41.3028,
      "longitude": 20.8303,
      "settlements": [
        { "name": "Belčišta", "latitude": 41.3028, "longitude": 20.8303 }
      ]
    },
    {
      "name": "Zletovo",
      "latitude": 41.9886,
      "longitude": 22.2361,
      "settlements": [
        { "name": "Zletovo", "latitude": 41.9886, "longitude": 22.2361 }
      ]
    },
    {
      "name": "Orašac",
      "latitude": 41.9258,
      "longitude": 21.4931,
      "settlements": [
        { "name": "Orašac", "latitude": 41.9258, "longitude": 21.4931 }
      ]
    },
    {
      "name": "Češinovo",
      "latitude": 41.8714,
      "longitude": 22.2897,
      "settlements": [
        { "name": "Češinovo", "latitude": 41.8714, "longitude": 22.2897 }
      ]
    },
    {
      "name": "Mogila",
      "latitude": 41.1083,
      "longitude": 21.3792,
      "settlements": [
        { "name": "Mogila", "latitude": 41.1083, "longitude": 21.3792 }
      ]
    },
    {
      "name": "Rosoman",
      "latitude": 41.5161,
      "longitude": 21.9458,
      "settlements": [
        { "name": "Rosoman", "latitude": 41.5161, "longitude": 21.9458 }
      ]
    },
    {
      "name": "Jegunovce",
      "latitude": 42.0739,
      "longitude": 21.1236,
      "settlements": [
        { "name": "Jegunovce", "latitude": 42.0739, "longitude": 21.1236 }
      ]
    },
    {
      "name": "Želino",
      "latitude": 41.9803,
      "longitude": 21.0642,
      "settlements": [
        { "name": "Želino", "latitude": 41.9803, "longitude": 21.0642 }
      ]
    },
    {
      "name": "Zrnovci",
      "latitude": 41.8542,
      "longitude": 22.4444,
      "settlements": [
        { "name": "Zrnovci", "latitude": 41.8542, "longitude": 22.4444 }
      ]
    },
    {
      "name": "Vrapčište",
      "latitude": 41.8344,
      "longitude": 20.8856,
      "settlements": [
        { "name": "Vrapčište", "latitude": 41.8344, "longitude": 20.8856 }
      ]
    },
    {
      "name": "Pehčevo",
      "latitude": 41.7622,
      "longitude": 22.8892,
      "settlements": [
        { "name": "Pehčevo", "latitude": 41.7622, "longitude": 22.8892 }
      ]
    },
    {
      "name": "Čaška",
      "latitude": 41.6475,
      "longitude": 21.6622,
      "settlements": [
        { "name": "Čaška", "latitude": 41.6475, "longitude": 21.6622 }
      ]
    },
    {
      "name": "Novaci",
      "latitude": 41.0422,
      "longitude": 21.4567,
      "settlements": [
        { "name": "Novaci", "latitude": 41.0422, "longitude": 21.4567 }
      ]
    }
  ],

  "Albania": [
    {
      "name": "Tirana",
      "latitude": 41.3275,
      "longitude": 19.8189,
      "settlements": [
        { "name": "Tirana", "latitude": 41.3275, "longitude": 19.8189 },
        { "name": "Kashar", "latitude": 41.3500, "longitude": 19.7400 },
        { "name": "Vaqarr", "latitude": 41.2700, "longitude": 19.7500 },
        { "name": "Dajt", "latitude": 41.3667, "longitude": 19.9167 },
        { "name": "Farkë", "latitude": 41.3000, "longitude": 19.8000 },
        { "name": "Kamëz", "latitude": 41.3833, "longitude": 19.7667 },
        { "name": "Paskuqan", "latitude": 41.3333, "longitude": 19.8000 }
      ]
    },
    {
      "name": "Durrës",
      "latitude": 41.3167,
      "longitude": 19.4500,
      "settlements": [
        { "name": "Durrës", "latitude": 41.3167, "longitude": 19.4500 },
        { "name": "Golem", "latitude": 41.2400, "longitude": 19.5300 },
        { "name": "Shijak", "latitude": 41.3400, "longitude": 19.5600 },
        { "name": "Sukth", "latitude": 41.3667, "longitude": 19.5333 },
        { "name": "Manëz", "latitude": 41.4333, "longitude": 19.5833 }
      ]
    },
    {
      "name": "Vlorë",
      "latitude": 40.4667,
      "longitude": 19.4897,
      "settlements": [
        { "name": "Vlorë", "latitude": 40.4667, "longitude": 19.4897 },
        { "name": "Orikum", "latitude": 40.3200, "longitude": 19.4700 },
        { "name": "Radhimë", "latitude": 40.3800, "longitude": 19.4800 },
        { "name": "Novoselë", "latitude": 40.5333, "longitude": 19.4333 }
      ]
    },
    {
      "name": "Shkodër",
      "latitude": 42.0685,
      "longitude": 19.5189,
      "settlements": [
        { "name": "Shkodër", "latitude": 42.0685, "longitude": 19.5189 },
        { "name": "Vau i Dejës", "latitude": 42.0000, "longitude": 19.6333 },
        { "name": "Ana e Malit", "latitude": 42.1000, "longitude": 19.5500 }
      ]
    },
    {
      "name": "Elbasan",
      "latitude": 41.1125,
      "longitude": 20.0822,
      "settlements": [
        { "name": "Elbasan", "latitude": 41.1125, "longitude": 20.0822 },
        { "name": "Shirgjan", "latitude": 41.0667, "longitude": 20.0333 },
        { "name": "Labinot-Fushë", "latitude": 41.1500, "longitude": 20.1333 }
      ]
    },
    {
      "name": "Korçë",
      "latitude": 40.6167,
      "longitude": 20.7667,
      "settlements": [
        { "name": "Korçë", "latitude": 40.6167, "longitude": 20.7667 },
        { "name": "Mborje", "latitude": 40.6000, "longitude": 20.8000 },
        { "name": "Voskop", "latitude": 40.6333, "longitude": 20.6667 }
      ]
    },
    {
      "name": "Fier",
      "latitude": 40.7250,
      "longitude": 19.5572,
      "settlements": [
        { "name": "Fier", "latitude": 40.7250, "longitude": 19.5572 },
        { "name": "Roskovec", "latitude": 40.7333, "longitude": 19.7000 },
        { "name": "Levan", "latitude": 40.6500, "longitude": 19.5000 }
      ]
    },
    {
      "name": "Berat",
      "latitude": 40.7053,
      "longitude": 19.9522,
      "settlements": [
        { "name": "Berat", "latitude": 40.7053, "longitude": 19.9522 },
        { "name": "Ura Vajgurore", "latitude": 40.7667, "longitude": 19.8833 }
      ]
    },
    {
      "name": "Lushnjë",
      "latitude": 40.9419,
      "longitude": 19.7050,
      "settlements": [
        { "name": "Lushnjë", "latitude": 40.9419, "longitude": 19.7050 }
      ]
    },
    {
      "name": "Kavajë",
      "latitude": 41.1856,
      "longitude": 19.5569,
      "settlements": [
        { "name": "Kavajë", "latitude": 41.1856, "longitude": 19.5569 }
      ]
    },
    {
      "name": "Gjirokastër",
      "latitude": 40.0758,
      "longitude": 20.1389,
      "settlements": [
        { "name": "Gjirokastër", "latitude": 40.0758, "longitude": 20.1389 },
        { "name": "Lazarat", "latitude": 40.0333, "longitude": 20.1500 }
      ]
    },
    {
      "name": "Sarandë",
      "latitude": 39.8750,
      "longitude": 20.0056,
      "settlements": [
        { "name": "Sarandë", "latitude": 39.8750, "longitude": 20.0056 },
        { "name": "Ksamil", "latitude": 39.7700, "longitude": 20.0000 },
        { "name": "Çukë", "latitude": 39.8300, "longitude": 20.0300 },
        { "name": "Butrint", "latitude": 39.7467, "longitude": 20.0200 }
      ]
    },
    {
      "name": "Pogradec",
      "latitude": 40.9000,
      "longitude": 20.6500,
      "settlements": [
        { "name": "Pogradec", "latitude": 40.9000, "longitude": 20.6500 },
        { "name": "Hudenisht", "latitude": 40.9167, "longitude": 20.6833 }
      ]
    },
    {
      "name": "Kukës",
      "latitude": 42.0833,
      "longitude": 20.4333,
      "settlements": [
        { "name": "Kukës", "latitude": 42.0833, "longitude": 20.4333 }
      ]
    },
    {
      "name": "Lezhë",
      "latitude": 41.7833,
      "longitude": 19.6500,
      "settlements": [
        { "name": "Lezhë", "latitude": 41.7833, "longitude": 19.6500 },
        { "name": "Shëngjin", "latitude": 41.8167, "longitude": 19.6000 }
      ]
    },
    {
      "name": "Përmet",
      "latitude": 40.2333,
      "longitude": 20.3500,
      "settlements": [
        { "name": "Përmet", "latitude": 40.2333, "longitude": 20.3500 }
      ]
    },
    {
      "name": "Burrel",
      "latitude": 41.6167,
      "longitude": 20.0167,
      "settlements": [
        { "name": "Burrel", "latitude": 41.6167, "longitude": 20.0167 }
      ]
    },
    {
      "name": "Librazhd",
      "latitude": 41.2000,
      "longitude": 20.3167,
      "settlements": [
        { "name": "Librazhd", "latitude": 41.2000, "longitude": 20.3167 }
      ]
    },
    {
      "name": "Tepelenë",
      "latitude": 40.3000,
      "longitude": 20.0167,
      "settlements": [
        { "name": "Tepelenë", "latitude": 40.3000, "longitude": 20.0167 }
      ]
    },
    {
      "name": "Gramsh",
      "latitude": 40.8667,
      "longitude": 20.2000,
      "settlements": [
        { "name": "Gramsh", "latitude": 40.8667, "longitude": 20.2000 }
      ]
    },
    {
      "name": "Poliçan",
      "latitude": 40.6167,
      "longitude": 20.1000,
      "settlements": [
        { "name": "Poliçan", "latitude": 40.6167, "longitude": 20.1000 }
      ]
    },
    {
      "name": "Bulqizë",
      "latitude": 41.4917,
      "longitude": 20.2219,
      "settlements": [
        { "name": "Bulqizë", "latitude": 41.4917, "longitude": 20.2219 }
      ]
    },
    {
      "name": "Devoll",
      "latitude": 40.5500,
      "longitude": 20.9667,
      "settlements": [
        { "name": "Bilisht", "latitude": 40.5500, "longitude": 20.9667 }
      ]
    },
    {
      "name": "Cërrik",
      "latitude": 41.0333,
      "longitude": 19.9833,
      "settlements": [
        { "name": "Cërrik", "latitude": 41.0333, "longitude": 19.9833 }
      ]
    },
    {
      "name": "Klos",
      "latitude": 41.5000,
      "longitude": 20.0833,
      "settlements": [
        { "name": "Klos", "latitude": 41.5000, "longitude": 20.0833 }
      ]
    },
    {
      "name": "Krujë",
      "latitude": 41.5167,
      "longitude": 19.8000,
      "settlements": [
        { "name": "Krujë", "latitude": 41.5167, "longitude": 19.8000 },
        { "name": "Fushë-Krujë", "latitude": 41.4833, "longitude": 19.7167 }
      ]
    },
    {
      "name": "Kurbin",
      "latitude": 41.6333,
      "longitude": 19.7167,
      "settlements": [
        { "name": "Laç", "latitude": 41.6333, "longitude": 19.7167 }
      ]
    },
    {
      "name": "Kuçovë",
      "latitude": 40.8000,
      "longitude": 19.9167,
      "settlements": [
        { "name": "Kuçovë", "latitude": 40.8000, "longitude": 19.9167 }
      ]
    },
    {
      "name": "Maliq",
      "latitude": 40.7167,
      "longitude": 20.7000,
      "settlements": [
        { "name": "Maliq", "latitude": 40.7167, "longitude": 20.7000 }
      ]
    },
    {
      "name": "Mallakastër",
      "latitude": 40.5500,
      "longitude": 19.7333,
      "settlements": [
        { "name": "Ballsh", "latitude": 40.6000, "longitude": 19.7333 }
      ]
    },
    {
      "name": "Mat",
      "latitude": 41.6333,
      "longitude": 20.0167,
      "settlements": [
        { "name": "Burrel", "latitude": 41.6333, "longitude": 20.0167 }
      ]
    },
    {
      "name": "Mirditë",
      "latitude": 41.8000,
      "longitude": 19.9833,
      "settlements": [
        { "name": "Rrëshen", "latitude": 41.8000, "longitude": 19.9833 }
      ]
    },
    {
      "name": "Peqin",
      "latitude": 41.0461,
      "longitude": 19.7511,
      "settlements": [
        { "name": "Peqin", "latitude": 41.0461, "longitude": 19.7511 }
      ]
    },
    {
      "name": "Pukë",
      "latitude": 42.0500,
      "longitude": 19.9000,
      "settlements": [
        { "name": "Pukë", "latitude": 42.0500, "longitude": 19.9000 }
      ]
    },
    {
      "name": "Sarandë District",
      "latitude": 39.8500,
      "longitude": 20.1000,
      "settlements": [
        { "name": "Konispol", "latitude": 39.6500, "longitude": 20.1833 }
      ]
    },
    {
      "name": "Skrapar",
      "latitude": 40.5500,
      "longitude": 20.2667,
      "settlements": [
        { "name": "Çorovodë", "latitude": 40.5000, "longitude": 20.2333 }
      ]
    },
    {
      "name": "Tropojë",
      "latitude": 42.4000,
      "longitude": 20.1667,
      "settlements": [
        { "name": "Bajram Curri", "latitude": 42.3500, "longitude": 20.0833 }
      ]
    },
    {
      "name": "Vlorë District",
      "latitude": 40.3333,
      "longitude": 19.4833,
      "settlements": [
        { "name": "Himarë", "latitude": 40.1167, "longitude": 19.7333 },
        { "name": "Selenicë", "latitude": 40.5333, "longitude": 19.6333 }
      ]
    },
    {
      "name": "Divjakë",
      "latitude": 40.9967,
      "longitude": 19.5294,
      "settlements": [
        { "name": "Divjakë", "latitude": 40.9967, "longitude": 19.5294 }
      ]
    },
    {
      "name": "Rrogozhinë",
      "latitude": 41.0764,
      "longitude": 19.6653,
      "settlements": [
        { "name": "Rrogozhinë", "latitude": 41.0764, "longitude": 19.6653 }
      ]
    },
    {
      "name": "Vorë",
      "latitude": 41.4000,
      "longitude": 19.6500,
      "settlements": [
        { "name": "Vorë", "latitude": 41.4000, "longitude": 19.6500 }
      ]
    },
    {
      "name": "Këlcyrë",
      "latitude": 40.3167,
      "longitude": 20.1833,
      "settlements": [
        { "name": "Këlcyrë", "latitude": 40.3167, "longitude": 20.1833 }
      ]
    },
    {
      "name": "Memaliaj",
      "latitude": 40.3500,
      "longitude": 19.9833,
      "settlements": [
        { "name": "Memaliaj", "latitude": 40.3500, "longitude": 19.9833 }
      ]
    },
    {
      "name": "Ulëz",
      "latitude": 41.6833,
      "longitude": 19.8833,
      "settlements": [
        { "name": "Ulëz", "latitude": 41.6833, "longitude": 19.8833 }
      ]
    },
    {
      "name": "Belsh",
      "latitude": 41.0000,
      "longitude": 19.9000,
      "settlements": [
        { "name": "Belsh", "latitude": 41.0000, "longitude": 19.9000 }
      ]
    },
    {
      "name": "Finiq",
      "latitude": 39.9000,
      "longitude": 20.1667,
      "settlements": [
        { "name": "Finiq", "latitude": 39.9000, "longitude": 20.1667 }
      ]
    },
    {
      "name": "Himarë",
      "latitude": 40.1167,
      "longitude": 19.7333,
      "settlements": [
        { "name": "Himarë", "latitude": 40.1167, "longitude": 19.7333 },
        { "name": "Palasë", "latitude": 40.0833, "longitude": 19.7833 }
      ]
    },
    {
      "name": "Patos",
      "latitude": 40.6833,
      "longitude": 19.6167,
      "settlements": [
        { "name": "Patos", "latitude": 40.6833, "longitude": 19.6167 }
      ]
    },
    {
      "name": "Përmet District",
      "latitude": 40.2000,
      "longitude": 20.4000,
      "settlements": [
        { "name": "Këlcyrë", "latitude": 40.3167, "longitude": 20.1833 }
      ]
    },
    {
      "name": "Selenicë",
      "latitude": 40.5333,
      "longitude": 19.6333,
      "settlements": [
        { "name": "Selenicë", "latitude": 40.5333, "longitude": 19.6333 }
      ]
    }
  ],
  "Kosovo": [
    {
      "name": "Pristina",
      "latitude": 42.6629,
      "longitude": 21.1655,
      "settlements": [
        { "name": "Pristina", "latitude": 42.6629, "longitude": 21.1655 },
        { "name": "Gračanica", "latitude": 42.6000, "longitude": 21.1900 },
        { "name": "Fushë Kosovë", "latitude": 42.6300, "longitude": 21.1000 },
        { "name": "Kastriot", "latitude": 42.6500, "longitude": 21.2000 },
        { "name": "Llapashtica e Epërme", "latitude": 42.7000, "longitude": 21.2500 }
      ]
    },
    {
      "name": "Prizren",
      "latitude": 42.2150,
      "longitude": 20.7400,
      "settlements": [
        { "name": "Prizren", "latitude": 42.2150, "longitude": 20.7400 },
        { "name": "Žur", "latitude": 42.1700, "longitude": 20.7000 },
        { "name": "Suharekë", "latitude": 42.3800, "longitude": 20.8300 },
        { "name": "Landovica", "latitude": 42.3500, "longitude": 21.0000 },
        { "name": "Gornje Ljubinje", "latitude": 42.3000, "longitude": 20.8500 }
      ]
    },
    {
      "name": "Peja",
      "latitude": 42.6609,
      "longitude": 20.2884,
      "settlements": [
        { "name": "Peja", "latitude": 42.6609, "longitude": 20.2884 },
        { "name": "Istog", "latitude": 42.7800, "longitude": 20.4800 },
        { "name": "Klinë", "latitude": 42.6200, "longitude": 20.5700 },
        { "name": "Deçan", "latitude": 42.5400, "longitude": 20.2900 }
      ]
    },
    {
      "name": "Gjakova",
      "latitude": 42.3800,
      "longitude": 20.4300,
      "settlements": [
        { "name": "Gjakova", "latitude": 42.3800, "longitude": 20.4300 },
        { "name": "Orahovac", "latitude": 42.4000, "longitude": 20.6500 },
        { "name": "Mališevo", "latitude": 42.4800, "longitude": 20.7500 }
      ]
    },
    {
      "name": "Mitrovica",
      "latitude": 42.8833,
      "longitude": 20.8667,
      "settlements": [
        { "name": "Mitrovica", "latitude": 42.8833, "longitude": 20.8667 },
        { "name": "Vushtrri", "latitude": 42.8200, "longitude": 20.9700 },
        { "name": "Skenderaj", "latitude": 42.7500, "longitude": 20.8000 },
        { "name": "Zvečan", "latitude": 42.9100, "longitude": 20.8400 }
      ]
    },
    {
      "name": "Gjilan",
      "latitude": 42.4600,
      "longitude": 21.4700,
      "settlements": [
        { "name": "Gjilan", "latitude": 42.4600, "longitude": 21.4700 },
        { "name": "Kamenicë", "latitude": 42.5800, "longitude": 21.5800 },
        { "name": "Ranillug", "latitude": 42.4900, "longitude": 21.5600 },
        { "name": "Partesh", "latitude": 42.4000, "longitude": 21.4300 }
      ]
    },
    {
      "name": "Ferizaj",
      "latitude": 42.3700,
      "longitude": 21.1600,
      "settlements": [
        { "name": "Ferizaj", "latitude": 42.3700, "longitude": 21.1600 },
        { "name": "Kaçanik", "latitude": 42.2300, "longitude": 21.2600 },
        { "name": "Štimlje", "latitude": 42.4400, "longitude": 21.0300 },
        { "name": "Shtërpcë", "latitude": 42.2400, "longitude": 21.0300 }
      ]
    },
    {
      "name": "Podujevo",
      "latitude": 42.9100,
      "longitude": 21.1900,
      "settlements": [
        { "name": "Podujevo", "latitude": 42.9100, "longitude": 21.1900 },
        { "name": "Obiliq", "latitude": 42.6900, "longitude": 21.0800 },
        { "name": "Glogovac", "latitude": 42.6300, "longitude": 20.9000 }
      ]
    },
    {
      "name": "Vushtrri",
      "latitude": 42.8200,
      "longitude": 20.9700,
      "settlements": [
        { "name": "Vushtrri", "latitude": 42.8200, "longitude": 20.9700 },
        { "name": "Mitrovica e Epërme", "latitude": 42.9000, "longitude": 20.8500 }
      ]
    },
    {
      "name": "Suhareka",
      "latitude": 42.3800,
      "longitude": 20.8300,
      "settlements": [
        { "name": "Suhareka", "latitude": 42.3800, "longitude": 20.8300 },
        { "name": "Bllacë", "latitude": 42.3500, "longitude": 20.8700 }
      ]
    },
    {
      "name": "Rahovec",
      "latitude": 42.4000,
      "longitude": 20.6500,
      "settlements": [
        { "name": "Rahovec", "latitude": 42.4000, "longitude": 20.6500 },
        { "name": "Hoçë e Madhe", "latitude": 42.3500, "longitude": 20.6000 }
      ]
    },
    {
      "name": "Malisheva",
      "latitude": 42.4800,
      "longitude": 20.7500,
      "settlements": [
        { "name": "Malisheva", "latitude": 42.4800, "longitude": 20.7500 },
        { "name": "Klina", "latitude": 42.6200, "longitude": 20.5700 }
      ]
    },
    {
      "name": "Skenderaj",
      "latitude": 42.7500,
      "longitude": 20.8000,
      "settlements": [
        { "name": "Skenderaj", "latitude": 42.7500, "longitude": 20.8000 },
        { "name": "Runik", "latitude": 42.7800, "longitude": 20.7500 }
      ]
    },
    {
      "name": "Vitia",
      "latitude": 42.3200,
      "longitude": 21.3600,
      "settlements": [
        { "name": "Vitia", "latitude": 42.3200, "longitude": 21.3600 },
        { "name": "Gjurgjellica", "latitude": 42.2800, "longitude": 21.4000 }
      ]
    },
    {
      "name": "Deçan",
      "latitude": 42.5400,
      "longitude": 20.2900,
      "settlements": [
        { "name": "Deçan", "latitude": 42.5400, "longitude": 20.2900 },
        { "name": "Junik", "latitude": 42.4700, "longitude": 20.2800 }
      ]
    },
    {
      "name": "Istog",
      "latitude": 42.7800,
      "longitude": 20.4800,
      "settlements": [
        { "name": "Istog", "latitude": 42.7800, "longitude": 20.4800 },
        { "name": "Kçiq i Madh", "latitude": 42.8000, "longitude": 20.4300 }
      ]
    },
    {
      "name": "Klinë",
      "latitude": 42.6200,
      "longitude": 20.5700,
      "settlements": [
        { "name": "Klinë", "latitude": 42.6200, "longitude": 20.5700 },
        { "name": "Drsnik", "latitude": 42.5800, "longitude": 20.6200 }
      ]
    },
    {
      "name": "Kamenica",
      "latitude": 42.5800,
      "longitude": 21.5800,
      "settlements": [
        { "name": "Kamenica", "latitude": 42.5800, "longitude": 21.5800 },
        { "name": "Ranilug", "latitude": 42.4900, "longitude": 21.5600 }
      ]
    },
    {
      "name": "Leposaviq",
      "latitude": 43.1000,
      "longitude": 20.8000,
      "settlements": [
        { "name": "Leposaviq", "latitude": 43.1000, "longitude": 20.8000 },
        { "name": "Leshak", "latitude": 43.1500, "longitude": 20.7800 }
      ]
    },
    {
      "name": "Zvečan",
      "latitude": 42.9100,
      "longitude": 20.8400,
      "settlements": [
        { "name": "Zvečan", "latitude": 42.9100, "longitude": 20.8400 },
        { "name": "Boletin", "latitude": 42.9300, "longitude": 20.8000 }
      ]
    },
    {
      "name": "Zubin Potok",
      "latitude": 42.9100,
      "longitude": 20.6900,
      "settlements": [
        { "name": "Zubin Potok", "latitude": 42.9100, "longitude": 20.6900 },
        { "name": "Jagnjenica", "latitude": 42.9500, "longitude": 20.6700 }
      ]
    },
    {
      "name": "Dragash",
      "latitude": 42.0600,
      "longitude": 20.6500,
      "settlements": [
        { "name": "Dragash", "latitude": 42.0600, "longitude": 20.6500 },
        { "name": "Restelicë", "latitude": 42.0200, "longitude": 20.6000 }
      ]
    },
    {
      "name": "Novobërdë",
      "latitude": 42.6167,
      "longitude": 21.4167,
      "settlements": [
        { "name": "Novobërdë", "latitude": 42.6167, "longitude": 21.4167 },
        { "name": "Prelez i Jerlive", "latitude": 42.6500, "longitude": 21.4500 }
      ]
    },
    {
      "name": "Obiliq",
      "latitude": 42.6900,
      "longitude": 21.0800,
      "settlements": [
        { "name": "Obiliq", "latitude": 42.6900, "longitude": 21.0800 },
        { "name": "Plemetin", "latitude": 42.6700, "longitude": 21.1200 }
      ]
    },
    {
      "name": "Partesh",
      "latitude": 42.4000,
      "longitude": 21.4300,
      "settlements": [
        { "name": "Partesh", "latitude": 42.4000, "longitude": 21.4300 },
        { "name": "Donja Brnjica", "latitude": 42.4200, "longitude": 21.4500 }
      ]
    },
    {
      "name": "Hani i Elezit",
      "latitude": 42.1500,
      "longitude": 21.3000,
      "settlements": [
        { "name": "Hani i Elezit", "latitude": 42.1500, "longitude": 21.3000 },
        { "name": "Elezaj", "latitude": 42.1300, "longitude": 21.3200 }
      ]
    },
    {
      "name": "Kaçanik",
      "latitude": 42.2300,
      "longitude": 21.2600,
      "settlements": [
        { "name": "Kaçanik", "latitude": 42.2300, "longitude": 21.2600 },
        { "name": "Begracë", "latitude": 42.2000, "longitude": 21.2800 }
      ]
    },
    {
      "name": "Shtime",
      "latitude": 42.4400,
      "longitude": 21.0300,
      "settlements": [
        { "name": "Shtime", "latitude": 42.4400, "longitude": 21.0300 },
        { "name": "Bajgora", "latitude": 42.4600, "longitude": 21.0500 }
      ]
    },
    {
      "name": "Lipjan",
      "latitude": 42.5200,
      "longitude": 21.1200,
      "settlements": [
        { "name": "Lipjan", "latitude": 42.5200, "longitude": 21.1200 },
        { "name": "Gračanka", "latitude": 42.5400, "longitude": 21.1400 }
      ]
    },
    {
      "name": "Fushë Kosovë",
      "latitude": 42.6300,
      "longitude": 21.1000,
      "settlements": [
        { "name": "Fushë Kosovë", "latitude": 42.6300, "longitude": 21.1000 },
        { "name": "Mirushe", "latitude": 42.6500, "longitude": 21.0800 }
      ]
    },
    {
      "name": "Gračanica",
      "latitude": 42.6000,
      "longitude": 21.1900,
      "settlements": [
        { "name": "Gračanica", "latitude": 42.6000, "longitude": 21.1900 },
        { "name": "Laplje Selo", "latitude": 42.5800, "longitude": 21.1700 }
      ]
    },
    {
      "name": "Mamuša",
      "latitude": 42.3300,
      "longitude": 20.7300,
      "settlements": [
        { "name": "Mamuša", "latitude": 42.3300, "longitude": 20.7300 }
      ]
    },
    {
      "name": "Junik",
      "latitude": 42.4700,
      "longitude": 20.2800,
      "settlements": [
        { "name": "Junik", "latitude": 42.4700, "longitude": 20.2800 },
        { "name": "Gexhë", "latitude": 42.4500, "longitude": 20.3000 }
      ]
    },
    {
      "name": "Zhaq",
      "latitude": 42.5500,
      "longitude": 20.7500,
      "settlements": [
        { "name": "Zhaq", "latitude": 42.5500, "longitude": 20.7500 }
      ]
    }
  ],

  "Montenegro": [
    {
      "name": "Podgorica",
      "latitude": 42.4304,
      "longitude": 19.2594,
      "settlements": [
        { "name": "Podgorica", "latitude": 42.4304, "longitude": 19.2594 },
        { "name": "Tuzi", "latitude": 42.3650, "longitude": 19.3314 },
        { "name": "Golubovci", "latitude": 42.3350, "longitude": 19.2319 },
        { "name": "Dinoša", "latitude": 42.3667, "longitude": 19.3667 },
        { "name": "Mahala", "latitude": 42.3833, "longitude": 19.2500 }
      ]
    },
    {
      "name": "Nikšić",
      "latitude": 42.7731,
      "longitude": 18.9444,
      "settlements": [
        { "name": "Nikšić", "latitude": 42.7731, "longitude": 18.9444 },
        { "name": "Ostrog", "latitude": 42.6833, "longitude": 19.0333 },
        { "name": "Slavogostić", "latitude": 42.8000, "longitude": 18.9000 }
      ]
    },
    {
      "name": "Herceg Novi",
      "latitude": 42.4531,
      "longitude": 18.5311,
      "settlements": [
        { "name": "Herceg Novi", "latitude": 42.4531, "longitude": 18.5311 },
        { "name": "Igalo", "latitude": 42.4589, "longitude": 18.5111 },
        { "name": "Meljine", "latitude": 42.4500, "longitude": 18.5600 },
        { "name": "Zelenika", "latitude": 42.4500, "longitude": 18.5833 },
        { "name": "Kumbor", "latitude": 42.4333, "longitude": 18.5667 }
      ]
    },
    {
      "name": "Budva",
      "latitude": 42.2781,
      "longitude": 18.8386,
      "settlements": [
        { "name": "Budva", "latitude": 42.2781, "longitude": 18.8386 },
        { "name": "Bečići", "latitude": 42.2833, "longitude": 18.8667 },
        { "name": "Sveti Stefan", "latitude": 42.2561, "longitude": 18.8914 },
        { "name": "Petrovac", "latitude": 42.2056, "longitude": 18.9428 },
        { "name": "Rafailovići", "latitude": 42.2833, "longitude": 18.8500 }
      ]
    },
    {
      "name": "Bar",
      "latitude": 42.0931,
      "longitude": 19.1000,
      "settlements": [
        { "name": "Bar", "latitude": 42.0931, "longitude": 19.1000 },
        { "name": "Stari Bar", "latitude": 42.0900, "longitude": 19.1361 },
        { "name": "Sutomore", "latitude": 42.1428, "longitude": 19.0467 },
        { "name": "Šušanj", "latitude": 42.1083, "longitude": 19.0889 }
      ]
    },
    {
      "name": "Cetinje",
      "latitude": 42.3889,
      "longitude": 18.9222,
      "settlements": [
        { "name": "Cetinje", "latitude": 42.3889, "longitude": 18.9222 },
        { "name": "Rijeka Crnojevića", "latitude": 42.3556, "longitude": 19.0228 },
        { "name": "Lipovo", "latitude": 42.4167, "longitude": 18.9500 }
      ]
    },
    {
      "name": "Kotor",
      "latitude": 42.4247,
      "longitude": 18.7711,
      "settlements": [
        { "name": "Kotor", "latitude": 42.4247, "longitude": 18.7711 },
        { "name": "Perast", "latitude": 42.4867, "longitude": 18.6964 },
        { "name": "Dobrota", "latitude": 42.4542, "longitude": 18.7681 },
        { "name": "Risan", "latitude": 42.5150, "longitude": 18.6958 },
        { "name": "Prčanj", "latitude": 42.4575, "longitude": 18.7422 }
      ]
    },
    {
      "name": "Tivat",
      "latitude": 42.4344,
      "longitude": 18.6961,
      "settlements": [
        { "name": "Tivat", "latitude": 42.4344, "longitude": 18.6961 },
        { "name": "Krtoli", "latitude": 42.4167, "longitude": 18.7167 },
        { "name": "Radovići", "latitude": 42.4500, "longitude": 18.6833 }
      ]
    },
    {
      "name": "Ulcinj",
      "latitude": 41.9283,
      "longitude": 19.2056,
      "settlements": [
        { "name": "Ulcinj", "latitude": 41.9283, "longitude": 19.2056 },
        { "name": "Ada Bojana", "latitude": 41.8667, "longitude": 19.3667 },
        { "name": "Velika Plaža", "latitude": 41.9000, "longitude": 19.3000 },
        { "name": "Šas", "latitude": 41.9500, "longitude": 19.2333 }
      ]
    },
    {
      "name": "Rožaje",
      "latitude": 42.8436,
      "longitude": 20.1678,
      "settlements": [
        { "name": "Rožaje", "latitude": 42.8436, "longitude": 20.1678 },
        { "name": "Bajovo", "latitude": 42.8000, "longitude": 20.2000 }
      ]
    },
    {
      "name": "Bijelo Polje",
      "latitude": 43.0319,
      "longitude": 19.7478,
      "settlements": [
        { "name": "Bijelo Polje", "latitude": 43.0319, "longitude": 19.7478 },
        { "name": "Gornja Rženica", "latitude": 43.0500, "longitude": 19.7667 }
      ]
    },
    {
      "name": "Pljevlja",
      "latitude": 43.3567,
      "longitude": 19.3583,
      "settlements": [
        { "name": "Pljevlja", "latitude": 43.3567, "longitude": 19.3583 },
        { "name": "Jabuka", "latitude": 43.3333, "longitude": 19.4000 }
      ]
    },
    {
      "name": "Berane",
      "latitude": 42.8450,
      "longitude": 19.8731,
      "settlements": [
        { "name": "Berane", "latitude": 42.8450, "longitude": 19.8731 },
        { "name": "Mojkovac", "latitude": 42.9603, "longitude": 19.5831 }
      ]
    },
    {
      "name": "Danilovgrad",
      "latitude": 42.5539,
      "longitude": 19.1058,
      "settlements": [
        { "name": "Danilovgrad", "latitude": 42.5539, "longitude": 19.1058 },
        { "name": "Spuž", "latitude": 42.5333, "longitude": 19.2000 }
      ]
    },
    {
      "name": "Mojkovac",
      "latitude": 42.9603,
      "longitude": 19.5831,
      "settlements": [
        { "name": "Mojkovac", "latitude": 42.9603, "longitude": 19.5831 },
        { "name": "Brusovo", "latitude": 42.9833, "longitude": 19.6000 }
      ]
    },
    {
      "name": "Plav",
      "latitude": 42.5969,
      "longitude": 19.9458,
      "settlements": [
        { "name": "Plav", "latitude": 42.5969, "longitude": 19.9458 },
        { "name": "Gusinje", "latitude": 42.5619, "longitude": 19.8339 }
      ]
    },
    {
      "name": "Žabljak",
      "latitude": 43.1544,
      "longitude": 19.1233,
      "settlements": [
        { "name": "Žabljak", "latitude": 43.1544, "longitude": 19.1233 },
        { "name": "Durmitor", "latitude": 43.1333, "longitude": 19.0500 }
      ]
    },
    {
      "name": "Kolašin",
      "latitude": 42.8239,
      "longitude": 19.5228,
      "settlements": [
        { "name": "Kolašin", "latitude": 42.8239, "longitude": 19.5228 },
        { "name": "Mrtvica", "latitude": 42.8000, "longitude": 19.5500 }
      ]
    },
    {
      "name": "Andrijevica",
      "latitude": 42.7339,
      "longitude": 19.7919,
      "settlements": [
        { "name": "Andrijevica", "latitude": 42.7339, "longitude": 19.7919 },
        { "name": "Božovići", "latitude": 42.7500, "longitude": 19.8000 }
      ]
    },
    {
      "name": "Plužine",
      "latitude": 43.1528,
      "longitude": 18.8394,
      "settlements": [
        { "name": "Plužine", "latitude": 43.1528, "longitude": 18.8394 },
        { "name": "Gornja Brezna", "latitude": 43.1667, "longitude": 18.8500 }
      ]
    },
    {
      "name": "Šavnik",
      "latitude": 42.9564,
      "longitude": 19.0958,
      "settlements": [
        { "name": "Šavnik", "latitude": 42.9564, "longitude": 19.0958 },
        { "name": "Pridvorica", "latitude": 42.9667, "longitude": 19.1000 }
      ]
    },
    {
      "name": "Gusinje",
      "latitude": 42.5619,
      "longitude": 19.8339,
      "settlements": [
        { "name": "Gusinje", "latitude": 42.5619, "longitude": 19.8339 },
        { "name": "Vusanje", "latitude": 42.5333, "longitude": 19.8500 }
      ]
    },
    {
      "name": "Petnjica",
      "latitude": 42.9089,
      "longitude": 19.9644,
      "settlements": [
        { "name": "Petnjica", "latitude": 42.9089, "longitude": 19.9644 },
        { "name": "Brod", "latitude": 42.9000, "longitude": 19.9833 }
      ]
    },
    {
      "name": "Tuzi",
      "latitude": 42.3650,
      "longitude": 19.3314,
      "settlements": [
        { "name": "Tuzi", "latitude": 42.3650, "longitude": 19.3314 },
        { "name": "Arza", "latitude": 42.3500, "longitude": 19.3500 }
      ]
    },
    {
      "name": "Risan",
      "latitude": 42.5150,
      "longitude": 18.6958,
      "settlements": [
        { "name": "Risan", "latitude": 42.5150, "longitude": 18.6958 },
        { "name": "Perast", "latitude": 42.4867, "longitude": 18.6964 }
      ]
    },
    {
      "name": "Dobrota",
      "latitude": 42.4542,
      "longitude": 18.7681,
      "settlements": [
        { "name": "Dobrota", "latitude": 42.4542, "longitude": 18.7681 },
        { "name": "Prčanj", "latitude": 42.4575, "longitude": 18.7422 }
      ]
    },
    {
      "name": "Igalo",
      "latitude": 42.4589,
      "longitude": 18.5111,
      "settlements": [
        { "name": "Igalo", "latitude": 42.4589, "longitude": 18.5111 },
        { "name": "Herceg Novi", "latitude": 42.4531, "longitude": 18.5311 }
      ]
    },
    {
      "name": "Sutomore",
      "latitude": 42.1428,
      "longitude": 19.0467,
      "settlements": [
        { "name": "Sutomore", "latitude": 42.1428, "longitude": 19.0467 },
        { "name": "Bar", "latitude": 42.0931, "longitude": 19.1000 }
      ]
    },
    {
      "name": "Bečići",
      "latitude": 42.2833,
      "longitude": 18.8667,
      "settlements": [
        { "name": "Bečići", "latitude": 42.2833, "longitude": 18.8667 },
        { "name": "Budva", "latitude": 42.2781, "longitude": 18.8386 }
      ]
    },
    {
      "name": "Petrovac",
      "latitude": 42.2056,
      "longitude": 18.9428,
      "settlements": [
        { "name": "Petrovac", "latitude": 42.2056, "longitude": 18.9428 },
        { "name": "Buljarica", "latitude": 42.1833, "longitude": 18.9667 }
      ]
    },
    {
      "name": "Sveti Stefan",
      "latitude": 42.2561,
      "longitude": 18.8914,
      "settlements": [
        { "name": "Sveti Stefan", "latitude": 42.2561, "longitude": 18.8914 },
        { "name": "Pržno", "latitude": 42.2500, "longitude": 18.8833 }
      ]
    },
    {
      "name": "Ada Bojana",
      "latitude": 41.8667,
      "longitude": 19.3667,
      "settlements": [
        { "name": "Ada Bojana", "latitude": 41.8667, "longitude": 19.3667 },
        { "name": "Ulcinj", "latitude": 41.9283, "longitude": 19.2056 }
      ]
    },
    {
      "name": "Biogradska Gora",
      "latitude": 42.9000,
      "longitude": 19.6000,
      "settlements": [
        { "name": "Biogradska Gora", "latitude": 42.9000, "longitude": 19.6000 },
        { "name": "Kolašin", "latitude": 42.8239, "longitude": 19.5228 }
      ]
    },
    {
      "name": "Durmitor",
      "latitude": 43.1333,
      "longitude": 19.0500,
      "settlements": [
        { "name": "Durmitor", "latitude": 43.1333, "longitude": 19.0500 },
        { "name": "Žabljak", "latitude": 43.1544, "longitude": 19.1233 }
      ]
    },
    {
      "name": "Lovćen",
      "latitude": 42.4000,
      "longitude": 18.8333,
      "settlements": [
        { "name": "Lovćen", "latitude": 42.4000, "longitude": 18.8333 },
        { "name": "Cetinje", "latitude": 42.3889, "longitude": 18.9222 }
      ]
    },
    {
      "name": "Ostrog",
      "latitude": 42.6833,
      "longitude": 19.0333,
      "settlements": [
        { "name": "Ostrog", "latitude": 42.6833, "longitude": 19.0333 },
        { "name": "Nikšić", "latitude": 42.7731, "longitude": 18.9444 }
      ]
    },
    {
      "name": "Skadar Lake",
      "latitude": 42.1667,
      "longitude": 19.3000,
      "settlements": [
        { "name": "Skadar Lake", "latitude": 42.1667, "longitude": 19.3000 },
        { "name": "Virpazar", "latitude": 42.2417, "longitude": 19.0944 }
      ]
    },
    {
      "name": "Virpazar",
      "latitude": 42.2417,
      "longitude": 19.0944,
      "settlements": [
        { "name": "Virpazar", "latitude": 42.2417, "longitude": 19.0944 },
        { "name": "Bar", "latitude": 42.0931, "longitude": 19.1000 }
      ]
    }
  ],

  "Serbia": [
    {
      "name": "Belgrade",
      "latitude": 44.7866,
      "longitude": 20.4489,
      "settlements": [
        { "name": "Belgrade", "latitude": 44.7866, "longitude": 20.4489 },
        { "name": "New Belgrade", "latitude": 44.8058, "longitude": 20.4161 },
        { "name": "Zemun", "latitude": 44.8458, "longitude": 20.4011 },
        { "name": "Vračar", "latitude": 44.7972, "longitude": 20.4750 },
        { "name": "Stari Grad", "latitude": 44.8181, "longitude": 20.4572 },
        { "name": "Savski Venac", "latitude": 44.7819, "longitude": 20.4569 },
        { "name": "Čukarica", "latitude": 44.7833, "longitude": 20.4167 },
        { "name": "Palilula", "latitude": 44.8111, "longitude": 20.5167 },
        { "name": "Rakovica", "latitude": 44.7464, "longitude": 20.4458 },
        { "name": "Voždovac", "latitude": 44.7828, "longitude": 20.4822 },
        { "name": "Surčin", "latitude": 44.7931, "longitude": 20.2806 },
        { "name": "Barajevo", "latitude": 44.5786, "longitude": 20.4158 },
        { "name": "Grocka", "latitude": 44.6708, "longitude": 20.7178 },
        { "name": "Lazarevac", "latitude": 44.3853, "longitude": 20.2556 },
        { "name": "Mladenovac", "latitude": 44.4389, "longitude": 20.7000 },
        { "name": "Obrenovac", "latitude": 44.6547, "longitude": 20.2000 },
        { "name": "Sopot", "latitude": 44.5194, "longitude": 20.5742 }
      ]
    },
    {
      "name": "Novi Sad",
      "latitude": 45.2671,
      "longitude": 19.8335,
      "settlements": [
        { "name": "Novi Sad", "latitude": 45.2671, "longitude": 19.8335 },
        { "name": "Petrovaradin", "latitude": 45.2486, "longitude": 19.8814 },
        { "name": "Sremska Kamenica", "latitude": 45.2222, "longitude": 19.8428 },
        { "name": "Futog", "latitude": 45.2394, "longitude": 19.7139 },
        { "name": "Veternik", "latitude": 45.2542, "longitude": 19.7597 },
        { "name": "Ledinci", "latitude": 45.2000, "longitude": 19.8000 },
        { "name": "Bukovac", "latitude": 45.2333, "longitude": 19.7667 }
      ]
    },
    {
      "name": "Niš",
      "latitude": 43.3209,
      "longitude": 21.8958,
      "settlements": [
        { "name": "Niš", "latitude": 43.3209, "longitude": 21.8958 },
        { "name": "Niška Banja", "latitude": 43.2931, "longitude": 22.0069 },
        { "name": "Medijana", "latitude": 43.3167, "longitude": 21.9000 },
        { "name": "Crveni Krst", "latitude": 43.3333, "longitude": 21.9167 },
        { "name": "Pantelej", "latitude": 43.3333, "longitude": 21.9333 },
        { "name": "Palilula", "latitude": 43.3167, "longitude": 21.9333 }
      ]
    },
    {
      "name": "Kragujevac",
      "latitude": 44.0142,
      "longitude": 20.9394,
      "settlements": [
        { "name": "Kragujevac", "latitude": 44.0142, "longitude": 20.9394 },
        { "name": "Aerodrom", "latitude": 44.0333, "longitude": 20.9333 },
        { "name": "Pivara", "latitude": 44.0167, "longitude": 20.9167 },
        { "name": "Stanovo", "latitude": 44.0000, "longitude": 20.9500 },
        { "name": "Stari Grad", "latitude": 44.0167, "longitude": 20.9167 }
      ]
    },
    {
      "name": "Subotica",
      "latitude": 46.1000,
      "longitude": 19.6667,
      "settlements": [
        { "name": "Subotica", "latitude": 46.1000, "longitude": 19.6667 },
        { "name": "Palić", "latitude": 46.1039, "longitude": 19.7686 },
        { "name": "Bajmok", "latitude": 45.9667, "longitude": 19.4167 }
      ]
    },
    {
      "name": "Zrenjanin",
      "latitude": 45.3836,
      "longitude": 20.3819,
      "settlements": [
        { "name": "Zrenjanin", "latitude": 45.3836, "longitude": 20.3819 },
        { "name": "Ečka", "latitude": 45.3239, "longitude": 20.4428 },
        { "name": "Stajićevo", "latitude": 45.2944, "longitude": 20.4583 }
      ]
    },
    {
      "name": "Pančevo",
      "latitude": 44.8706,
      "longitude": 20.6403,
      "settlements": [
        { "name": "Pančevo", "latitude": 44.8706, "longitude": 20.6403 },
        { "name": "Kačarevo", "latitude": 44.9500, "longitude": 20.6900 },
        { "name": "Starčevo", "latitude": 44.8167, "longitude": 20.7000 }
      ]
    },
    {
      "name": "Čačak",
      "latitude": 43.8914,
      "longitude": 20.3497,
      "settlements": [
        { "name": "Čačak", "latitude": 43.8914, "longitude": 20.3497 },
        { "name": "Gornja Gorevnica", "latitude": 43.8667, "longitude": 20.3833 },
        { "name": "Preljina", "latitude": 43.9000, "longitude": 20.4167 }
      ]
    },
    {
      "name": "Kraljevo",
      "latitude": 43.7258,
      "longitude": 20.6894,
      "settlements": [
        { "name": "Kraljevo", "latitude": 43.7258, "longitude": 20.6894 },
        { "name": "Mataruška Banja", "latitude": 43.6833, "longitude": 20.6000 },
        { "name": "Adrani", "latitude": 43.7000, "longitude": 20.7333 }
      ]
    },
    {
      "name": "Smederevo",
      "latitude": 44.6658,
      "longitude": 20.9300,
      "settlements": [
        { "name": "Smederevo", "latitude": 44.6658, "longitude": 20.9300 },
        { "name": "Smederevska Palanka", "latitude": 44.3653, "longitude": 20.9586 },
        { "name": "Radinac", "latitude": 44.6167, "longitude": 20.9667 }
      ]
    },
    {
      "name": "Valjevo",
      "latitude": 44.2667,
      "longitude": 19.8833,
      "settlements": [
        { "name": "Valjevo", "latitude": 44.2667, "longitude": 19.8833 },
        { "name": "Brankovina", "latitude": 44.2333, "longitude": 19.8333 },
        { "name": "Divčibare", "latitude": 44.1000, "longitude": 19.9833 }
      ]
    },
    {
      "name": "Šabac",
      "latitude": 44.7556,
      "longitude": 19.6917,
      "settlements": [
        { "name": "Šabac", "latitude": 44.7556, "longitude": 19.6917 },
        { "name": "Mačvanska Mitrovica", "latitude": 44.9667, "longitude": 19.5833 },
        { "name": "Zminjak", "latitude": 44.7667, "longitude": 19.6333 }
      ]
    },
    {
      "name": "Užice",
      "latitude": 43.8586,
      "longitude": 19.8428,
      "settlements": [
        { "name": "Užice", "latitude": 43.8586, "longitude": 19.8428 },
        { "name": "Sevojno", "latitude": 43.8450, "longitude": 19.8986 },
        { "name": "Kremna", "latitude": 43.8833, "longitude": 19.5833 }
      ]
    },
    {
      "name": "Vranje",
      "latitude": 42.5544,
      "longitude": 21.8972,
      "settlements": [
        { "name": "Vranje", "latitude": 42.5544, "longitude": 21.8972 },
        { "name": "Vranjska Banja", "latitude": 42.5553, "longitude": 21.9919 },
        { "name": "Bujanovac", "latitude": 42.4603, "longitude": 21.7667 }
      ]
    },
    {
      "name": "Zaječar",
      "latitude": 43.9036,
      "longitude": 22.2644,
      "settlements": [
        { "name": "Zaječar", "latitude": 43.9036, "longitude": 22.2644 },
        { "name": "Bor", "latitude": 44.0800, "longitude": 22.0953 },
        { "name": "Gamzigrad", "latitude": 43.9000, "longitude": 22.1833 }
      ]
    },
    {
      "name": "Sombor",
      "latitude": 45.7742,
      "longitude": 19.1147,
      "settlements": [
        { "name": "Sombor", "latitude": 45.7742, "longitude": 19.1147 },
        { "name": "Aleksa Šantić", "latitude": 45.9333, "longitude": 19.1167 },
        { "name": "Gakovo", "latitude": 45.9000, "longitude": 19.0500 }
      ]
    },
    {
      "name": "Požarevac",
      "latitude": 44.6208,
      "longitude": 21.1839,
      "settlements": [
        { "name": "Požarevac", "latitude": 44.6208, "longitude": 21.1839 },
        { "name": "Kostolac", "latitude": 44.7167, "longitude": 21.1667 },
        { "name": "Petka", "latitude": 44.5833, "longitude": 21.2500 }
      ]
    },
    {
      "name": "Pirot",
      "latitude": 43.1531,
      "longitude": 22.5861,
      "settlements": [
        { "name": "Pirot", "latitude": 43.1531, "longitude": 22.5861 },
        { "name": "Temska", "latitude": 43.3000, "longitude": 22.6000 },
        { "name": "Bela Palanka", "latitude": 43.2178, "longitude": 22.3139 }
      ]
    },
    {
      "name": "Kikinda",
      "latitude": 45.8289,
      "longitude": 20.4653,
      "settlements": [
        { "name": "Kikinda", "latitude": 45.8289, "longitude": 20.4653 },
        { "name": "Mokrin", "latitude": 45.9333, "longitude": 20.4167 },
        { "name": "Nakovo", "latitude": 45.8667, "longitude": 20.5667 }
      ]
    },
    {
      "name": "Sremska Mitrovica",
      "latitude": 44.9764,
      "longitude": 19.6122,
      "settlements": [
        { "name": "Sremska Mitrovica", "latitude": 44.9764, "longitude": 19.6122 },
        { "name": "Mačvanska Mitrovica", "latitude": 44.9667, "longitude": 19.5833 },
        { "name": "Jarak", "latitude": 44.9167, "longitude": 19.7500 }
      ]
    },
    {
      "name": "Jagodina",
      "latitude": 43.9772,
      "longitude": 21.2611,
      "settlements": [
        { "name": "Jagodina", "latitude": 43.9772, "longitude": 21.2611 },
        { "name": "Ribarska Banja", "latitude": 43.9333, "longitude": 21.4167 },
        { "name": "Jošanički Bujmir", "latitude": 43.9667, "longitude": 21.3000 }
      ]
    },
    {
      "name": "Vršac",
      "latitude": 45.1167,
      "longitude": 21.3036,
      "settlements": [
        { "name": "Vršac", "latitude": 45.1167, "longitude": 21.3036 },
        { "name": "Vršački Breg", "latitude": 45.1500, "longitude": 21.3167 },
        { "name": "Gudurica", "latitude": 45.1667, "longitude": 21.4333 }
      ]
    },
    {
      "name": "Bor",
      "latitude": 44.0800,
      "longitude": 22.0953,
      "settlements": [
        { "name": "Bor", "latitude": 44.0800, "longitude": 22.0953 },
        { "name": "Brestovac", "latitude": 44.0667, "longitude": 22.1500 },
        { "name": "Slatina", "latitude": 44.1000, "longitude": 22.1167 }
      ]
    },
    {
      "name": "Prokuplje",
      "latitude": 43.2342,
      "longitude": 21.5881,
      "settlements": [
        { "name": "Prokuplje", "latitude": 43.2342, "longitude": 21.5881 },
        { "name": "Džep", "latitude": 43.2000, "longitude": 21.6333 },
        { "name": "Merdare", "latitude": 43.0833, "longitude": 21.4167 }
      ]
    },
    {
      "name": "Loznica",
      "latitude": 44.5333,
      "longitude": 19.2258,
      "settlements": [
        { "name": "Loznica", "latitude": 44.5333, "longitude": 19.2258 },
        { "name": "Krupanj", "latitude": 44.3656, "longitude": 19.3619 },
        { "name": "Lipolist", "latitude": 44.7000, "longitude": 19.5000 }
      ]
    },
    {
      "name": "Smederevska Palanka",
      "latitude": 44.3653,
      "longitude": 20.9586,
      "settlements": [
        { "name": "Smederevska Palanka", "latitude": 44.3653, "longitude": 20.9586 },
        { "name": "Azanja", "latitude": 44.4333, "longitude": 20.8667 },
        { "name": "Kusadak", "latitude": 44.4333, "longitude": 20.7667 }
      ]
    },
    {
      "name": "Leskovac",
      "latitude": 42.9981,
      "longitude": 21.9461,
      "settlements": [
        { "name": "Leskovac", "latitude": 42.9981, "longitude": 21.9461 },
        { "name": "Grdelica", "latitude": 42.9000, "longitude": 22.0667 },
        { "name": "Vučje", "latitude": 42.9667, "longitude": 21.9000 }
      ]
    },
    {
      "name": "Aranđelovac",
      "latitude": 44.3069,
      "longitude": 20.5600,
      "settlements": [
        { "name": "Aranđelovac", "latitude": 44.3069, "longitude": 20.5600 },
        { "name": "Banja", "latitude": 44.3000, "longitude": 20.5667 },
        { "name": "Bukulja", "latitude": 44.2833, "longitude": 20.5000 }
      ]
    },
    {
      "name": "Gornji Milanovac",
      "latitude": 44.0242,
      "longitude": 20.4586,
      "settlements": [
        { "name": "Gornji Milanovac", "latitude": 44.0242, "longitude": 20.4586 },
        { "name": "Rudnik", "latitude": 44.1667, "longitude": 20.5000 },
        { "name": "Brusnica", "latitude": 44.0667, "longitude": 20.4167 }
      ]
    },
    {
      "name": "Bačka Palanka",
      "latitude": 45.2500,
      "longitude": 19.3917,
      "settlements": [
        { "name": "Bačka Palanka", "latitude": 45.2500, "longitude": 19.3917 },
        { "name": "Neštin", "latitude": 45.2333, "longitude": 19.4333 },
        { "name": "Karađorđevo", "latitude": 45.3000, "longitude": 19.3500 }
      ]
    },
    {
      "name": "Temerin",
      "latitude": 45.4083,
      "longitude": 19.8889,
      "settlements": [
        { "name": "Temerin", "latitude": 45.4083, "longitude": 19.8889 },
        { "name": "Sirig", "latitude": 45.4500, "longitude": 19.8333 },
        { "name": "Bački Jarak", "latitude": 45.3667, "longitude": 19.8667 }
      ]
    },
    {
      "name": "Zlatibor",
      "latitude": 43.7200,
      "longitude": 19.7000,
      "settlements": [
        { "name": "Zlatibor", "latitude": 43.7200, "longitude": 19.7000 },
        { "name": "Čajetina", "latitude": 43.7500, "longitude": 19.7167 },
        { "name": "Sirogojno", "latitude": 43.6833, "longitude": 19.8833 },
        { "name": "Mokra Gora", "latitude": 43.7833, "longitude": 19.5167 },
        { "name": "Kremna", "latitude": 43.8833, "longitude": 19.5833 }
      ]
    },
    {
      "name": "Kopaonik",
      "latitude": 43.2858,
      "longitude": 20.8083,
      "settlements": [
        { "name": "Kopaonik", "latitude": 43.2858, "longitude": 20.8083 },
        { "name": "Brus", "latitude": 43.3833, "longitude": 21.0333 },
        { "name": "Jošanička Banja", "latitude": 43.3892, "longitude": 20.7522 }
      ]
    },
    {
      "name": "Fruška Gora",
      "latitude": 45.1500,
      "longitude": 19.7167,
      "settlements": [
        { "name": "Fruška Gora", "latitude": 45.1500, "longitude": 19.7167 },
        { "name": "Iriški Venac", "latitude": 45.1333, "longitude": 19.7667 },
        { "name": "Mala Remeta", "latitude": 45.1500, "longitude": 19.7500 }
      ]
    },
    {
      "name": "Tara",
      "latitude": 43.9500,
      "longitude": 19.4500,
      "settlements": [
        { "name": "Tara", "latitude": 43.9500, "longitude": 19.4500 },
        { "name": "Bajina Bašta", "latitude": 43.9708, "longitude": 19.5678 },
        { "name": "Perućac", "latitude": 43.9500, "longitude": 19.4333 }
      ]
    }
  ],

  "Croatia": [
    {
      "name": "Zagreb",
      "latitude": 45.8150,
      "longitude": 15.9819,
      "settlements": [
        { "name": "Zagreb", "latitude": 45.8150, "longitude": 15.9819 },
        { "name": "Sesvete", "latitude": 45.8333, "longitude": 16.1167 },
        { "name": "Dubrava", "latitude": 45.8333, "longitude": 16.0667 },
        { "name": "Novi Zagreb", "latitude": 45.7667, "longitude": 15.9667 },
        { "name": "Podsljeme", "latitude": 45.8500, "longitude": 15.9500 },
        { "name": "Stenjevec", "latitude": 45.8000, "longitude": 15.8667 },
        { "name": "Trešnjevka", "latitude": 45.8000, "longitude": 15.9500 },
        { "name": "Maksimir", "latitude": 45.8333, "longitude": 16.0167 }
      ]
    },
    {
      "name": "Split",
      "latitude": 43.5081,
      "longitude": 16.4402,
      "settlements": [
        { "name": "Split", "latitude": 43.5081, "longitude": 16.4402 },
        { "name": "Stobreč", "latitude": 43.5000, "longitude": 16.5167 },
        { "name": "Podstrana", "latitude": 43.4833, "longitude": 16.5500 },
        { "name": "Žrnovnica", "latitude": 43.5167, "longitude": 16.5667 },
        { "name": "Solin", "latitude": 43.5333, "longitude": 16.4833 },
        { "name": "Kaštela", "latitude": 43.5500, "longitude": 16.4333 },
        { "name": "Trogir", "latitude": 43.5167, "longitude": 16.2500 }
      ]
    },
    {
      "name": "Rijeka",
      "latitude": 45.3271,
      "longitude": 14.4422,
      "settlements": [
        { "name": "Rijeka", "latitude": 45.3271, "longitude": 14.4422 },
        { "name": "Sušak", "latitude": 45.3333, "longitude": 14.4500 },
        { "name": "Bakar", "latitude": 45.3167, "longitude": 14.5333 },
        { "name": "Kastav", "latitude": 45.3750, "longitude": 14.3486 },
        { "name": "Opatija", "latitude": 45.3333, "longitude": 14.3000 },
        { "name": "Crikvenica", "latitude": 45.1761, "longitude": 14.6928 }
      ]
    },
    {
      "name": "Osijek",
      "latitude": 45.5556,
      "longitude": 18.6944,
      "settlements": [
        { "name": "Osijek", "latitude": 45.5556, "longitude": 18.6944 },
        { "name": "Tvrđa", "latitude": 45.5600, "longitude": 18.6950 },
        { "name": "Retfala", "latitude": 45.5667, "longitude": 18.6667 },
        { "name": "Brijest", "latitude": 45.5833, "longitude": 18.6833 },
        { "name": "Sarvaš", "latitude": 45.5333, "longitude": 18.8333 }
      ]
    },
    {
      "name": "Zadar",
      "latitude": 44.1194,
      "longitude": 15.2317,
      "settlements": [
        { "name": "Zadar", "latitude": 44.1194, "longitude": 15.2317 },
        { "name": "Borik", "latitude": 44.1333, "longitude": 15.2167 },
        { "name": "Puntamika", "latitude": 44.1333, "longitude": 15.2333 },
        { "name": "Biograd na Moru", "latitude": 43.9400, "longitude": 15.4439 },
        { "name": "Nin", "latitude": 44.2333, "longitude": 15.1833 }
      ]
    },
    {
      "name": "Pula",
      "latitude": 44.8667,
      "longitude": 13.8500,
      "settlements": [
        { "name": "Pula", "latitude": 44.8667, "longitude": 13.8500 },
        { "name": "Veruda", "latitude": 44.8333, "longitude": 13.8500 },
        { "name": "Štinjan", "latitude": 44.8667, "longitude": 13.8333 },
        { "name": "Vodnjan", "latitude": 44.9667, "longitude": 13.8500 },
        { "name": "Fažana", "latitude": 44.9272, "longitude": 13.8036 }
      ]
    },
    {
      "name": "Slavonski Brod",
      "latitude": 45.1667,
      "longitude": 18.0167,
      "settlements": [
        { "name": "Slavonski Brod", "latitude": 45.1667, "longitude": 18.0167 },
        { "name": "Brodska Posavina", "latitude": 45.1500, "longitude": 18.0667 },
        { "name": "Podvinje", "latitude": 45.1903, "longitude": 18.0269 }
      ]
    },
    {
      "name": "Karlovac",
      "latitude": 45.4872,
      "longitude": 15.5478,
      "settlements": [
        { "name": "Karlovac", "latitude": 45.4872, "longitude": 15.5478 },
        { "name": "Dubovac", "latitude": 45.4667, "longitude": 15.5667 },
        { "name": "Mala Švarča", "latitude": 45.5167, "longitude": 15.5333 }
      ]
    },
    {
      "name": "Varaždin",
      "latitude": 46.3056,
      "longitude": 16.3364,
      "settlements": [
        { "name": "Varaždin", "latitude": 46.3056, "longitude": 16.3364 },
        { "name": "Varaždinske Toplice", "latitude": 46.2086, "longitude": 16.4211 },
        { "name": "Jalžabet", "latitude": 46.2667, "longitude": 16.4750 }
      ]
    },
    {
      "name": "Šibenik",
      "latitude": 43.7339,
      "longitude": 15.8956,
      "settlements": [
        { "name": "Šibenik", "latitude": 43.7339, "longitude": 15.8956 },
        { "name": "Solaris", "latitude": 43.7167, "longitude": 15.9000 },
        { "name": "Zablaće", "latitude": 43.7500, "longitude": 15.9167 },
        { "name": "Vodice", "latitude": 43.7611, "longitude": 15.7828 }
      ]
    },
    {
      "name": "Sisak",
      "latitude": 45.4833,
      "longitude": 16.3667,
      "settlements": [
        { "name": "Sisak", "latitude": 45.4833, "longitude": 16.3667 },
        { "name": "Caprag", "latitude": 45.4667, "longitude": 16.3833 },
        { "name": "Staro Pračno", "latitude": 45.4500, "longitude": 16.4167 }
      ]
    },
    {
      "name": "Velika Gorica",
      "latitude": 45.7125,
      "longitude": 16.0756,
      "settlements": [
        { "name": "Velika Gorica", "latitude": 45.7125, "longitude": 16.0756 },
        { "name": "Mraclin", "latitude": 45.6667, "longitude": 16.0833 },
        { "name": "Buševec", "latitude": 45.6833, "longitude": 16.1333 }
      ]
    },
    {
      "name": "Dubrovnik",
      "latitude": 42.6403,
      "longitude": 18.1083,
      "settlements": [
        { "name": "Dubrovnik", "latitude": 42.6403, "longitude": 18.1083 },
        { "name": "Lapad", "latitude": 42.6500, "longitude": 18.0667 },
        { "name": "Cavtat", "latitude": 42.5811, "longitude": 18.2181 },
        { "name": "Gruž", "latitude": 42.6500, "longitude": 18.0833 },
        { "name": "Ploče", "latitude": 42.6333, "longitude": 18.1167 },
        { "name": "Kupari", "latitude": 42.6167, "longitude": 18.1833 }
      ]
    },
    {
      "name": "Bjelovar",
      "latitude": 45.8986,
      "longitude": 16.8489,
      "settlements": [
        { "name": "Bjelovar", "latitude": 45.8986, "longitude": 16.8489 },
        { "name": "Gornje Plavnice", "latitude": 45.9000, "longitude": 16.8667 },
        { "name": "Novoseljani", "latitude": 45.8667, "longitude": 16.8333 }
      ]
    },
    {
      "name": "Koprivnica",
      "latitude": 46.1628,
      "longitude": 16.8275,
      "settlements": [
        { "name": "Koprivnica", "latitude": 46.1628, "longitude": 16.8275 },
        { "name": "Koprivnički Ivanec", "latitude": 46.2000, "longitude": 16.8167 },
        { "name": "Herešin", "latitude": 46.1500, "longitude": 16.8500 }
      ]
    },
    {
      "name": "Požega",
      "latitude": 45.3303,
      "longitude": 17.6747,
      "settlements": [
        { "name": "Požega", "latitude": 45.3303, "longitude": 17.6747 },
        { "name": "Eminovci", "latitude": 45.3167, "longitude": 17.7000 },
        { "name": "Kaptol", "latitude": 45.4333, "longitude": 17.7167 }
      ]
    },
    {
      "name": "Virovitica",
      "latitude": 45.8319,
      "longitude": 17.3839,
      "settlements": [
        { "name": "Virovitica", "latitude": 45.8319, "longitude": 17.3839 },
        { "name": "Gradina", "latitude": 45.8500, "longitude": 17.5167 },
        { "name": "Špišić Bukovica", "latitude": 45.8667, "longitude": 17.3000 }
      ]
    },
    {
      "name": "Vukovar",
      "latitude": 45.3433,
      "longitude": 19.0006,
      "settlements": [
        { "name": "Vukovar", "latitude": 45.3433, "longitude": 19.0006 },
        { "name": "Borovo", "latitude": 45.3833, "longitude": 18.9667 },
        { "name": "Lipovača", "latitude": 45.3167, "longitude": 19.0500 }
      ]
    },
    {
      "name": "Čakovec",
      "latitude": 46.3844,
      "longitude": 16.4339,
      "settlements": [
        { "name": "Čakovec", "latitude": 46.3844, "longitude": 16.4339 },
        { "name": "Ivanovec", "latitude": 46.3667, "longitude": 16.4833 },
        { "name": "Šenkovec", "latitude": 46.4089, "longitude": 16.4217 }
      ]
    },
    {
      "name": "Đakovo",
      "latitude": 45.3100,
      "longitude": 18.4100,
      "settlements": [
        { "name": "Đakovo", "latitude": 45.3100, "longitude": 18.4100 },
        { "name": "Kuševac", "latitude": 45.3000, "longitude": 18.4333 },
        { "name": "Vrbica", "latitude": 45.2833, "longitude": 18.3667 }
      ]
    },
    {
      "name": "Rovinj",
      "latitude": 45.0810,
      "longitude": 13.6380,
      "settlements": [
        { "name": "Rovinj", "latitude": 45.0810, "longitude": 13.6380 },
        { "name": "Rovinjsko Selo", "latitude": 45.1000, "longitude": 13.7000 },
        { "name": "Valalta", "latitude": 45.0667, "longitude": 13.6333 },
        { "name": "Monfi", "latitude": 45.0500, "longitude": 13.6500 }
      ]
    },
    {
      "name": "Makarska",
      "latitude": 43.3000,
      "longitude": 17.0167,
      "settlements": [
        { "name": "Makarska", "latitude": 43.3000, "longitude": 17.0167 },
        { "name": "Tučepi", "latitude": 43.2667, "longitude": 17.0500 },
        { "name": "Podgora", "latitude": 43.2444, "longitude": 17.0839 },
        { "name": "Brela", "latitude": 43.3689, "longitude": 16.9342 }
      ]
    },
    {
      "name": "Opatija",
      "latitude": 45.3333,
      "longitude": 14.3000,
      "settlements": [
        { "name": "Opatija", "latitude": 45.3333, "longitude": 14.3000 },
        { "name": "Ičići", "latitude": 45.3167, "longitude": 14.2833 },
        { "name": "Lovran", "latitude": 45.2919, "longitude": 14.2742 },
        { "name": "Volosko", "latitude": 45.3500, "longitude": 14.3000 }
      ]
    },
    {
      "name": "Poreč",
      "latitude": 45.2278,
      "longitude": 13.5939,
      "settlements": [
        { "name": "Poreč", "latitude": 45.2278, "longitude": 13.5939 },
        { "name": "Vrsar", "latitude": 45.1492, "longitude": 13.6053 },
        { "name": "Funtana", "latitude": 45.1747, "longitude": 13.6050 },
        { "name": "Tar", "latitude": 45.3000, "longitude": 13.6250 }
      ]
    },
    {
      "name": "Umag",
      "latitude": 45.4333,
      "longitude": 13.5167,
      "settlements": [
        { "name": "Umag", "latitude": 45.4333, "longitude": 13.5167 },
        { "name": "Savudrija", "latitude": 45.4922, "longitude": 13.5036 },
        { "name": "Katoro", "latitude": 45.4167, "longitude": 13.5333 },
        { "name": "Lovrečica", "latitude": 45.4500, "longitude": 13.5500 }
      ]
    },
    {
      "name": "Novalja",
      "latitude": 44.5578,
      "longitude": 14.8861,
      "settlements": [
        { "name": "Novalja", "latitude": 44.5578, "longitude": 14.8861 },
        { "name": "Stara Novalja", "latitude": 44.5333, "longitude": 14.8833 },
        { "name": "Metajna", "latitude": 44.5833, "longitude": 14.9167 },
        { "name": "Zrće", "latitude": 44.5667, "longitude": 14.9000 }
      ]
    },
    {
      "name": "Hvar",
      "latitude": 43.1725,
      "longitude": 16.4428,
      "settlements": [
        { "name": "Hvar", "latitude": 43.1725, "longitude": 16.4428 },
        { "name": "Stari Grad", "latitude": 43.1833, "longitude": 16.6000 },
        { "name": "Jelsa", "latitude": 43.1617, "longitude": 16.6931 },
        { "name": "Vrboska", "latitude": 43.1806, "longitude": 16.6739 }
      ]
    },
    {
      "name": "Korčula",
      "latitude": 42.9622,
      "longitude": 17.1369,
      "settlements": [
        { "name": "Korčula", "latitude": 42.9622, "longitude": 17.1369 },
        { "name": "Lumbarda", "latitude": 42.9228, "longitude": 17.1672 },
        { "name": "Račišće", "latitude": 42.9750, "longitude": 17.0167 },
        { "name": "Vela Luka", "latitude": 42.9611, "longitude": 16.7192 }
      ]
    },
    {
      "name": "Bol",
      "latitude": 43.2619,
      "longitude": 16.6550,
      "settlements": [
        { "name": "Bol", "latitude": 43.2619, "longitude": 16.6550 },
        { "name": "Zlatni Rat", "latitude": 43.2500, "longitude": 16.6500 },
        { "name": "Murvica", "latitude": 43.2833, "longitude": 16.6333 }
      ]
    },
    {
      "name": "Pag",
      "latitude": 44.4450,
      "longitude": 15.0575,
      "settlements": [
        { "name": "Pag", "latitude": 44.4450, "longitude": 15.0575 },
        { "name": "Novalja", "latitude": 44.5578, "longitude": 14.8861 },
        { "name": "Stara Novalja", "latitude": 44.5333, "longitude": 14.8833 },
        { "name": "Lun", "latitude": 44.5333, "longitude": 14.9667 }
      ]
    },
    {
      "name": "Rab",
      "latitude": 44.7575,
      "longitude": 14.7606,
      "settlements": [
        { "name": "Rab", "latitude": 44.7575, "longitude": 14.7606 },
        { "name": "Lopar", "latitude": 44.8300, "longitude": 14.7300 },
        { "name": "Barbat", "latitude": 44.7333, "longitude": 14.7667 },
        { "name": "Kampor", "latitude": 44.7833, "longitude": 14.7167 }
      ]
    },
    {
      "name": "Krk",
      "latitude": 45.0258,
      "longitude": 14.5756,
      "settlements": [
        { "name": "Krk", "latitude": 45.0258, "longitude": 14.5756 },
        { "name": "Punat", "latitude": 45.0147, "longitude": 14.6289 },
        { "name": "Malinska", "latitude": 45.1258, "longitude": 14.5286 },
        { "name": "Baška", "latitude": 44.9703, "longitude": 14.7533 }
      ]
    },
    {
      "name": "Cres",
      "latitude": 44.9606,
      "longitude": 14.4083,
      "settlements": [
        { "name": "Cres", "latitude": 44.9606, "longitude": 14.4083 },
        { "name": "Mali Lošinj", "latitude": 44.5306, "longitude": 14.4686 },
        { "name": "Veli Lošinj", "latitude": 44.5236, "longitude": 14.4911 },
        { "name": "Osor", "latitude": 44.6906, "longitude": 14.3964 }
      ]
    },
    {
      "name": "Mali Lošinj",
      "latitude": 44.5306,
      "longitude": 14.4686,
      "settlements": [
        { "name": "Mali Lošinj", "latitude": 44.5306, "longitude": 14.4686 },
        { "name": "Veli Lošinj", "latitude": 44.5236, "longitude": 14.4911 },
        { "name": "Nerezine", "latitude": 44.6583, "longitude": 14.3986 },
        { "name": "Ćunski", "latitude": 44.6333, "longitude": 14.4167 }
      ]
    },
    {
      "name": "Biograd na Moru",
      "latitude": 43.9400,
      "longitude": 15.4439,
      "settlements": [
        { "name": "Biograd na Moru", "latitude": 43.9400, "longitude": 15.4439 },
        { "name": "Sv. Filip i Jakov", "latitude": 43.9639, "longitude": 15.4300 },
        { "name": "Pakoštane", "latitude": 43.9100, "longitude": 15.5089 }
      ]
    },
    {
      "name": "Primošten",
      "latitude": 43.5864,
      "longitude": 15.9239,
      "settlements": [
        { "name": "Primošten", "latitude": 43.5864, "longitude": 15.9239 },
        { "name": "Široka", "latitude": 43.6000, "longitude": 15.9333 },
        { "name": "Vodice", "latitude": 43.7611, "longitude": 15.7828 }
      ]
    },
    {
      "name": "Trogir",
      "latitude": 43.5167,
      "longitude": 16.2500,
      "settlements": [
        { "name": "Trogir", "latitude": 43.5167, "longitude": 16.2500 },
        { "name": "Seget", "latitude": 43.5333, "longitude": 16.2333 },
        { "name": "Marina", "latitude": 43.5500, "longitude": 16.1167 },
        { "name": "Okrug Gornji", "latitude": 43.4833, "longitude": 16.2667 }
      ]
    },
    {
      "name": "Šolta",
      "latitude": 43.4000,
      "longitude": 16.3000,
      "settlements": [
        { "name": "Šolta", "latitude": 43.4000, "longitude": 16.3000 },
        { "name": "Maslinica", "latitude": 43.3958, "longitude": 16.2083 },
        { "name": "Stomorska", "latitude": 43.3833, "longitude": 16.3667 },
        { "name": "Rogač", "latitude": 43.4167, "longitude": 16.3000 }
      ]
    },
    {
      "name": "Brač",
      "latitude": 43.3333,
      "longitude": 16.6667,
      "settlements": [
        { "name": "Supetar", "latitude": 43.3844, "longitude": 16.5508 },
        { "name": "Bol", "latitude": 43.2619, "longitude": 16.6550 },
        { "name": "Milna", "latitude": 43.3267, "longitude": 16.4500 },
        { "name": "Postira", "latitude": 43.3756, "longitude": 16.6319 }
      ]
    },
    {
      "name": "Vis",
      "latitude": 43.0611,
      "longitude": 16.1831,
      "settlements": [
        { "name": "Vis", "latitude": 43.0611, "longitude": 16.1831 },
        { "name": "Komiža", "latitude": 43.0431, "longitude": 16.0931 },
        { "name": "Rukavac", "latitude": 43.0333, "longitude": 16.2000 },
        { "name": "Milna", "latitude": 43.0500, "longitude": 16.2333 }
      ]
    },
    {
      "name": "Lastovo",
      "latitude": 42.7500,
      "longitude": 16.8667,
      "settlements": [
        { "name": "Lastovo", "latitude": 42.7500, "longitude": 16.8667 },
        { "name": "Ubli", "latitude": 42.7333, "longitude": 16.8167 },
        { "name": "Zaklopatica", "latitude": 42.7667, "longitude": 16.9000 },
        { "name": "Pasadur", "latitude": 42.7500, "longitude": 16.8333 }
      ]
    },
    {
      "name": "Mljet",
      "latitude": 42.7444,
      "longitude": 17.5361,
      "settlements": [
        { "name": "Mljet", "latitude": 42.7444, "longitude": 17.5361 },
        { "name": "Pomena", "latitude": 42.7833, "longitude": 17.3667 },
        { "name": "Polаče", "latitude": 42.7833, "longitude": 17.5167 },
        { "name": "Saplunara", "latitude": 42.7167, "longitude": 17.5833 }
      ]
    }
  ],
  "Bosnia and Herzegovina": [
    {
      "name": "Sarajevo",
      "latitude": 43.8563,
      "longitude": 18.4131,
      "settlements": [
        { "name": "Sarajevo", "latitude": 43.8563, "longitude": 18.4131 },
        { "name": "Ilidža", "latitude": 43.8200, "longitude": 18.3000 },
        { "name": "Stari Grad", "latitude": 43.8590, "longitude": 18.4300 },
        { "name": "Centar", "latitude": 43.8560, "longitude": 18.4200 },
        { "name": "Novo Sarajevo", "latitude": 43.8700, "longitude": 18.4100 },
        { "name": "Novi Grad", "latitude": 43.8400, "longitude": 18.3800 },
        { "name": "Vogošća", "latitude": 43.9000, "longitude": 18.3500 },
        { "name": "Hadžići", "latitude": 43.8200, "longitude": 18.2000 },
        { "name": "Ilijaš", "latitude": 43.9500, "longitude": 18.2700 }
      ]
    },
    {
      "name": "Banja Luka",
      "latitude": 44.7667,
      "longitude": 17.1833,
      "settlements": [
        { "name": "Banja Luka", "latitude": 44.7667, "longitude": 17.1833 },
        { "name": "Laktaši", "latitude": 44.9000, "longitude": 17.3000 },
        { "name": "Gradiška", "latitude": 45.1333, "longitude": 17.2500 },
        { "name": "Čelinac", "latitude": 44.7167, "longitude": 17.3167 },
        { "name": "Kotor Varoš", "latitude": 44.6167, "longitude": 17.3667 },
        { "name": "Srbač", "latitude": 45.0833, "longitude": 17.5167 }
      ]
    },
    {
      "name": "Tuzla",
      "latitude": 44.5381,
      "longitude": 18.6761,
      "settlements": [
        { "name": "Tuzla", "latitude": 44.5381, "longitude": 18.6761 },
        { "name": "Lukavac", "latitude": 44.5333, "longitude": 18.5167 },
        { "name": "Živinice", "latitude": 44.4500, "longitude": 18.6500 },
        { "name": "Banovići", "latitude": 44.4000, "longitude": 18.5333 },
        { "name": "Kalesija", "latitude": 44.4333, "longitude": 18.8833 },
        { "name": "Srebrenik", "latitude": 44.7000, "longitude": 18.4833 }
      ]
    },
    {
      "name": "Zenica",
      "latitude": 44.2014,
      "longitude": 17.9064,
      "settlements": [
        { "name": "Zenica", "latitude": 44.2014, "longitude": 17.9064 },
        { "name": "Žepče", "latitude": 44.4333, "longitude": 18.0333 },
        { "name": "Zavidovići", "latitude": 44.4500, "longitude": 18.1500 },
        { "name": "Kakanj", "latitude": 44.1333, "longitude": 18.1167 },
        { "name": "Visoko", "latitude": 43.9833, "longitude": 18.1833 },
        { "name": "Breza", "latitude": 44.0167, "longitude": 18.2667 }
      ]
    },
    {
      "name": "Mostar",
      "latitude": 43.3433,
      "longitude": 17.8081,
      "settlements": [
        { "name": "Mostar", "latitude": 43.3433, "longitude": 17.8081 },
        { "name": "Blagaj", "latitude": 43.2560, "longitude": 17.8860 },
        { "name": "Počitelj", "latitude": 43.1330, "longitude": 17.7330 },
        { "name": "Čapljina", "latitude": 43.1167, "longitude": 17.7000 },
        { "name": "Ljubuški", "latitude": 43.2000, "longitude": 17.5500 },
        { "name": "Široki Brijeg", "latitude": 43.3833, "longitude": 17.5833 },
        { "name": "Stolac", "latitude": 43.0833, "longitude": 17.9500 }
      ]
    },
    {
      "name": "Bijeljina",
      "latitude": 44.7500,
      "longitude": 19.2167,
      "settlements": [
        { "name": "Bijeljina", "latitude": 44.7500, "longitude": 19.2167 },
        { "name": "Janja", "latitude": 44.6667, "longitude": 19.2500 },
        { "name": "Dvorovi", "latitude": 44.7833, "longitude": 19.2833 },
        { "name": "Amajlije", "latitude": 44.7333, "longitude": 19.2000 }
      ]
    },
    {
      "name": "Prijedor",
      "latitude": 44.9667,
      "longitude": 16.7000,
      "settlements": [
        { "name": "Prijedor", "latitude": 44.9667, "longitude": 16.7000 },
        { "name": "Kozarac", "latitude": 44.9667, "longitude": 16.8333 },
        { "name": "Omarska", "latitude": 44.8833, "longitude": 16.9000 },
        { "name": "Trnopolje", "latitude": 44.9167, "longitude": 16.7167 }
      ]
    },
    {
      "name": "Doboj",
      "latitude": 44.7333,
      "longitude": 18.0833,
      "settlements": [
        { "name": "Doboj", "latitude": 44.7333, "longitude": 18.0833 },
        { "name": "Modriča", "latitude": 44.9500, "longitude": 18.3167 },
        { "name": "Derventa", "latitude": 44.9833, "longitude": 17.9000 },
        { "name": "Teslić", "latitude": 44.6000, "longitude": 17.8500 },
        { "name": "Šamac", "latitude": 45.0667, "longitude": 18.4667 }
      ]
    },
    {
      "name": "Trebinje",
      "latitude": 42.7120,
      "longitude": 18.3442,
      "settlements": [
        { "name": "Trebinje", "latitude": 42.7120, "longitude": 18.3442 },
        { "name": "Lastva", "latitude": 42.6800, "longitude": 18.4000 },
        { "name": "Bileća", "latitude": 42.8667, "longitude": 18.4333 },
        { "name": "Ravno", "latitude": 42.8833, "longitude": 17.9667 }
      ]
    },
    {
      "name": "Zvornik",
      "latitude": 44.3833,
      "longitude": 19.1000,
      "settlements": [
        { "name": "Zvornik", "latitude": 44.3833, "longitude": 19.1000 },
        { "name": "Karakaj", "latitude": 44.4167, "longitude": 19.1167 },
        { "name": "Sapna", "latitude": 44.5000, "longitude": 19.0000 },
        { "name": "Čelić", "latitude": 44.7167, "longitude": 18.8167 }
      ]
    },
    {
      "name": "Bihać",
      "latitude": 44.8167,
      "longitude": 15.8667,
      "settlements": [
        { "name": "Bihać", "latitude": 44.8167, "longitude": 15.8667 },
        { "name": "Bosanska Krupa", "latitude": 44.8833, "longitude": 16.1500 },
        { "name": "Cazin", "latitude": 44.9667, "longitude": 15.9500 },
        { "name": "Velika Kladuša", "latitude": 45.1833, "longitude": 15.8000 },
        { "name": "Bužim", "latitude": 45.0500, "longitude": 16.0333 }
      ]
    },
    {
      "name": "Brčko",
      "latitude": 44.8667,
      "longitude": 18.8167,
      "settlements": [
        { "name": "Brčko", "latitude": 44.8667, "longitude": 18.8167 },
        { "name": "Gornji Rahić", "latitude": 44.9167, "longitude": 18.7667 },
        { "name": "Ugljara", "latitude": 44.8500, "longitude": 18.8500 },
        { "name": "Grbavica", "latitude": 44.8833, "longitude": 18.8333 }
      ]
    },
    {
      "name": "Travnik",
      "latitude": 44.2333,
      "longitude": 17.6667,
      "settlements": [
        { "name": "Travnik", "latitude": 44.2333, "longitude": 17.6667 },
        { "name": "Vitez", "latitude": 44.1667, "longitude": 17.7833 },
        { "name": "Busovača", "latitude": 44.1000, "longitude": 17.8833 },
        { "name": "Novi Travnik", "latitude": 44.1667, "longitude": 17.6500 },
        { "name": "Turbe", "latitude": 44.2333, "longitude": 17.5667 }
      ]
    },
    {
      "name": "Livno",
      "latitude": 43.8333,
      "longitude": 17.0000,
      "settlements": [
        { "name": "Livno", "latitude": 43.8333, "longitude": 17.0000 },
        { "name": "Glamoč", "latitude": 44.0500, "longitude": 16.8500 },
        { "name": "Kupres", "latitude": 43.9833, "longitude": 17.2833 },
        { "name": "Bosansko Grahovo", "latitude": 44.1833, "longitude": 16.3667 }
      ]
    },
    {
      "name": "Jajce",
      "latitude": 44.3333,
      "longitude": 17.2667,
      "settlements": [
        { "name": "Jajce", "latitude": 44.3333, "longitude": 17.2667 },
        { "name": "Donji Vakuf", "latitude": 44.1500, "longitude": 17.4000 },
        { "name": "Šipovo", "latitude": 44.2833, "longitude": 17.0833 },
        { "name": "Mrkonjić Grad", "latitude": 44.4167, "longitude": 17.0833 }
      ]
    },
    {
      "name": "Konjic",
      "latitude": 43.6500,
      "longitude": 17.9667,
      "settlements": [
        { "name": "Konjic", "latitude": 43.6500, "longitude": 17.9667 },
        { "name": "Jablanica", "latitude": 43.6667, "longitude": 17.7667 },
        { "name": "Borci", "latitude": 43.6000, "longitude": 18.0000 },
        { "name": "Bjelimići", "latitude": 43.6333, "longitude": 17.9333 }
      ]
    },
    {
      "name": "Goražde",
      "latitude": 43.6667,
      "longitude": 18.9667,
      "settlements": [
        { "name": "Goražde", "latitude": 43.6667, "longitude": 18.9667 },
        { "name": "Ustikolina", "latitude": 43.5833, "longitude": 18.7833 },
        { "name": "Foča", "latitude": 43.5000, "longitude": 18.7833 },
        { "name": "Pale", "latitude": 43.8167, "longitude": 18.5667 }
      ]
    },
    {
      "name": "Bugojno",
      "latitude": 44.0500,
      "longitude": 17.4500,
      "settlements": [
        { "name": "Bugojno", "latitude": 44.0500, "longitude": 17.4500 },
        { "name": "Gornji Vakuf", "latitude": 43.9333, "longitude": 17.5833 },
        { "name": "Kupres", "latitude": 43.9833, "longitude": 17.2833 },
        { "name": "Donji Vakuf", "latitude": 44.1500, "longitude": 17.4000 }
      ]
    },
    {
      "name": "Sanski Most",
      "latitude": 44.7667,
      "longitude": 16.6667,
      "settlements": [
        { "name": "Sanski Most", "latitude": 44.7667, "longitude": 16.6667 },
        { "name": "Kijuč", "latitude": 44.5333, "longitude": 16.3667 },
        { "name": "Bosanski Petrovac", "latitude": 44.5500, "longitude": 16.3667 },
        { "name": "Drvar", "latitude": 44.3667, "longitude": 16.3833 }
      ]
    },
    {
      "name": "Neum",
      "latitude": 42.9167,
      "longitude": 17.6167,
      "settlements": [
        { "name": "Neum", "latitude": 42.9167, "longitude": 17.6167 },
        { "name": "Stolac", "latitude": 43.0833, "longitude": 17.9500 },
        { "name": "Čapljina", "latitude": 43.1167, "longitude": 17.7000 }
      ]
    },
    {
      "name": "Višegrad",
      "latitude": 43.7833,
      "longitude": 19.3000,
      "settlements": [
        { "name": "Višegrad", "latitude": 43.7833, "longitude": 19.3000 },
        { "name": "Rogatica", "latitude": 43.8000, "longitude": 19.0000 },
        { "name": "Srebrenica", "latitude": 44.1000, "longitude": 19.3000 },
        { "name": "Bratunac", "latitude": 44.1833, "longitude": 19.3333 }
      ]
    },
    {
      "name": "Bosanska Gradiška",
      "latitude": 45.1333,
      "longitude": 17.2500,
      "settlements": [
        { "name": "Bosanska Gradiška", "latitude": 45.1333, "longitude": 17.2500 },
        { "name": "Kozarska Dubica", "latitude": 45.1833, "longitude": 16.8000 },
        { "name": "Novi Grad", "latitude": 45.0500, "longitude": 16.3833 }
      ]
    },
    {
      "name": "Čitluk",
      "latitude": 43.2333,
      "longitude": 17.7000,
      "settlements": [
        { "name": "Čitluk", "latitude": 43.2333, "longitude": 17.7000 },
        { "name": "Međugorje", "latitude": 43.2000, "longitude": 17.6833 },
        { "name": "Ljubuški", "latitude": 43.2000, "longitude": 17.5500 }
      ]
    },
    {
      "name": "Međugorje",
      "latitude": 43.2000,
      "longitude": 17.6833,
      "settlements": [
        { "name": "Međugorje", "latitude": 43.2000, "longitude": 17.6833 },
        { "name": "Bijakovići", "latitude": 43.1833, "longitude": 17.7000 },
        { "name": "Šurmanci", "latitude": 43.1833, "longitude": 17.6667 }
      ]
    },
    {
      "name": "Kiseljak",
      "latitude": 43.9500,
      "longitude": 18.0833,
      "settlements": [
        { "name": "Kiseljak", "latitude": 43.9500, "longitude": 18.0833 },
        { "name": "Fojnica", "latitude": 43.9667, "longitude": 17.9000 },
        { "name": "Kreševo", "latitude": 43.8667, "longitude": 18.0500 }
      ]
    },
    {
      "name": "Orašje",
      "latitude": 45.0333,
      "longitude": 18.6833,
      "settlements": [
        { "name": "Orašje", "latitude": 45.0333, "longitude": 18.6833 },
        { "name": "Odžak", "latitude": 45.0167, "longitude": 18.3167 },
        { "name": "Domaljevac", "latitude": 45.0667, "longitude": 18.5833 }
      ]
    },
    {
      "name": "Prozor",
      "latitude": 43.8333,
      "longitude": 17.6000,
      "settlements": [
        { "name": "Prozor", "latitude": 43.8333, "longitude": 17.6000 },
        { "name": "Jablanica", "latitude": 43.6667, "longitude": 17.7667 },
        { "name": "Rumboci", "latitude": 43.8333, "longitude": 17.5000 }
      ]
    },
    {
      "name": "Grude",
      "latitude": 43.3667,
      "longitude": 17.4167,
      "settlements": [
        { "name": "Grude", "latitude": 43.3667, "longitude": 17.4167 },
        { "name": "Široki Brijeg", "latitude": 43.3833, "longitude": 17.5833 },
        { "name": "Ljubuški", "latitude": 43.2000, "longitude": 17.5500 }
      ]
    },
    {
      "name": "Posušje",
      "latitude": 43.4667,
      "longitude": 17.3333,
      "settlements": [
        { "name": "Posušje", "latitude": 43.4667, "longitude": 17.3333 },
        { "name": "Vir", "latitude": 43.5000, "longitude": 17.3833 },
        { "name": "Grabovnica", "latitude": 43.4500, "longitude": 17.3000 }
      ]
    },
    {
      "name": "Tomislavgrad",
      "latitude": 43.7167,
      "longitude": 17.2333,
      "settlements": [
        { "name": "Tomislavgrad", "latitude": 43.7167, "longitude": 17.2333 },
        { "name": "Livno", "latitude": 43.8333, "longitude": 17.0000 },
        { "name": "Kupres", "latitude": 43.9833, "longitude": 17.2833 }
      ]
    },
    {
      "name": "Novi Šeher",
      "latitude": 44.5167,
      "longitude": 18.0333,
      "settlements": [
        { "name": "Novi Šeher", "latitude": 44.5167, "longitude": 18.0333 },
        { "name": "Maglaj", "latitude": 44.5500, "longitude": 18.1000 },
        { "name": "Tešanj", "latitude": 44.6167, "longitude": 17.9833 }
      ]
    },
    {
      "name": "Vareš",
      "latitude": 44.1667,
      "longitude": 18.3333,
      "settlements": [
        { "name": "Vareš", "latitude": 44.1667, "longitude": 18.3333 },
        { "name": "Breza", "latitude": 44.0167, "longitude": 18.2667 },
        { "name": "Olovo", "latitude": 44.1167, "longitude": 18.5833 }
      ]
    },
    {
      "name": "Pale",
      "latitude": 43.8167,
      "longitude": 18.5667,
      "settlements": [
        { "name": "Pale", "latitude": 43.8167, "longitude": 18.5667 },
        { "name": "Sokolac", "latitude": 43.9333, "longitude": 18.8000 },
        { "name": "Rogatica", "latitude": 43.8000, "longitude": 19.0000 }
      ]
    },
    {
      "name": "Han Pijesak",
      "latitude": 44.0833,
      "longitude": 18.9500,
      "settlements": [
        { "name": "Vlasenica", "latitude": 44.1833, "longitude": 18.9333 },
        { "name": "Milići", "latitude": 44.1667, "longitude": 19.0833 }
      ]
    },
    {
      "name": "Rudo",
      "latitude": 43.6167,
      "longitude": 19.3667,
      "settlements": [
        { "name": "Rudo", "latitude": 43.6167, "longitude": 19.3667 },
        { "name": "Višegrad", "latitude": 43.7833, "longitude": 19.3000 },
        { "name": "Ustiprača", "latitude": 43.7000, "longitude": 19.0833 }
      ]
    },
    {
      "name": "Berkovići",
      "latitude": 43.1000,
      "longitude": 18.1667,
      "settlements": [
        { "name": "Berkovići", "latitude": 43.1000, "longitude": 18.1667 },
        { "name": "Stolac", "latitude": 43.0833, "longitude": 17.9500 },
        { "name": "Bileća", "latitude": 42.8667, "longitude": 18.4333 }
      ]
    },
    {
      "name": "Istočno Sarajevo",
      "latitude": 43.8167,
      "longitude": 18.3500,
      "settlements": [
        { "name": "Istočno Sarajevo", "latitude": 43.8167, "longitude": 18.3500 },
        { "name": "Pale", "latitude": 43.8167, "longitude": 18.5667 },
        { "name": "Sokolac", "latitude": 43.9333, "longitude": 18.8000 },
        { "name": "Trnovo", "latitude": 43.6667, "longitude": 18.4500 }
      ]
    }
  ]
};
