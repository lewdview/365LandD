import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;    // Main accent (dark mood)
    secondary: string;  // Secondary accent
    accent: string;     // Highlight accent (light mood)
    background: string; // Dark background
    text: string;       // Light text
  };
}

// Theme presets
export const themes: Theme[] = [
  // Original 44 Themes
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    colors: {
      primary: '#ff2d55',
      secondary: '#ff6b35',
      accent: '#ffd60a',
      background: '#0a0a0b',
      text: '#f5f0e8',
    },
  },
  {
    id: 'garden-dusk',
    name: 'Garden Dusk',
    colors: {
      primary: '#54577c',
      secondary: '#4a7b9d',
      accent: '#ecffb0',
      background: '#1a1c2e',
      text: '#faffd8',
    },
  },
  {
    id: 'cyber-sunset',
    name: 'Cyber Sunset',
    colors: {
      primary: '#e040fb',
      secondary: '#ff6e40',
      accent: '#64ffda',
      background: '#0d0221',
      text: '#e0e0e0',
    },
  },
  {
    id: 'forest-glow',
    name: 'Forest Glow',
    colors: {
      primary: '#2e7d32',
      secondary: '#558b2f',
      accent: '#c6ff00',
      background: '#0a120a',
      text: '#e8f5e9',
    },
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    colors: {
      primary: '#0288d1',
      secondary: '#00bcd4',
      accent: '#84ffff',
      background: '#001e3c',
      text: '#e3f2fd',
    },
  },
  {
    id: 'blood-moon',
    name: 'Blood Moon',
    colors: {
      primary: '#b71c1c',
      secondary: '#d84315',
      accent: '#ffab00',
      background: '#1a0a0a',
      text: '#ffebee',
    },
  },
    {
    id: 'pop-pink',
    name: 'Pop Pink',
    colors: {
      primary: '#cdb4db',
      secondary: '#ffafcc',
      accent: '#a2d2ff',
      background: '#1a1520',
      text: '#ffc8dd',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    colors: {
      primary: '#f4a261',
      secondary: '#e76f51',
      accent: '#e9c46a',
      background: '#1a1410',
      text: '#fefae0',
    },
  },
  {
    id: 'arctic-aurora',
    name: 'Arctic Aurora',
    colors: {
      primary: '#48cae4',
      secondary: '#00b4d8',
      accent: '#90e0ef',
      background: '#03071e',
      text: '#caf0f8',
    },
  },
  {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    colors: {
      primary: '#7b68ee',
      secondary: '#9d4edd',
      accent: '#c8b6ff',
      background: '#10002b',
      text: '#e0aaff',
    },
  },
  {
    id: 'toxic-waste',
    name: 'Toxic Waste',
    colors: {
      primary: '#39ff14',
      secondary: '#00ff41',
      accent: '#ccff00',
      background: '#0a0f0a',
      text: '#d4ffc4',
    },
  },
  {
    id: 'sakura-bloom',
    name: 'Sakura Bloom',
    colors: {
      primary: '#ff85a1',
      secondary: '#ff5c8a',
      accent: '#ffc2d1',
      background: '#1a0f14',
      text: '#ffe5ec',
    },
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    colors: {
      primary: '#ffd700',
      secondary: '#daa520',
      accent: '#f0e68c',
      background: '#0d0d0d',
      text: '#fffacd',
    },
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    colors: {
      primary: '#ff71ce',
      secondary: '#01cdfe',
      accent: '#05ffa1',
      background: '#1a0a2e',
      text: '#b967ff',
    },
  },
  {
    id: 'rust-metal',
    name: 'Rust & Metal',
    colors: {
      primary: '#a0522d',
      secondary: '#cd853f',
      accent: '#d2691e',
      background: '#1c1410',
      text: '#f5deb3',
    },
  },
  {
    id: 'tuscan-sunset',
    name: 'Tuscan Sunset',
    colors: {
      primary: '#f08a4b',
      secondary: '#f2a541',
      accent: '#f3ca40',
      background: '#577590',
      text: '#d78a76',
    },
  },
  {
    id: 'cherry-garden',
    name: 'Cherry Garden',
    colors: {
      primary: '#e34a6f',
      secondary: '#60a561',
      accent: '#f7b2bd',
      background: '#053225',
      text: '#b2a198',
    },
  },
  {
    id: 'coastal-heat',
    name: 'Coastal Heat',
    colors: {
      primary: '#d63230',
      secondary: '#39a9db',
      accent: '#40bcd8',
      background: '#1c77c3',
      text: '#f39237',
    },
  },
  {
    id: 'tropical-ember',
    name: 'Tropical Ember',
    colors: {
      primary: '#ef3e36',
      secondary: '#17bebb',
      accent: '#edb88b',
      background: '#2e282a',
      text: '#fad8d6',
    },
  },
  {
    id: 'moss-stone',
    name: 'Moss & Stone',
    colors: {
      primary: '#8c6057',
      secondary: '#a69f98',
      accent: '#afd5aa',
      background: '#5c5346',
      text: '#f0f2ef',
    },
  },
  {
    id: 'mahogany-orchid',
    name: 'Mahogany Orchid',
    colors: {
      primary: '#983628',
      secondary: '#581908',
      accent: '#e2aedd',
      background: '#2e0e02',
      text: '#ebcbf4',
    },
  },
  {
    id: 'neon-coral',
    name: 'Neon Coral',
    colors: {
      primary: '#e63462',
      secondary: '#fe5f55',
      accent: '#c7efcf',
      background: '#333745',
      text: '#eef5db',
    },
  },
  {
    id: 'midnight-sky',
    name: 'Midnight Sky',
    colors: {
      primary: '#5db7de',
      secondary: '#716a5c',
      accent: '#f1e9db',
      background: '#07020d',
      text: '#a39b8b',
    },
  },
  {
    id: 'dusty-rose',
    name: 'Dusty Rose',
    colors: {
      primary: '#cea0ae',
      secondary: '#684551',
      accent: '#9cd08f',
      background: '#402e2a',
      text: '#d5b0ac',
    },
  },
  {
    id: 'ember-ash',
    name: 'Ember & Ash',
    colors: {
      primary: '#b80c09',
      secondary: '#6b2b06',
      accent: '#e5e7e6',
      background: '#141301',
      text: '#b7b5b3',
    },
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Emerald',
    colors: {
      primary: '#2cda9d',
      secondary: '#3e8989',
      accent: '#05f140',
      background: '#1a181b',
      text: '#564d65',
    },
  },
  {
    id: 'pastel-bloom',
    name: 'Pastel Bloom',
    colors: {
      primary: '#ffb7c3',
      secondary: '#eec6ca',
      accent: '#bcf4de',
      background: '#ded6d1',
      text: '#1a181b',
    },
  },
  {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    colors: {
      primary: '#279af1',
      secondary: '#60656f',
      accent: '#f7f7ff',
      background: '#131112',
      text: '#c49991',
    },
  },
  {
    id: 'urban-mustard',
    name: 'Urban Mustard',
    colors: {
      primary: '#009fb7',
      secondary: '#696773',
      accent: '#fed766',
      background: '#272727',
      text: '#eff1f3',
    },
  },
  {
    id: 'neon-violet',
    name: 'Neon Violet',
    colors: {
      primary: '#e952de',
      secondary: '#ffa0fd',
      accent: '#c2d076',
      background: '#001514',
      text: '#ffe1ea',
    },
  },
  {
    id: 'raspberry-teal',
    name: 'Raspberry Teal',
    colors: {
      primary: '#d81159',
      secondary: '#8f2d56',
      accent: '#fbb13c',
      background: '#218380',
      text: '#73d2de',
    },
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    colors: {
      primary: '#663f46',
      secondary: '#b8c4bb',
      accent: '#c9d6ea',
      background: '#3c362a',
      text: '#e8f7ee',
    },
  },
  {
    id: 'flame-metal',
    name: 'Flame & Metal',
    colors: {
      primary: '#f06543',
      secondary: '#f09d51',
      accent: '#e0dfd5',
      background: '#313638',
      text: '#e8e9eb',
    },
  },
  {
    id: 'candy-pastel',
    name: 'Candy Pastel',
    colors: {
      primary: '#a0ced9',
      secondary: '#adf7b6',
      accent: '#ffee93',
      background: '#fcf5c7',
      text: '#313638',
    },
  },
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    colors: {
      primary: '#f95738',
      secondary: '#ee964b',
      accent: '#f4d35e',
      background: '#0d3b66',
      text: '#faf0ca',
    },
  },
  {
    id: 'pure-orange',
    name: 'Pure Orange',
    colors: {
      primary: '#fca311',
      secondary: '#14213d',
      accent: '#e5e5e5',
      background: '#000000',
      text: '#ffffff',
    },
  },
  {
    id: 'ocean-pumpkin',
    name: 'Ocean Pumpkin',
    colors: {
      primary: '#ea7317',
      secondary: '#3da5d9',
      accent: '#fec601',
      background: '#2364aa',
      text: '#73bfb8',
    },
  },
  {
    id: 'scarlet-yale',
    name: 'Scarlet Yale',
    colors: {
      primary: '#db222a',
      secondary: '#a31621',
      accent: '#bfdbf7',
      background: '#053c5e',
      text: '#1f7a8c',
    },
  },
  {
    id: 'rose-wine',
    name: 'Rose Wine',
    colors: {
      primary: '#c94277',
      secondary: '#94524a',
      accent: '#cadbc0',
      background: '#2f0a28',
      text: '#a27e6f',
    },
  },
  {
    id: 'canary-mono',
    name: 'Canary Mono',
    colors: {
      primary: '#fcfc62',
      secondary: '#a3a3a3',
      accent: '#feffea',
      background: '#424242',
      text: '#c9c9c9',
    },
  },
  {
    id: 'cerulean-wheat',
    name: 'Cerulean Wheat',
    colors: {
      primary: '#2dc7ff',
      secondary: '#00abe7',
      accent: '#eaba6b',
      background: '#0081af',
      text: '#ead2ac',
    },
  },
  {
    id: 'steel-peach',
    name: 'Steel & Peach',
    colors: {
      primary: '#3581b8',
      secondary: '#dee2d6',
      accent: '#fcb07e',
      background: '#ebe9e9',
      text: '#313638',
    },
  },
  {
    id: 'coral-glaucous',
    name: 'Coral Glaucous',
    colors: {
      primary: '#fe5f55',
      secondary: '#777da7',
      accent: '#c6ecae',
      background: '#885053',
      text: '#94c9a9',
    },
  },
  {
    id: 'autumn-ember',
    name: 'Autumn Ember',
    colors: {
      primary: '#ffa552',
      secondary: '#ba5624',
      accent: '#c4d6b0',
      background: '#381d2a',
      text: '#fcde9c',
    },
  },

  // 8 New Themes
  {
    id: 'golden-amber',
    name: 'Golden Amber',
    colors: {
      primary: '#f5b82e', // Sunflower Gold
      secondary: '#f4ac32', // Honey Bronze
      accent: '#ffd131', // Bright Amber
      background: '#2a1d0a', // Dark Brown
      text: '#ffd289', // Apricot Cream
    },
  },
  {
    id: 'amethyst-sky',
    name: 'Amethyst Sky',
    colors: {
      primary: '#0cbaba', // Tropical Teal
      secondary: '#380036', // Dark Amethyst
      accent: '#01baef', // Bright Sky
      background: '#150811', // Coffee Bean
      text: '#e0f7fa', // Light Cyan
    },
  },
  {
    id: 'coral-grape',
    name: 'Coral Grape',
    colors: {
      primary: '#fc814a', // Coral Glow
      secondary: '#96939b', // Rosy Granite
      accent: '#fc814a', // Coral Glow
      background: '#564256', // Vintage Grape
      text: '#e8e8e8', // Alabaster Grey
    },
  },
  {
    id: 'earthenware',
    name: 'Earthenware',
    colors: {
      primary: '#d69f7e', // Light Bronze
      secondary: '#774936', // Clay Soil
      accent: '#f5d0c5', // Almond Silk
      background: '#050609', // Black
      text: '#f5d0c5', // Almond Silk
    },
  },
  {
    id: 'citrus-moss',
    name: 'Citrus Moss',
    colors: {
      primary: '#7cb518', // Lime Moss
      secondary: '#5c8001', // Forest Moss
      accent: '#f3de2c', // Golden Glow
      background: '#0f1a00', // Dark Green
      text: '#faffd8', // Cream
    },
  },
  {
    id: 'teal-coral',
    name: 'Teal Coral',
    colors: {
      primary: '#426a5a', // Deep Teal
      secondary: '#7fb685', // Muted Teal
      accent: '#ef6f6c', // Light Coral
      background: '#1e2a25', // Dark Teal
      text: '#f2c57c', // Apricot Cream
    },
  },
  {
    id: 'grapefruit-slate',
    name: 'Grapefruit Slate',
    colors: {
      primary: '#5b5f97', // Dusty Grape
      secondary: '#b8b8d1', // Pale Slate
      accent: '#ff6b6c', // Grapefruit Pink
      background: '#2b2d42', // Dark Slate Blue
      text: '#fffffb', // Porcelain
    },
  },
  {
    id: 'lavender-rose',
    name: 'Lavender Rose',
    colors: {
      primary: '#966b9d', // Vintage Lavender
      secondary: '#c98686', // Dusty Rose
      accent: '#f2b880', // Light Caramel
      background: '#3f3342', // Dark Lavender
      text: '#fff4ec', // Seashell
    },
  },
];

