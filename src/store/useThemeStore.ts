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
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    colors: {
      primary: '#ff2d55',    // Neon red
      secondary: '#ff6b35',  // Neon orange
      accent: '#ffd60a',     // Neon yellow
      background: '#0a0a0b', // Void black
      text: '#f5f0e8',       // Light cream
    },
  },
  {
    id: 'garden-dusk',
    name: 'Garden Dusk',
    colors: {
      primary: '#54577c',    // Dusty grape
      secondary: '#4a7b9d',  // Steel blue
      accent: '#ecffb0',     // Lime cream
      background: '#1a1c2e', // Deep purple-black
      text: '#faffd8',       // Cream
    },
  },
  {
    id: 'cyber-sunset',
    name: 'Cyber Sunset',
    colors: {
      primary: '#e040fb',    // Electric purple
      secondary: '#ff6e40',  // Coral
      accent: '#64ffda',     // Mint
      background: '#0d0221', // Deep purple
      text: '#e0e0e0',       // Silver
    },
  },
  {
    id: 'forest-glow',
    name: 'Forest Glow',
    colors: {
      primary: '#2e7d32',    // Forest green
      secondary: '#558b2f',  // Lime green
      accent: '#c6ff00',     // Electric lime
      background: '#0a120a', // Deep forest
      text: '#e8f5e9',       // Mint white
    },
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    colors: {
      primary: '#0288d1',    // Ocean blue
      secondary: '#00bcd4',  // Cyan
      accent: '#84ffff',     // Light cyan
      background: '#001e3c', // Deep ocean
      text: '#e3f2fd',       // Ice blue
    },
  },
  {
    id: 'blood-moon',
    name: 'Blood Moon',
    colors: {
      primary: '#b71c1c',    // Blood red
      secondary: '#d84315',  // Burnt orange
      accent: '#ffab00',     // Amber
      background: '#1a0a0a', // Dark crimson
      text: '#ffebee',       // Rose white
    },
  },
  {
    id: 'pop-pink',
    name: 'Pop Pink',
    colors: {
      primary: '#cdb4db',    // Thistle
      secondary: '#ffafcc',  // Baby pink
      accent: '#a2d2ff',     // Sky blue
      background: '#1a1520', // Dark purple-pink
      text: '#ffc8dd',       // Pastel petal
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    colors: {
      primary: '#f4a261',    // Sandy brown
      secondary: '#e76f51',  // Burnt sienna
      accent: '#e9c46a',     // Saffron
      background: '#1a1410', // Warm black
      text: '#fefae0',       // Cornsilk
    },
  },
  {
    id: 'arctic-aurora',
    name: 'Arctic Aurora',
    colors: {
      primary: '#48cae4',    // Sky cyan
      secondary: '#00b4d8',  // Pacific cyan
      accent: '#90e0ef',     // Light cyan
      background: '#03071e', // Rich black
      text: '#caf0f8',       // Light cyan white
    },
  },
  {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    colors: {
      primary: '#7b68ee',    // Medium slate blue
      secondary: '#9d4edd',  // Dark orchid
      accent: '#c8b6ff',     // Periwinkle
      background: '#10002b', // Dark purple
      text: '#e0aaff',       // Mauve
    },
  },
  {
    id: 'toxic-waste',
    name: 'Toxic Waste',
    colors: {
      primary: '#39ff14',    // Neon green
      secondary: '#00ff41',  // Matrix green
      accent: '#ccff00',     // Electric lime
      background: '#0a0f0a', // Dark green black
      text: '#d4ffc4',       // Light lime
    },
  },
  {
    id: 'sakura-bloom',
    name: 'Sakura Bloom',
    colors: {
      primary: '#ff85a1',    // Pink
      secondary: '#ff5c8a',  // Hot pink
      accent: '#ffc2d1',     // Light pink
      background: '#1a0f14', // Dark rose
      text: '#ffe5ec',       // Lavender blush
    },
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    colors: {
      primary: '#ffd700',    // Gold
      secondary: '#daa520',  // Goldenrod
      accent: '#f0e68c',     // Khaki
      background: '#0d0d0d', // Near black
      text: '#fffacd',       // Lemon chiffon
    },
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    colors: {
      primary: '#ff71ce',    // Hot pink
      secondary: '#01cdfe',  // Cyan
      accent: '#05ffa1',     // Spring green
      background: '#1a0a2e', // Dark indigo
      text: '#b967ff',       // Light purple
    },
  },
  {
    id: 'rust-metal',
    name: 'Rust & Metal',
    colors: {
      primary: '#a0522d',    // Sienna
      secondary: '#cd853f',  // Peru
      accent: '#d2691e',     // Chocolate
      background: '#1c1410', // Dark brown
      text: '#f5deb3',       // Wheat
    },
  },
  // New themes
  {
    id: 'tuscan-sunset',
    name: 'Tuscan Sunset',
    colors: {
      primary: '#f08a4b',    // Tangerine Dream
      secondary: '#f2a541',  // Golden Orange
      accent: '#f3ca40',     // Tuscan Sun
      background: '#577590', // Blue Slate (darkened for bg)
      text: '#d78a76',       // Sweet Salmon
    },
  },
  {
    id: 'cherry-garden',
    name: 'Cherry Garden',
    colors: {
      primary: '#e34a6f',    // Magenta Bloom
      secondary: '#60a561',  // Sage Green
      accent: '#f7b2bd',     // Cherry Blossom
      background: '#053225', // Evergreen
      text: '#b2a198',       // Khaki Beige
    },
  },
  {
    id: 'coastal-heat',
    name: 'Coastal Heat',
    colors: {
      primary: '#d63230',    // Tomato Jam
      secondary: '#39a9db',  // Fresh Sky
      accent: '#40bcd8',     // Sky Surge
      background: '#1c77c3', // Twitter Blue (darkened)
      text: '#f39237',       // Carrot Orange
    },
  },
  {
    id: 'tropical-ember',
    name: 'Tropical Ember',
    colors: {
      primary: '#ef3e36',    // Cinnabar
      secondary: '#17bebb',  // Tropical Teal
      accent: '#edb88b',     // Sandy Clay
      background: '#2e282a', // Shadow Grey
      text: '#fad8d6',       // Soft Blush
    },
  },
  {
    id: 'moss-stone',
    name: 'Moss & Stone',
    colors: {
      primary: '#8c6057',    // Smoky Rose
      secondary: '#a69f98',  // Silver
      accent: '#afd5aa',     // Celadon
      background: '#5c5346', // Stone Brown
      text: '#f0f2ef',       // White Smoke
    },
  },
  {
    id: 'mahogany-orchid',
    name: 'Mahogany Orchid',
    colors: {
      primary: '#983628',    // Chestnut
      secondary: '#581908',  // Dark Walnut
      accent: '#e2aedd',     // Plum
      background: '#2e0e02', // Rich Mahogany
      text: '#ebcbf4',       // Thistle
    },
  },
  {
    id: 'neon-coral',
    name: 'Neon Coral',
    colors: {
      primary: '#e63462',    // Magenta Bloom
      secondary: '#fe5f55',  // Vibrant Coral
      accent: '#c7efcf',     // Tea Green
      background: '#333745', // Jet Black
      text: '#eef5db',       // Beige
    },
  },
  {
    id: 'midnight-sky',
    name: 'Midnight Sky',
    colors: {
      primary: '#5db7de',    // Sky Surge
      secondary: '#716a5c',  // Dim Grey
      accent: '#f1e9db',     // Soft Linen
      background: '#07020d', // Black
      text: '#a39b8b',       // Khaki Beige
    },
  },
  {
    id: 'dusty-rose',
    name: 'Dusty Rose',
    colors: {
      primary: '#cea0ae',    // Old Rose
      secondary: '#684551',  // Mauve Shadow
      accent: '#9cd08f',     // Willow Green
      background: '#402e2a', // Deep Mocha
      text: '#d5b0ac',       // Cotton Rose
    },
  },
  {
    id: 'ember-ash',
    name: 'Ember & Ash',
    colors: {
      primary: '#b80c09',    // Brick Ember
      secondary: '#6b2b06',  // Dark Walnut
      accent: '#e5e7e6',     // Alabaster Grey
      background: '#141301', // Pitch Black
      text: '#b7b5b3',       // Silver
    },
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Emerald',
    colors: {
      primary: '#2cda9d',    // Emerald
      secondary: '#3e8989',  // Dark Cyan
      accent: '#05f140',     // Electric Green
      background: '#1a181b', // Shadow Grey
      text: '#564d65',       // Vintage Grape
    },
  },
  {
    id: 'pastel-bloom',
    name: 'Pastel Bloom',
    colors: {
      primary: '#ffb7c3',    // Cherry Blossom
      secondary: '#eec6ca',  // Cotton Rose
      accent: '#bcf4de',     // Icy Aqua
      background: '#ded6d1', // Dust Grey
      text: '#1a181b',       // Dark text for light bg
    },
  },
  {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    colors: {
      primary: '#279af1',    // Blue Bell
      secondary: '#60656f',  // Dim Grey
      accent: '#f7f7ff',     // Ghost White
      background: '#131112', // Onyx
      text: '#c49991',       // Rosy Taupe
    },
  },
  {
    id: 'urban-mustard',
    name: 'Urban Mustard',
    colors: {
      primary: '#009fb7',    // Pacific Blue
      secondary: '#696773',  // Dim Grey
      accent: '#fed766',     // Mustard
      background: '#272727', // Shadow Grey
      text: '#eff1f3',       // Platinum
    },
  },
  {
    id: 'neon-violet',
    name: 'Neon Violet',
    colors: {
      primary: '#e952de',    // Cotton Bloom
      secondary: '#ffa0fd',  // Violet
      accent: '#c2d076',     // Golden Sand
      background: '#001514', // Ink Black
      text: '#ffe1ea',       // Petal Frost
    },
  },
  {
    id: 'raspberry-teal',
    name: 'Raspberry Teal',
    colors: {
      primary: '#d81159',    // Raspberry Red
      secondary: '#8f2d56',  // Vintage Berry
      accent: '#fbb13c',     // Honey Bronze
      background: '#218380', // Teal
      text: '#73d2de',       // Frosted Blue
    },
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    colors: {
      primary: '#663f46',    // Mauve Shadow
      secondary: '#b8c4bb',  // Ash Grey
      accent: '#c9d6ea',     // Pale Sky
      background: '#3c362a', // Taupe
      text: '#e8f7ee',       // Honeydew
    },
  },
  {
    id: 'flame-metal',
    name: 'Flame & Metal',
    colors: {
      primary: '#f06543',    // Tomato
      secondary: '#f09d51',  // Sandy Brown
      accent: '#e0dfd5',     // Soft Linen
      background: '#313638', // Gunmetal
      text: '#e8e9eb',       // Platinum
    },
  },
  {
    id: 'candy-pastel',
    name: 'Candy Pastel',
    colors: {
      primary: '#a0ced9',    // Light Blue
      secondary: '#adf7b6',  // Celadon
      accent: '#ffee93',     // Light Gold
      background: '#fcf5c7', // Lemon Chiffon
      text: '#313638',       // Dark text for light bg
    },
  },
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    colors: {
      primary: '#f95738',    // Tomato
      secondary: '#ee964b',  // Sandy Brown
      accent: '#f4d35e',     // Royal Gold
      background: '#0d3b66', // Regal Navy
      text: '#faf0ca',       // Lemon Chiffon
    },
  },
  {
    id: 'pure-orange',
    name: 'Pure Orange',
    colors: {
      primary: '#fca311',    // Orange
      secondary: '#14213d',  // Prussian Blue
      accent: '#e5e5e5',     // Alabaster Grey
      background: '#000000', // Black
      text: '#ffffff',       // White
    },
  },
  {
    id: 'ocean-pumpkin',
    name: 'Ocean Pumpkin',
    colors: {
      primary: '#ea7317',    // Pumpkin Spice
      secondary: '#3da5d9',  // Fresh Sky
      accent: '#fec601',     // School Bus Yellow
      background: '#2364aa', // Ocean Deep
      text: '#73bfb8',       // Tropical Teal
    },
  },
  {
    id: 'scarlet-yale',
    name: 'Scarlet Yale',
    colors: {
      primary: '#db222a',    // Primary Scarlet
      secondary: '#a31621',  // Ruby Red
      accent: '#bfdbf7',     // Pale Sky
      background: '#053c5e', // Yale Blue
      text: '#1f7a8c',       // Teal
    },
  },
  {
    id: 'rose-wine',
    name: 'Rose Wine',
    colors: {
      primary: '#c94277',    // Rose Wine
      secondary: '#94524a',  // Terracotta Clay
      accent: '#cadbc0',     // Tea Green
      background: '#2f0a28', // Midnight Violet
      text: '#a27e6f',       // Dusty Taupe
    },
  },
  {
    id: 'canary-mono',
    name: 'Canary Mono',
    colors: {
      primary: '#fcfc62',    // Canary Yellow
      secondary: '#a3a3a3',  // Silver
      accent: '#feffea',     // Ivory
      background: '#424242', // Gunmetal
      text: '#c9c9c9',       // Silver
    },
  },
  {
    id: 'cerulean-wheat',
    name: 'Cerulean Wheat',
    colors: {
      primary: '#2dc7ff',    // Sky Aqua
      secondary: '#00abe7',  // Fresh Sky
      accent: '#eaba6b',     // Sunlit Clay
      background: '#0081af', // Cerulean
      text: '#ead2ac',       // Wheat
    },
  },
  {
    id: 'steel-peach',
    name: 'Steel & Peach',
    colors: {
      primary: '#3581b8',    // Steel Blue
      secondary: '#dee2d6',  // Soft Linen
      accent: '#fcb07e',     // Sandy Brown
      background: '#ebe9e9', // Alabaster Grey
      text: '#313638',       // Dark text
    },
  },
  {
    id: 'coral-glaucous',
    name: 'Coral Glaucous',
    colors: {
      primary: '#fe5f55',    // Vibrant Coral
      secondary: '#777da7',  // Glaucous
      accent: '#c6ecae',     // Tea Green
      background: '#885053', // Smoky Rose
      text: '#94c9a9',       // Muted Teal
    },
  },
  {
    id: 'autumn-ember',
    name: 'Autumn Ember',
    colors: {
      primary: '#ffa552',    // Sandy Brown
      secondary: '#ba5624',  // Autumn Ember
      accent: '#c4d6b0',     // Tea Green
      background: '#381d2a', // Midnight Violet
      text: '#fcde9c',       // Soft Peach
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
      currentTheme: themes[1], // Default to Garden Dusk (current palette)

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
        
        // Helper to mix colors with black (darken)
        const darken = (hex: string, amount: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const nr = Math.round(r * amount);
          const ng = Math.round(g * amount);
          const nb = Math.round(b * amount);
          return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
        };
        
        // Helper to mix colors with white (lighten)
        const lighten = (hex: string, amount: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const nr = Math.round(r + (255 - r) * (1 - amount));
          const ng = Math.round(g + (255 - g) * (1 - amount));
          const nb = Math.round(b + (255 - b) * (1 - amount));
          return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
        };
        
        // Update Tailwind CSS variables directly
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
        // Apply theme after rehydration
        if (state) {
          setTimeout(() => state.applyTheme(), 0);
        }
      },
    }
  )
);
