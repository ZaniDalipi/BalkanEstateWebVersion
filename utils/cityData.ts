import { Municipality } from '../types';

// This is the new raw data structure. It's hierarchical.
// We define it here and it will be processed into the format the app uses.
// FIX: The complex and incorrect type definition was replaced with the simple and correct one.
export const MUNICIPALITY_RAW_DATA: Record<string, Municipality[]> = {
  "North Macedonia": [
    {
      name: "Resen",
      latitude: 41.0889,
      longitude: 21.0122,
      settlements: [
        { name: "Resen", latitude: 41.0889, longitude: 21.0122 },
        { name: "Krani", localNames: ["Крани"], latitude: 40.9750, longitude: 21.0600 },
        { name: "Nakolec", localNames: ["Наколец"], latitude: 40.92, longitude: 21.09 },
        { name: "Brajčino", localNames: ["Брајчино"], latitude: 40.925, longitude: 21.166 },
        { name: "Stenje", localNames: ["Стење"], latitude: 40.95, longitude: 21.083 },
        { name: "Ljubojno", latitude: 40.89, longitude: 21.14 },
        { name: "Dolno Dupeni", latitude: 40.87, longitude: 21.11 },
      ]
    },
    {
      name: "Ohrid",
      latitude: 41.1171,
      longitude: 20.8016,
      settlements: [
        { name: "Ohrid", latitude: 41.1171, longitude: 20.8016 },
        { name: "Peštani", latitude: 41.01, longitude: 20.81 },
        { name: "Trpejca", latitude: 40.98, longitude: 20.78 },
        { name: "Velgošti", latitude: 41.13, longitude: 20.85 },
      ]
    },
    {
      name: "Skopje",
      latitude: 41.9981,
      longitude: 21.4254,
      settlements: [
        { name: "Skopje", latitude: 41.9981, longitude: 21.4254 },
        { name: "Aerodrom", latitude: 41.98, longitude: 21.47 },
        { name: "Karpoš", latitude: 42.00, longitude: 21.39 },
        { name: "Gazi Baba", latitude: 42.01, longitude: 21.48 },
      ]
    },
    {
      name: "Bitola",
      latitude: 41.0319,
      longitude: 21.3347,
      settlements: [
        { name: "Bitola", latitude: 41.0319, longitude: 21.3347 },
        { name: "Bukovo", latitude: 40.99, longitude: 21.33 },
        { name: "Lavci", latitude: 41.04, longitude: 21.30 },
      ]
    },
    {
      name: "Struga",
      latitude: 41.1778,
      longitude: 20.6783,
      settlements: [
        { name: "Struga", latitude: 41.1778, longitude: 20.6783 },
        { name: "Radožda", latitude: 41.08, longitude: 20.64 },
        { name: "Kališta", latitude: 41.13, longitude: 20.64 },
      ]
    }
  ],
  "Albania": [
    {
        name: "Sarandë",
        latitude: 39.8756,
        longitude: 20.0056,
        settlements: [
            { name: "Sarandë", latitude: 39.8756, longitude: 20.0056 },
            { name: "Ksamil", latitude: 39.77, longitude: 20.00 },
            { name: "Çukë", latitude: 39.83, longitude: 20.03 },
        ]
    },
    {
        name: "Tirana",
        latitude: 41.3275,
        longitude: 19.8189,
        settlements: [
            { name: "Tirana", latitude: 41.3275, longitude: 19.8189 },
            { name: "Kashar", latitude: 41.35, longitude: 19.74 },
            { name: "Vaqarr", latitude: 41.27, longitude: 19.75 },
        ]
    },
    {
        name: "Vlorë",
        latitude: 40.4667,
        longitude: 19.4897,
        settlements: [
            { name: "Vlorë", latitude: 40.4667, longitude: 19.4897 },
            { name: "Orikum", latitude: 40.32, longitude: 19.47 },
            { name: "Radhimë", latitude: 40.38, longitude: 19.48 },
        ]
    },
    {
        name: "Durrës",
        latitude: 41.32,
        longitude: 19.46,
        settlements: [
            { name: "Durrës", latitude: 41.32, longitude: 19.46 },
            { name: "Golem", latitude: 41.24, longitude: 19.53 },
            { name: "Shijak", latitude: 41.34, longitude: 19.56 },
        ]
    }
  ],
  "Montenegro": [
    {
        name: "Budva",
        latitude: 42.2881,
        longitude: 18.8423,
        settlements: [
            { name: "Budva", latitude: 42.2881, longitude: 18.8423 },
            { name: "Bečići", latitude: 42.28, longitude: 18.87 },
            { name: "Sveti Stefan", latitude: 42.256, longitude: 18.891 },
            { name: "Petrovac", latitude: 42.20, longitude: 18.94 },
        ]
    },
    {
        name: "Kotor",
        latitude: 42.4247,
        longitude: 18.7712,
        settlements: [
            { name: "Kotor", latitude: 42.4247, longitude: 18.7712 },
            { name: "Perast", latitude: 42.48, longitude: 18.70 },
            { name: "Dobrota", latitude: 42.44, longitude: 18.77 },
        ]
    },
    {
        name: "Herceg Novi",
        latitude: 42.45,
        longitude: 18.53,
        settlements: [
            { name: "Herceg Novi", latitude: 42.45, longitude: 18.53 },
            { name: "Igalo", latitude: 42.45, longitude: 18.51 },
            { name: "Meljine", latitude: 42.45, longitude: 18.56 },
        ]
    }
  ],
  "Greece": [
    {
        name: "Santorini (Thira)",
        latitude: 36.3932,
        longitude: 25.4615,
        settlements: [
            { name: "Fira", latitude: 36.41, longitude: 25.43 },
            { name: "Oia", localNames: ["Οία"], latitude: 36.462, longitude: 25.375 },
            { name: "Kamari", latitude: 36.37, longitude: 25.48 },
            { name: "Perissa", latitude: 36.35, longitude: 25.47 },
        ]
    },
    {
        name: "Thessaloniki",
        latitude: 40.6401,
        longitude: 22.9444,
        settlements: [
            { name: "Thessaloniki", latitude: 40.6401, longitude: 22.9444 },
            { name: "Kalamaria", latitude: 40.58, longitude: 22.95 },
            { name: "Pylaia", latitude: 40.60, longitude: 22.99 },
        ]
    },
    {
        name: "Athens",
        latitude: 37.9838,
        longitude: 23.7275,
        settlements: [
            { name: "Athens", latitude: 37.9838, longitude: 23.7275 },
            { name: "Piraeus", latitude: 37.94, longitude: 23.64 },
            { name: "Glyfada", latitude: 37.86, longitude: 23.75 },
        ]
    }
  ],
  "Bulgaria": [
    {
        name: "Sofia",
        latitude: 42.6977,
        longitude: 23.3219,
        settlements: [
            { name: "Sofia", latitude: 42.6977, longitude: 23.3219 },
            { name: "Boyana", latitude: 42.64, longitude: 23.27 },
            { name: "Pancharevo", latitude: 42.59, longitude: 23.41 },
        ]
    },
    {
        name: "Varna",
        latitude: 43.2141,
        longitude: 27.9147,
        settlements: [
            { name: "Varna", latitude: 43.2141, longitude: 27.9147 },
            { name: "Golden Sands", latitude: 43.28, longitude: 28.04 },
            { name: "Saints Constantine and Helena", latitude: 43.23, longitude: 27.98 },
        ]
    }
  ],
  "Croatia": [
    {
        name: "Rovinj",
        latitude: 45.081,
        longitude: 13.638,
        settlements: [
            { name: "Rovinj", latitude: 45.081, longitude: 13.638 },
            { name: "Rovinjsko Selo", latitude: 45.10, longitude: 13.70 },
        ]
    },
    {
        name: "Split",
        latitude: 43.5081,
        longitude: 16.4402,
        settlements: [
            { name: "Split", latitude: 43.5081, longitude: 16.4402 },
            { name: "Stobreč", latitude: 43.50, longitude: 16.52 },
            { name: "Podstrana", latitude: 43.48, longitude: 16.55 },
        ]
    },
    {
        name: "Dubrovnik",
        latitude: 42.6507,
        longitude: 18.0944,
        settlements: [
            { name: "Dubrovnik", latitude: 42.6507, longitude: 18.0944 },
            { name: "Lapad", latitude: 42.65, longitude: 18.07 },
            { name: "Cavtat", latitude: 42.58, longitude: 18.21 },
        ]
    }
  ],
  "Serbia": [
    {
        name: "Zlatibor",
        latitude: 43.72,
        longitude: 19.70,
        settlements: [
            { name: "Zlatibor", latitude: 43.72, longitude: 19.70 },
            { name: "Čajetina", latitude: 43.74, longitude: 19.71 },
            { name: "Sirogojno", latitude: 43.683, longitude: 19.883 },
        ]
    },
    {
        name: "Belgrade",
        latitude: 44.7866,
        longitude: 20.4489,
        settlements: [
            { name: "Belgrade", latitude: 44.7866, longitude: 20.4489 },
            { name: "New Belgrade", latitude: 44.81, longitude: 20.41 },
            { name: "Zemun", latitude: 44.84, longitude: 20.37 },
            { name: "Vračar", latitude: 44.79, longitude: 20.47 },
        ]
    },
    {
        name: "Novi Sad",
        latitude: 45.2671,
        longitude: 19.8335,
        settlements: [
            { name: "Novi Sad", latitude: 45.2671, longitude: 19.8335 },
            { name: "Petrovaradin", latitude: 45.25, longitude: 19.87 },
            { name: "Sremska Kamenica", latitude: 45.22, longitude: 19.83 },
        ]
    }
  ],
  "Kosovo": [
    {
        name: "Pristina",
        latitude: 42.6629,
        longitude: 21.1655,
        settlements: [
            { name: "Pristina", latitude: 42.6629, longitude: 21.1655 },
            { name: "Gračanica", latitude: 42.60, longitude: 21.19 },
        ]
    },
    {
        name: "Prizren",
        latitude: 42.215,
        longitude: 20.74,
        settlements: [
            { name: "Prizren", latitude: 42.215, longitude: 20.74 },
            { name: "Žur", latitude: 42.17, longitude: 20.70 },
        ]
    }
  ],
  "Bosnia and Herzegovina": [
    {
        name: "Mostar",
        latitude: 43.3438,
        longitude: 17.8078,
        settlements: [
            { name: "Mostar", latitude: 43.3438, longitude: 17.8078 },
            { name: "Blagaj", latitude: 43.256, longitude: 17.886 },
            { name: "Počitelj", latitude: 43.133, longitude: 17.733 },
        ]
    },
    {
        name: "Sarajevo",
        latitude: 43.8563,
        longitude: 18.4131,
        settlements: [
            { name: "Sarajevo", latitude: 43.8563, longitude: 18.4131 },
            { name: "Ilidža", latitude: 43.82, longitude: 18.30 },
            { name: "Stari Grad", latitude: 43.859, longitude: 18.43 },
        ]
    },
    {
        name: "Banja Luka",
        latitude: 44.77,
        longitude: 17.19,
        settlements: [
            { name: "Banja Luka", latitude: 44.77, longitude: 17.19 },
            { name: "Laktaši", latitude: 44.90, longitude: 17.30 },
        ]
    }
  ]
};
