import { Municipality } from '../types';

// This is the new raw data structure. It's hierarchical.
// We define it here and it will be processed into the format the app uses.
// FIX: The complex and incorrect type definition was replaced with the simple and correct one.
export const MUNICIPALITY_RAW_DATA: Record<string, Municipality[]> = {
  "North Macedonia": [
    {
      "name": "Skopje",
      "latitude": 41.9981,
      "longitude": 21.4254,
      "settlements": [
        { "name": "Skopje City", "latitude": 41.9981, "longitude": 21.4254 },
        { "name": "Centar", "latitude": 41.9932, "longitude": 21.4321 },
        { "name": "Karpoš", "latitude": 42.0034, "longitude": 21.3901 },
        { "name": "Aerodrom", "latitude": 41.9532, "longitude": 21.4783 },
        { "name": "Čair", "latitude": 42.0156, "longitude": 21.4412 },
        { "name": "Gazi Baba", "latitude": 41.9867, "longitude": 21.4789 },
        { "name": "Gjorče Petrov", "latitude": 42.0289, "longitude": 21.3214 },
        { "name": "Kisela Voda", "latitude": 41.9456, "longitude": 21.4917 },
        { "name": "Butel", "latitude": 42.0428, "longitude": 21.4567 }
      ]
    },
    {
      "name": "Bitola",
      "latitude": 41.0328,
      "longitude": 21.3403,
      "settlements": [
        { "name": "Bitola City", "latitude": 41.0328, "longitude": 21.3403 },
        { "name": "Bair", "latitude": 41.0256, "longitude": 21.3558 },
        { "name": "Staro Lagovo", "latitude": 41.0872, "longitude": 21.3128 },
        { "name": "Novo Lagovo", "latitude": 41.0744, "longitude": 21.2989 },
        { "name": "Dihovo", "latitude": 41.0639, "longitude": 21.2681 }
      ]
    },
    {
      "name": "Ohrid",
      "latitude": 41.1171,
      "longitude": 20.8016,
      "settlements": [
        { "name": "Ohrid City", "latitude": 41.1171, "longitude": 20.8016 },
        { "name": "Struga", "latitude": 41.1780, "longitude": 20.6778 },
        { "name": "Vevčani", "latitude": 41.2406, "longitude": 20.5933 },
        { "name": "Peshtani", "latitude": 41.0889, "longitude": 20.8567 },
        { "name": "Trpejca", "latitude": 40.9603, "longitude": 20.7831 },
        { "name": "Radožda", "latitude": 41.1208, "longitude": 20.6319 }
      ]
    },
    {
      "name": "Prilep",
      "latitude": 41.3451,
      "longitude": 21.5550,
      "settlements": [
        { "name": "Prilep City", "latitude": 41.3451, "longitude": 21.5550 },
        { "name": "Toplec", "latitude": 41.2858, "longitude": 21.5889 },
        { "name": "Belovodica", "latitude": 41.3122, "longitude": 21.6214 },
        { "name": "Varoš", "latitude": 41.3317, "longitude": 21.5389 }
      ]
    },
    {
      "name": "Tetovo",
      "latitude": 42.0106,
      "longitude": 20.9715,
      "settlements": [
        { "name": "Tetovo City", "latitude": 42.0106, "longitude": 20.9715 },
        { "name": "Šipkovica", "latitude": 42.0358, "longitude": 20.9139 },
        { "name": "Džepčište", "latitude": 41.9983, "longitude": 21.0258 },
        { "name": "Lavce", "latitude": 42.0639, "longitude": 20.9683 }
      ]
    },
    {
      "name": "Kumanovo",
      "latitude": 42.1322,
      "longitude": 21.7144,
      "settlements": [
        { "name": "Kumanovo City", "latitude": 42.1322, "longitude": 21.7144 },
        { "name": "Romanovce", "latitude": 42.0953, "longitude": 21.6939 },
        { "name": "Klečevce", "latitude": 42.1689, "longitude": 21.8267 },
        { "name": "Proevce", "latitude": 42.1536, "longitude": 21.6542 }
      ]
    },
    {
      "name": "Štip",
      "latitude": 41.7458,
      "longitude": 22.1956,
      "settlements": [
        { "name": "Štip City", "latitude": 41.7458, "longitude": 22.1956 },
        { "name": "Bargala", "latitude": 41.7889, "longitude": 22.2458 },
        { "name": "Orizari", "latitude": 41.7239, "longitude": 22.1567 },
        { "name": "Kaldirec", "latitude": 41.7681, "longitude": 22.1239 }
      ]
    },
    {
      "name": "Struga",
      "latitude": 41.1780,
      "longitude": 20.6778,
      "settlements": [
        { "name": "Struga City", "latitude": 41.1780, "longitude": 20.6778 },
        { "name": "Vraništa", "latitude": 41.2069, "longitude": 20.6258 },
        { "name": "Labuništa", "latitude": 41.2686, "longitude": 20.5956 },
        { "name": "Dolna Belica", "latitude": 41.2283, "longitude": 20.5881 }
      ]
    },
    {
      "name": "Gevgelija",
      "latitude": 41.1414,
      "longitude": 22.5025,
      "settlements": [
        { "name": "Gevgelija City", "latitude": 41.1414, "longitude": 22.5025 },
        { "name": "Mojin", "latitude": 41.1089, "longitude": 22.4567 },
        { "name": "Smokvica", "latitude": 41.1667, "longitude": 22.5417 },
        { "name": "Miravci", "latitude": 41.1069, "longitude": 22.5339 }
      ]
    },
    {
      "name": "Veles",
      "latitude": 41.7156,
      "longitude": 21.7756,
      "settlements": [
        { "name": "Veles City", "latitude": 41.7156, "longitude": 21.7756 },
        { "name": "Orašac", "latitude": 41.6789, "longitude": 21.7983 },
        { "name": "Crkvino", "latitude": 41.7489, "longitude": 21.7219 },
        { "name": "Gorno Orizari", "latitude": 41.6939, "longitude": 21.7367 }
      ]
    },
    {
      "name": "Strumica",
      "latitude": 41.4378,
      "longitude": 22.6428,
      "settlements": [
        { "name": "Strumica City", "latitude": 41.4378, "longitude": 22.6428 },
        { "name": "Veljusa", "latitude": 41.4803, "longitude": 22.5669 },
        { "name": "Vodoca", "latitude": 41.4539, "longitude": 22.5833 },
        { "name": "Banica", "latitude": 41.4069, "longitude": 22.5986 }
      ]
    },
    {
      "name": "Kavadarci",
      "latitude": 41.4331,
      "longitude": 22.0119,
      "settlements": [
        { "name": "Kavadarci City", "latitude": 41.4331, "longitude": 22.0119 },
        { "name": "Vataša", "latitude": 41.4169, "longitude": 22.0189 },
        { "name": "Garnikovo", "latitude": 41.3889, "longitude": 22.0639 },
        { "name": "Dradnja", "latitude": 41.4681, "longitude": 22.0458 }
      ]
    },
    {
      "name": "Kočani",
      "latitude": 41.9167,
      "longitude": 22.4128,
      "settlements": [
        { "name": "Kočani City", "latitude": 41.9167, "longitude": 22.4128 },
        { "name": "Nivičani", "latitude": 41.9589, "longitude": 22.4567 },
        { "name": "Orizari", "latitude": 41.9228, "longitude": 22.4467 },
        { "name": "Dolni Podlog", "latitude": 41.8833, "longitude": 22.3667 }
      ]
    },
    {
      "name": "Kriva Palanka",
      "latitude": 42.2019,
      "longitude": 22.3317,
      "settlements": [
        { "name": "Kriva Palanka City", "latitude": 42.2019, "longitude": 22.3317 },
        { "name": "Konjuh", "latitude": 42.1667, "longitude": 22.2833 },
        { "name": "Lipkovo", "latitude": 42.1564, "longitude": 22.2569 },
        { "name": "Ržanovo", "latitude": 42.1842, "longitude": 22.2958 }
      ]
    },
    {
      "name": "Radoviš",
      "latitude": 41.6383,
      "longitude": 22.4647,
      "settlements": [
        { "name": "Radoviš City", "latitude": 41.6383, "longitude": 22.4647 },
        { "name": "Podareš", "latitude": 41.6139, "longitude": 22.5417 },
        { "name": "Injevo", "latitude": 41.6681, "longitude": 22.4889 },
        { "name": "Yakimovo", "latitude": 41.6583, "longitude": 22.4236 }
      ]
    },
    {
      "name": "Resen",
      "latitude": 41.0889,
      "longitude": 21.0122,
      "settlements": [
        { "name": "Resen City", "latitude": 41.0889, "longitude": 21.0122 },
        { "name": "Jankovec", "latitude": 41.0569, "longitude": 21.0789 },
        { "name": "Krani", "latitude": 41.0458, "longitude": 21.0236 },
        { "name": "Evla", "latitude": 41.1239, "longitude": 21.0683 },
        { "name": "Asamati", "latitude": 41.0667, "longitude": 21.0833 }
      ]
    },
    {
      "name": "Debar",
      "latitude": 41.5250,
      "longitude": 20.5272,
      "settlements": [
        { "name": "Debar City", "latitude": 41.5250, "longitude": 20.5272 },
        { "name": "Banci", "latitude": 41.5931, "longitude": 20.5903 },
        { "name": "Žirovnica", "latitude": 41.5689, "longitude": 20.5639 },
        { "name": "Mogorce", "latitude": 41.5069, "longitude": 20.5439 }
      ]
    },
    {
      "name": "Vinica",
      "latitude": 41.8828,
      "longitude": 22.5092,
      "settlements": [
        { "name": "Vinica City", "latitude": 41.8828, "longitude": 22.5092 },
        { "name": "Blatec", "latitude": 41.8367, "longitude": 22.5792 },
        { "name": "Gradec", "latitude": 41.8569, "longitude": 22.4567 },
        { "name": "Istibanja", "latitude": 41.9139, "longitude": 22.5458 }
      ]
    },
    {
      "name": "Delčevo",
      "latitude": 41.9653,
      "longitude": 22.7742,
      "settlements": [
        { "name": "Delčevo City", "latitude": 41.9653, "longitude": 22.7742 },
        { "name": "Razlovci", "latitude": 41.9889, "longitude": 22.8236 },
        { "name": "Bigla", "latitude": 41.9289, "longitude": 22.8114 },
        { "name": "Trabotivište", "latitude": 41.9439, "longitude": 22.7569 }
      ]
    },
    {
      "name": "Probištip",
      "latitude": 42.0031,
      "longitude": 22.1786,
      "settlements": [
        { "name": "Probištip City", "latitude": 42.0031, "longitude": 22.1786 },
        { "name": "Zletovo", "latitude": 41.9886, "longitude": 22.2361 },
        { "name": "Lešok", "latitude": 42.0558, "longitude": 22.1458 },
        { "name": "Tursko Rudari", "latitude": 42.0369, "longitude": 22.2014 }
      ]
    },
    {
      "name": "Berovo",
      "latitude": 41.7061,
      "longitude": 22.8578,
      "settlements": [
        { "name": "Berovo City", "latitude": 41.7061, "longitude": 22.8578 },
        { "name": "Mitrašinci", "latitude": 41.6739, "longitude": 22.8236 },
        { "name": "Rusinovo", "latitude": 41.6889, "longitude": 22.9114 },
        { "name": "Dvorište", "latitude": 41.7439, "longitude": 22.8903 }
      ]
    },
    {
      "name": "Makedonski Brod",
      "latitude": 41.5136,
      "longitude": 21.2153,
      "settlements": [
        { "name": "Makedonski Brod City", "latitude": 41.5136, "longitude": 21.2153 },
        { "name": "Samokov", "latitude": 41.6833, "longitude": 21.1431 },
        { "name": "Trebeno", "latitude": 41.5439, "longitude": 21.2567 },
        { "name": "Krapa", "latitude": 41.4889, "longitude": 21.1789 }
      ]
    },
    {
      "name": "Kratovo",
      "latitude": 42.0781,
      "longitude": 22.1806,
      "settlements": [
        { "name": "Kratovo City", "latitude": 42.0781, "longitude": 22.1806 },
        { "name": "Železnica", "latitude": 42.1139, "longitude": 22.2236 },
        { "name": "Emirica", "latitude": 42.0458, "longitude": 22.1569 },
        { "name": "Kuklica", "latitude": 42.0989, "longitude": 22.2458 }
      ]
    },
    {
      "name": "Demir Hisar",
      "latitude": 41.2208,
      "longitude": 21.2031,
      "settlements": [
        { "name": "Demir Hisar City", "latitude": 41.2208, "longitude": 21.2031 },
        { "name": "Sopotnica", "latitude": 41.2958, "longitude": 21.1569 },
        { "name": "Sutovo", "latitude": 41.2439, "longitude": 21.1789 },
        { "name": "Zlesti", "latitude": 41.2689, "longitude": 21.2236 }
      ]
    },
    {
      "name": "Kruševo",
      "latitude": 41.3689,
      "longitude": 21.2483,
      "settlements": [
        { "name": "Kruševo City", "latitude": 41.3689, "longitude": 21.2483 },
        { "name": "Aldanci", "latitude": 41.3439, "longitude": 21.3014 },
        { "name": "Pusta Kula", "latitude": 41.3989, "longitude": 21.2958 },
        { "name": "Prilepec", "latitude": 41.3458, "longitude": 21.1989 }
      ]
    }
  ],
  "Albania": [
    {
      "name": "Tirana",
      "latitude": 41.3275,
      "longitude": 19.8189,
      "settlements": [
        { "name": "Tirana City", "latitude": 41.3275, "longitude": 19.8189 },
        { "name": "Kamëz", "latitude": 41.3817, "longitude": 19.7603 },
        { "name": "Vaqarr", "latitude": 41.2978, "longitude": 19.8519 },
        { "name": "Dajt", "latitude": 41.3592, "longitude": 19.9236 },
        { "name": "Farkë", "latitude": 41.3119, "longitude": 19.8219 },
        { "name": "Zall-Herr", "latitude": 41.2836, "longitude": 19.6658 }
      ]
    },
    {
      "name": "Durrës",
      "latitude": 41.3231,
      "longitude": 19.4414,
      "settlements": [
        { "name": "Durrës City", "latitude": 41.3231, "longitude": 19.4414 },
        { "name": "Shijak", "latitude": 41.3456, "longitude": 19.5672 },
        { "name": "Sukth", "latitude": 41.3808, "longitude": 19.5358 },
        { "name": "Manëz", "latitude": 41.4403, "longitude": 19.5892 },
        { "name": "Ishëm", "latitude": 41.5458, "longitude": 19.5986 }
      ]
    },
    {
      "name": "Vlorë",
      "latitude": 40.4667,
      "longitude": 19.4897,
      "settlements": [
        { "name": "Vlorë City", "latitude": 40.4667, "longitude": 19.4897 },
        { "name": "Orikum", "latitude": 40.3258, "longitude": 19.4719 },
        { "name": "Himarë", "latitude": 40.1025, "longitude": 19.7444 },
        { "name": "Selenicë", "latitude": 40.5306, "longitude": 19.6358 },
        { "name": "Novoselë", "latitude": 40.5389, "longitude": 19.4289 }
      ]
    },
    {
      "name": "Shkodër",
      "latitude": 42.0683,
      "longitude": 19.5126,
      "settlements": [
        { "name": "Shkodër City", "latitude": 42.0683, "longitude": 19.5126 },
        { "name": "Vau i Dejës", "latitude": 42.0000, "longitude": 19.6247 },
        { "name": "Ana e Malit", "latitude": 42.1189, "longitude": 19.5569 },
        { "name": "Dajç", "latitude": 42.0978, "longitude": 19.4567 },
        { "name": "Gur i Zi", "latitude": 42.0322, "longitude": 19.4839 }
      ]
    },
    {
      "name": "Sarandë",
      "latitude": 39.8756,
      "longitude": 20.0056,
      "settlements": [
        { "name": "Sarandë City", "latitude": 39.8756, "longitude": 20.0056 },
        { "name": "Ksamil", "latitude": 39.7689, "longitude": 19.9997 },
        { "name": "Butrint", "latitude": 39.7461, "longitude": 20.0206 },
        { "name": "Lukovë", "latitude": 39.9989, "longitude": 20.1069 },
        { "name": "Konispol", "latitude": 39.6589, "longitude": 20.1814 }
      ]
    },
    {
      "name": "Fier",
      "latitude": 40.7275,
      "longitude": 19.5628,
      "settlements": [
        { "name": "Fier City", "latitude": 40.7275, "longitude": 19.5628 },
        { "name": "Patos", "latitude": 40.6833, "longitude": 19.6194 },
        { "name": "Roskovec", "latitude": 40.7375, "longitude": 19.7022 },
        { "name": "Levan", "latitude": 40.6789, "longitude": 19.4889 },
        { "name": "Mbrostar", "latitude": 40.7167, "longitude": 19.5333 }
      ]
    },
    {
      "name": "Korçë",
      "latitude": 40.6141,
      "longitude": 20.7770,
      "settlements": [
        { "name": "Korçë City", "latitude": 40.6141, "longitude": 20.7770 },
        { "name": "Mborje", "latitude": 40.6000, "longitude": 20.8056 },
        { "name": "Drenovë", "latitude": 40.5519, "longitude": 20.7889 },
        { "name": "Voskop", "latitude": 40.6331, "longitude": 20.5889 },
        { "name": "Vithkuq", "latitude": 40.5239, "longitude": 20.5889 }
      ]
    },
    {
      "name": "Elbasan",
      "latitude": 41.1125,
      "longitude": 20.0822,
      "settlements": [
        { "name": "Elbasan City", "latitude": 41.1125, "longitude": 20.0822 },
        { "name": "Shirgjan", "latitude": 41.0683, "longitude": 20.0569 },
        { "name": "Labinot-Fushë", "latitude": 41.1519, "longitude": 20.1339 },
        { "name": "Funarë", "latitude": 41.1939, "longitude": 20.0667 },
        { "name": "Gjergjan", "latitude": 41.0333, "longitude": 20.0333 }
      ]
    },
    {
      "name": "Berat",
      "latitude": 40.7053,
      "longitude": 19.9522,
      "settlements": [
        { "name": "Berat City", "latitude": 40.7053, "longitude": 19.9522 },
        { "name": "Ura Vajgurore", "latitude": 40.7744, "longitude": 19.8778 },
        { "name": "Otllak", "latitude": 40.8083, "longitude": 19.8472 },
        { "name": "Roshnik", "latitude": 40.7239, "longitude": 20.0333 },
        { "name": "Velabisht", "latitude": 40.7014, "longitude": 19.9389 }
      ]
    },
    {
      "name": "Lushnjë",
      "latitude": 40.9419,
      "longitude": 19.7050,
      "settlements": [
        { "name": "Lushnjë City", "latitude": 40.9419, "longitude": 19.7050 },
        { "name": "Allkaj", "latitude": 40.9167, "longitude": 19.6833 },
        { "name": "Gradishtë", "latitude": 40.8958, "longitude": 19.5958 },
        { "name": "Karbunarë", "latitude": 40.9333, "longitude": 19.7667 },
        { "name": "Fier-Shegan", "latitude": 40.8667, "longitude": 19.5667 }
      ]
    },
    {
      "name": "Pogradec",
      "latitude": 40.9014,
      "longitude": 20.6550,
      "settlements": [
        { "name": "Pogradec City", "latitude": 40.9014, "longitude": 20.6550 },
        { "name": "Lin", "latitude": 40.9667, "longitude": 20.6333 },
        { "name": "Pojskë", "latitude": 40.9333, "longitude": 20.5833 },
        { "name": "Udënisht", "latitude": 40.9500, "longitude": 20.6833 },
        { "name": "Hudenisht", "latitude": 40.9167, "longitude": 20.7000 }
      ]
    },
    {
      "name": "Kukës",
      "latitude": 42.0833,
      "longitude": 20.4167,
      "settlements": [
        { "name": "Kukës City", "latitude": 42.0833, "longitude": 20.4167 },
        { "name": "Tërthorë", "latitude": 42.0333, "longitude": 20.3333 },
        { "name": "Bicaj", "latitude": 41.9667, "longitude": 20.4667 },
        { "name": "Arrën", "latitude": 42.0333, "longitude": 20.5000 },
        { "name": "Shishtavec", "latitude": 41.9667, "longitude": 20.5667 }
      ]
    },
    {
      "name": "Lezhë",
      "latitude": 41.7814,
      "longitude": 19.6436,
      "settlements": [
        { "name": "Lezhë City", "latitude": 41.7814, "longitude": 19.6436 },
        { "name": "Shëngjin", "latitude": 41.8136, "longitude": 19.5939 },
        { "name": "Balldren", "latitude": 41.8239, "longitude": 19.6236 },
        { "name": "Kallmet", "latitude": 41.8333, "longitude": 19.7167 },
        { "name": "Zejmen", "latitude": 41.6667, "longitude": 19.6667 }
      ]
    },
    {
      "name": "Përmet",
      "latitude": 40.2336,
      "longitude": 20.3517,
      "settlements": [
        { "name": "Përmet City", "latitude": 40.2336, "longitude": 20.3517 },
        { "name": "Këlcyrë", "latitude": 40.3131, "longitude": 20.1892 },
        { "name": "Petran", "latitude": 40.2167, "longitude": 20.3333 },
        { "name": "Çarshovë", "latitude": 40.2333, "longitude": 20.2333 },
        { "name": "Frashër", "latitude": 40.3667, "longitude": 20.4333 }
      ]
    },
    {
      "name": "Librazhd",
      "latitude": 41.1969,
      "longitude": 20.3356,
      "settlements": [
        { "name": "Librazhd City", "latitude": 41.1969, "longitude": 20.3356 },
        { "name": "Përrenjas", "latitude": 41.0667, "longitude": 20.5333 },
        { "name": "Lunik", "latitude": 41.1833, "longitude": 20.3000 },
        { "name": "Steblevë", "latitude": 41.2333, "longitude": 20.3833 },
        { "name": "Qendër", "latitude": 41.1500, "longitude": 20.2667 }
      ]
    },
    {
      "name": "Fushë-Krujë",
      "latitude": 41.4783,
      "longitude": 19.7178,
      "settlements": [
        { "name": "Fushë-Krujë City", "latitude": 41.4783, "longitude": 19.7178 },
        { "name": "Mamurras", "latitude": 41.5775, "longitude": 19.6922 },
        { "name": "Milot", "latitude": 41.6839, "longitude": 19.7156 },
        { "name": "Krujë", "latitude": 41.5075, "longitude": 19.7928 },
        { "name": "Nikël", "latitude": 41.4939, "longitude": 19.7833 }
      ]
    },
    {
      "name": "Këlcyrë",
      "latitude": 40.3131,
      "longitude": 20.1892,
      "settlements": [
        { "name": "Këlcyrë City", "latitude": 40.3131, "longitude": 20.1892 },
        { "name": "Sukë", "latitude": 40.3667, "longitude": 20.1000 },
        { "name": "Dishnicë", "latitude": 40.2833, "longitude": 20.2333 },
        { "name": "Ballaban", "latitude": 40.3333, "longitude": 20.1667 },
        { "name": "Qesarat", "latitude": 40.3000, "longitude": 20.1333 }
      ]
    },
    {
      "name": "Maliq",
      "latitude": 40.7108,
      "longitude": 20.6994,
      "settlements": [
        { "name": "Maliq City", "latitude": 40.7108, "longitude": 20.6994 },
        { "name": "Goranx", "latitude": 40.7333, "longitude": 20.7833 },
        { "name": "Vreshtaz", "latitude": 40.6833, "longitude": 20.6500 },
        { "name": "Pirg", "latitude": 40.7500, "longitude": 20.7167 },
        { "name": "Kreshpanj", "latitude": 40.6667, "longitude": 20.7333 }
      ]
    },
    {
      "name": "Ballsh",
      "latitude": 40.6000,
      "longitude": 19.7333,
      "settlements": [
        { "name": "Ballsh City", "latitude": 40.6000, "longitude": 19.7333 },
        { "name": "Kosovë", "latitude": 40.6167, "longitude": 19.6667 },
        { "name": "Kukës", "latitude": 40.5833, "longitude": 19.8000 },
        { "name": "Hebal", "latitude": 40.6500, "longitude": 19.7167 },
        { "name": "Fier-Shegan", "latitude": 40.6333, "longitude": 19.6833 }
      ]
    }
  ],
  "Montenegro": [
    {
      "name": "Podgorica",
      "latitude": 42.4410,
      "longitude": 19.2627,
      "settlements": [
        { "name": "Podgorica City", "latitude": 42.4410, "longitude": 19.2627 },
        { "name": "Tuzi", "latitude": 42.3656, "longitude": 19.3314 },
        { "name": "Golubovci", "latitude": 42.3350, "longitude": 19.2319 },
        { "name": "Mojanovići", "latitude": 42.3833, "longitude": 19.2667 },
        { "name": "Donja Gorica", "latitude": 42.4333, "longitude": 19.2167 },
        { "name": "Stijena", "latitude": 42.4000, "longitude": 19.1833 }
      ]
    },
    {
      "name": "Nikšić",
      "latitude": 42.7730,
      "longitude": 18.9444,
      "settlements": [
        { "name": "Nikšić City", "latitude": 42.7730, "longitude": 18.9444 },
        { "name": "Slavogostići", "latitude": 42.7333, "longitude": 18.8833 },
        { "name": "Ošlje", "latitude": 42.8000, "longitude": 19.0000 },
        { "name": "Vukovići", "latitude": 42.7500, "longitude": 18.9667 },
        { "name": "Krupac", "latitude": 42.7167, "longitude": 18.9167 }
      ]
    },
    {
      "name": "Herceg Novi",
      "latitude": 42.4531,
      "longitude": 18.5375,
      "settlements": [
        { "name": "Herceg Novi City", "latitude": 42.4531, "longitude": 18.5375 },
        { "name": "Igalo", "latitude": 42.4589, "longitude": 18.5136 },
        { "name": "Meljine", "latitude": 42.4500, "longitude": 18.5500 },
        { "name": "Zelenika", "latitude": 42.4506, "longitude": 18.5686 },
        { "name": "Kumbor", "latitude": 42.4278, "longitude": 18.5764 }
      ]
    },
    {
      "name": "Budva",
      "latitude": 42.2881,
      "longitude": 18.8423,
      "settlements": [
        { "name": "Budva City", "latitude": 42.2881, "longitude": 18.8423 },
        { "name": "Becici", "latitude": 42.2833, "longitude": 18.8667 },
        { "name": "Petrovac", "latitude": 42.2056, "longitude": 18.9425 },
        { "name": "Sveti Stefan", "latitude": 42.2561, "longitude": 18.8917 },
        { "name": "Pržno", "latitude": 42.2667, "longitude": 18.8833 }
      ]
    },
    {
      "name": "Kotor",
      "latitude": 42.4247,
      "longitude": 18.7712,
      "settlements": [
        { "name": "Kotor City", "latitude": 42.4247, "longitude": 18.7712 },
        { "name": "Perast", "latitude": 42.4864, "longitude": 18.6964 },
        { "name": "Dobrota", "latitude": 42.4542, "longitude": 18.7681 },
        { "name": "Muo", "latitude": 42.4333, "longitude": 18.7500 },
        { "name": "Prčanj", "latitude": 42.4575, "longitude": 18.7417 }
      ]
    },
    {
      "name": "Bar",
      "latitude": 42.0930,
      "longitude": 19.1003,
      "settlements": [
        { "name": "Bar City", "latitude": 42.0930, "longitude": 19.1003 },
        { "name": "Sutomore", "latitude": 42.1428, "longitude": 19.0467 },
        { "name": "Šušanj", "latitude": 42.1158, "longitude": 19.0883 },
        { "name": "Čeluga", "latitude": 42.1333, "longitude": 19.1167 },
        { "name": "Stari Bar", "latitude": 42.0917, "longitude": 19.1361 }
      ]
    },
    {
      "name": "Cetinje",
      "latitude": 42.3889,
      "longitude": 18.9142,
      "settlements": [
        { "name": "Cetinje City", "latitude": 42.3889, "longitude": 18.9142 },
        { "name": "Rijeka Crnojevića", "latitude": 42.3556, "longitude": 18.8250 },
        { "name": "Bajice", "latitude": 42.3667, "longitude": 18.9167 },
        { "name": "Grab", "latitude": 42.4000, "longitude": 18.9500 },
        { "name": "Ljubotinj", "latitude": 42.4167, "longitude": 18.8833 }
      ]
    },
    {
      "name": "Ulcinj",
      "latitude": 41.9236,
      "longitude": 19.2056,
      "settlements": [
        { "name": "Ulcinj City", "latitude": 41.9236, "longitude": 19.2056 },
        { "name": "Ada Bojana", "latitude": 41.8556, "longitude": 19.3000 },
        { "name": "Velika Plaža", "latitude": 41.9000, "longitude": 19.2667 },
        { "name": "Šas", "latitude": 41.9500, "longitude": 19.3000 },
        { "name": "Kodre", "latitude": 41.9333, "longitude": 19.2167 }
      ]
    },
    {
      "name": "Tivat",
      "latitude": 42.4289,
      "longitude": 18.6961,
      "settlements": [
        { "name": "Tivat City", "latitude": 42.4289, "longitude": 18.6961 },
        { "name": "Krtoli", "latitude": 42.4000, "longitude": 18.7333 },
        { "name": "Radovići", "latitude": 42.4500, "longitude": 18.7167 },
        { "name": "Gošići", "latitude": 42.4167, "longitude": 18.6833 },
        { "name": "Lastva", "latitude": 42.4333, "longitude": 18.6667 }
      ]
    },
    {
      "name": "Rožaje",
      "latitude": 42.8439,
      "longitude": 20.1678,
      "settlements": [
        { "name": "Rožaje City", "latitude": 42.8439, "longitude": 20.1678 },
        { "name": "Bać", "latitude": 42.8000, "longitude": 20.1333 },
        { "name": "Bandžov", "latitude": 42.8667, "longitude": 20.2000 },
        { "name": "Ibarac", "latitude": 42.8333, "longitude": 20.1500 },
        { "name": "Biševo", "latitude": 42.8500, "longitude": 20.1167 }
      ]
    },
    {
      "name": "Pljevlja",
      "latitude": 43.3567,
      "longitude": 19.3583,
      "settlements": [
        { "name": "Pljevlja City", "latitude": 43.3567, "longitude": 19.3583 },
        { "name": "Kotor", "latitude": 43.3333, "longitude": 19.4000 },
        { "name": "Jabuka", "latitude": 43.3833, "longitude": 19.3167 },
        { "name": "Boljanići", "latitude": 43.3167, "longitude": 19.3333 },
        { "name": "Donja Brvenica", "latitude": 43.3000, "longitude": 19.3667 }
      ]
    },
    {
      "name": "Bijelo Polje",
      "latitude": 43.0342,
      "longitude": 19.7492,
      "settlements": [
        { "name": "Bijelo Polje City", "latitude": 43.0342, "longitude": 19.7492 },
        { "name": "Gornja Rženica", "latitude": 43.0667, "longitude": 19.8000 },
        { "name": "Lozna", "latitude": 43.0000, "longitude": 19.7167 },
        { "name": "Rudnica", "latitude": 43.0500, "longitude": 19.6833 },
        { "name": "Sibnica", "latitude": 43.0167, "longitude": 19.7667 }
      ]
    },
    {
      "name": "Danilovgrad",
      "latitude": 42.5539,
      "longitude": 19.1058,
      "settlements": [
        { "name": "Danilovgrad City", "latitude": 42.5539, "longitude": 19.1058 },
        { "name": "Spuž", "latitude": 42.5150, "longitude": 19.1950 },
        { "name": "Maloši", "latitude": 42.5833, "longitude": 19.0667 },
        { "name": "Brajkovići", "latitude": 42.5333, "longitude": 19.1333 },
        { "name": "Grabovica", "latitude": 42.5667, "longitude": 19.1500 }
      ]
    },
    {
      "name": "Mojkovac",
      "latitude": 42.9600,
      "longitude": 19.5833,
      "settlements": [
        { "name": "Mojkovac City", "latitude": 42.9600, "longitude": 19.5833 },
        { "name": "Brusovo", "latitude": 42.9333, "longitude": 19.6167 },
        { "name": "Drešnjevo", "latitude": 42.9833, "longitude": 19.5667 }
      ]
    }
  ]
};