interface ThemeState {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: themes[0], // Default to Neon Nights

      setTheme: (themeId: string) => {
        const theme = themes.find((t) => t.id === themeId);
        if (theme) {
          set({ currentTheme: theme });
          get().applyTheme();
        }
      },

      applyTheme: () => {
        const { currentTheme } = get();
        const root = document.documentElement;
        const { primary, secondary, accent, background, text } = currentTheme.colors;
        
        const darken = (hex: string, amount: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const nr = Math.round(r * amount);
          const ng = Math.round(g * amount);
          const nb = Math.round(b * amount);
          return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
        };
        
        const lighten = (hex: string, amount: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const nr = Math.round(r + (255 - r) * (1 - amount));
          const ng = Math.round(g + (255 - g) * (1 - amount));
          const nb = Math.round(b + (255 - b) * (1 - amount));
          return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
        };
        
        root.style.setProperty('--color-neon-red', primary);
        root.style.setProperty('--color-neon-red-dark', darken(primary, 0.7));
        root.style.setProperty('--color-neon-red-matte', lighten(primary, 0.8));
        root.style.setProperty('--color-neon-yellow', accent);
        root.style.setProperty('--color-neon-yellow-dark', darken(accent, 0.8));
        root.style.setProperty('--color-neon-yellow-matte', lighten(accent, 0.9));
        root.style.setProperty('--color-neon-orange', secondary);
        root.style.setProperty('--color-void-black', background);
        root.style.setProperty('--color-void-gray', lighten(background, 0.9));
        root.style.setProperty('--color-void-lighter', lighten(background, 0.8));
        root.style.setProperty('--color-light-cream', text);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeout(() => state.applyTheme(), 0);
        }
      },
    }
  )
);
