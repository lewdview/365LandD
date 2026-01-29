// type: uploaded file
// fileName: src/store/useThemeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export type ThemeCategory = 'All' | 'Vibrant' | 'Dark' | 'Light' | 'Nature' | 'Pastel' | 'Monochrome';

export interface Theme {
  id: string;
  name: string;
  category: ThemeCategory;
  colors: ThemeColors;
}

// --- THEME DATABASE (100 Themes) ---
export const themes: Theme[] = [
  // --- 1. PRESETS (15) ---
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    category: 'Vibrant',
    colors: { primary: '#ff2d55', secondary: '#ff6b35', accent: '#ffd60a', background: '#0a0a0b', text: '#f5f0e8' },
  },
  {
    id: 'garden-dusk',
    name: 'Garden Dusk',
    category: 'Nature',
    colors: { primary: '#54577c', secondary: '#4a7b9d', accent: '#ecffb0', background: '#1a1c2e', text: '#faffd8' },
  },
  {
    id: 'cyber-sunset',
    name: 'Cyber Sunset',
    category: 'Vibrant',
    colors: { primary: '#e040fb', secondary: '#ff6e40', accent: '#64ffda', background: '#0d0221', text: '#e0e0e0' },
  },
  {
    id: 'forest-glow',
    name: 'Forest Glow',
    category: 'Nature',
    colors: { primary: '#2e7d32', secondary: '#558b2f', accent: '#c6ff00', background: '#0a120a', text: '#e8f5e9' },
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    category: 'Nature',
    colors: { primary: '#0288d1', secondary: '#00bcd4', accent: '#84ffff', background: '#001e3c', text: '#e3f2fd' },
  },
  {
    id: 'blood-moon',
    name: 'Blood Moon',
    category: 'Dark',
    colors: { primary: '#b71c1c', secondary: '#d84315', accent: '#ffab00', background: '#1a0a0a', text: '#ffebee' },
  },
  {
    id: 'pop-pink',
    name: 'Pop Pink',
    category: 'Pastel',
    colors: { primary: '#cdb4db', secondary: '#ffafcc', accent: '#a2d2ff', background: '#1a1520', text: '#ffc8dd' },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'Nature',
    colors: { primary: '#f4a261', secondary: '#e76f51', accent: '#e9c46a', background: '#1a1410', text: '#fefae0' },
  },
  {
    id: 'arctic-aurora',
    name: 'Arctic Aurora',
    category: 'Nature',
    colors: { primary: '#48cae4', secondary: '#00b4d8', accent: '#90e0ef', background: '#03071e', text: '#caf0f8' },
  },
  {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    category: 'Pastel',
    colors: { primary: '#7b68ee', secondary: '#9d4edd', accent: '#c8b6ff', background: '#10002b', text: '#e0aaff' },
  },
  {
    id: 'toxic-waste',
    name: 'Toxic Waste',
    category: 'Vibrant',
    colors: { primary: '#39ff14', secondary: '#00ff41', accent: '#ccff00', background: '#0a0f0a', text: '#d4ffc4' },
  },
  {
    id: 'sakura-bloom',
    name: 'Sakura Bloom',
    category: 'Pastel',
    colors: { primary: '#ff85a1', secondary: '#ff5c8a', accent: '#ffc2d1', background: '#1a0f14', text: '#ffe5ec' },
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    category: 'Dark',
    colors: { primary: '#ffd700', secondary: '#daa520', accent: '#f0e68c', background: '#0d0d0d', text: '#fffacd' },
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    category: 'Vibrant',
    colors: { primary: '#ff71ce', secondary: '#01cdfe', accent: '#05ffa1', background: '#1a0a2e', text: '#b967ff' },
  },
  {
    id: 'rust-metal',
    name: 'Rust & Metal',
    category: 'Dark',
    colors: { primary: '#a0522d', secondary: '#cd853f', accent: '#d2691e', background: '#1c1410', text: '#f5deb3' },
  },

  // --- 2. LEGACY CUSTOM THEMES (29) ---
  {
    id: 'tuscan-sunset',
    name: 'Tuscan Sunset',
    category: 'Nature',
    colors: { primary: '#f08a4b', secondary: '#f2a541', accent: '#f3ca40', background: '#577590', text: '#d78a76' },
  },
  {
    id: 'cherry-garden',
    name: 'Cherry Garden',
    category: 'Nature',
    colors: { primary: '#e34a6f', secondary: '#60a561', accent: '#f7b2bd', background: '#053225', text: '#b2a198' },
  },
  {
    id: 'coastal-heat',
    name: 'Coastal Heat',
    category: 'Vibrant',
    colors: { primary: '#d63230', secondary: '#39a9db', accent: '#40bcd8', background: '#1c77c3', text: '#f39237' },
  },
  {
    id: 'tropical-ember',
    name: 'Tropical Ember',
    category: 'Vibrant',
    colors: { primary: '#ef3e36', secondary: '#17bebb', accent: '#edb88b', background: '#2e282a', text: '#fad8d6' },
  },
  {
    id: 'moss-stone',
    name: 'Moss & Stone',
    category: 'Nature',
    colors: { primary: '#8c6057', secondary: '#a69f98', accent: '#afd5aa', background: '#5c5346', text: '#f0f2ef' },
  },
  {
    id: 'mahogany-orchid',
    name: 'Mahogany Orchid',
    category: 'Dark',
    colors: { primary: '#983628', secondary: '#581908', accent: '#e2aedd', background: '#2e0e02', text: '#ebcbf4' },
  },
  {
    id: 'neon-coral',
    name: 'Neon Coral',
    category: 'Vibrant',
    colors: { primary: '#e63462', secondary: '#fe5f55', accent: '#c7efcf', background: '#333745', text: '#eef5db' },
  },
  {
    id: 'midnight-sky',
    name: 'Midnight Sky',
    category: 'Dark',
    colors: { primary: '#5db7de', secondary: '#716a5c', accent: '#f1e9db', background: '#07020d', text: '#a39b8b' },
  },
  {
    id: 'dusty-rose',
    name: 'Dusty Rose',
    category: 'Pastel',
    colors: { primary: '#cea0ae', secondary: '#684551', accent: '#9cd08f', background: '#402e2a', text: '#d5b0ac' },
  },
  {
    id: 'ember-ash',
    name: 'Ember & Ash',
    category: 'Dark',
    colors: { primary: '#b80c09', secondary: '#6b2b06', accent: '#e5e7e6', background: '#141301', text: '#b7b5b3' },
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Emerald',
    category: 'Vibrant',
    colors: { primary: '#2cda9d', secondary: '#3e8989', accent: '#05f140', background: '#1a181b', text: '#564d65' },
  },
  {
    id: 'pastel-bloom',
    name: 'Pastel Bloom',
    category: 'Pastel',
    colors: { primary: '#ffb7c3', secondary: '#eec6ca', accent: '#bcf4de', background: '#ded6d1', text: '#1a181b' },
  },
  {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    category: 'Light',
    colors: { primary: '#279af1', secondary: '#60656f', accent: '#f7f7ff', background: '#131112', text: '#c49991' },
  },
  {
    id: 'urban-mustard',
    name: 'Urban Mustard',
    category: 'Dark',
    colors: { primary: '#009fb7', secondary: '#696773', accent: '#fed766', background: '#272727', text: '#eff1f3' },
  },
  {
    id: 'neon-violet',
    name: 'Neon Violet',
    category: 'Vibrant',
    colors: { primary: '#e952de', secondary: '#ffa0fd', accent: '#c2d076', background: '#001514', text: '#ffe1ea' },
  },
  {
    id: 'raspberry-teal',
    name: 'Raspberry Teal',
    category: 'Vibrant',
    colors: { primary: '#d81159', secondary: '#8f2d56', accent: '#fbb13c', background: '#218380', text: '#73d2de' },
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    category: 'Nature',
    colors: { primary: '#663f46', secondary: '#b8c4bb', accent: '#c9d6ea', background: '#3c362a', text: '#e8f7ee' },
  },
  {
    id: 'flame-metal',
    name: 'Flame & Metal',
    category: 'Dark',
    colors: { primary: '#f06543', secondary: '#f09d51', accent: '#e0dfd5', background: '#313638', text: '#e8e9eb' },
  },
  {
    id: 'candy-pastel',
    name: 'Candy Pastel',
    category: 'Pastel',
    colors: { primary: '#a0ced9', secondary: '#adf7b6', accent: '#ffee93', background: '#fcf5c7', text: '#313638' },
  },
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    category: 'Dark',
    colors: { primary: '#f95738', secondary: '#ee964b', accent: '#f4d35e', background: '#0d3b66', text: '#faf0ca' },
  },
  {
    id: 'pure-orange',
    name: 'Pure Orange',
    category: 'Vibrant',
    colors: { primary: '#fca311', secondary: '#14213d', accent: '#e5e5e5', background: '#000000', text: '#ffffff' },
  },
  {
    id: 'ocean-pumpkin',
    name: 'Ocean Pumpkin',
    category: 'Vibrant',
    colors: { primary: '#ea7317', secondary: '#3da5d9', accent: '#fec601', background: '#2364aa', text: '#73bfb8' },
  },
  {
    id: 'scarlet-yale',
    name: 'Scarlet Yale',
    category: 'Dark',
    colors: { primary: '#db222a', secondary: '#a31621', accent: '#bfdbf7', background: '#053c5e', text: '#1f7a8c' },
  },
  {
    id: 'rose-wine',
    name: 'Rose Wine',
    category: 'Dark',
    colors: { primary: '#c94277', secondary: '#94524a', accent: '#cadbc0', background: '#2f0a28', text: '#a27e6f' },
  },
  {
    id: 'canary-mono',
    name: 'Canary Mono',
    category: 'Monochrome',
    colors: { primary: '#fcfc62', secondary: '#a3a3a3', accent: '#feffea', background: '#424242', text: '#c9c9c9' },
  },
  {
    id: 'cerulean-wheat',
    name: 'Cerulean Wheat',
    category: 'Light',
    colors: { primary: '#2dc7ff', secondary: '#00abe7', accent: '#eaba6b', background: '#0081af', text: '#ead2ac' },
  },
  {
    id: 'steel-peach',
    name: 'Steel & Peach',
    category: 'Light',
    colors: { primary: '#3581b8', secondary: '#dee2d6', accent: '#fcb07e', background: '#ebe9e9', text: '#313638' },
  },
  {
    id: 'coral-glaucous',
    name: 'Coral Glaucous',
    category: 'Pastel',
    colors: { primary: '#fe5f55', secondary: '#777da7', accent: '#c6ecae', background: '#885053', text: '#94c9a9' },
  },
  {
    id: 'autumn-ember',
    name: 'Autumn Ember',
    category: 'Nature',
    colors: { primary: '#ffa552', secondary: '#ba5624', accent: '#c4d6b0', background: '#381d2a', text: '#fcde9c' },
  },

  // --- 3. REFACTORED CSV IMPORTS (30) ---
  // Using ALL 5 source colors for these mappings
  {
    id: 'vintage-rose-silk',
    name: 'Almond Silk',
    category: 'Pastel',
    colors: { primary: '#cc7e85', secondary: '#cf4d6f', accent: '#a36d90', background: '#76818e', text: '#c5afa4' },
  },
  {
    id: 'amber-blaze',
    name: 'Amber Blaze',
    category: 'Vibrant',
    colors: { primary: '#fb5607', secondary: '#ff006e', accent: '#ffbe0b', background: '#8338ec', text: '#3a86ff' },
  },
  {
    id: 'midnight-violet-gold',
    name: 'Midnight Violet',
    category: 'Dark',
    colors: { primary: '#ecce8e', secondary: '#dbcf96', accent: '#9ac2c5', background: '#270722', text: '#c2c6a7' },
  },
  {
    id: 'gunmetal-ops',
    name: 'Gunmetal Ops',
    category: 'Monochrome',
    colors: { primary: '#819595', secondary: '#696773', accent: '#363946', background: '#000000', text: '#b1b6a6' },
  },
  {
    id: 'pastel-sky-blue',
    name: 'Pastel Sky',
    category: 'Pastel',
    colors: { primary: '#64a6bd', secondary: '#90a8c3', accent: '#d7b9d5', background: '#ada7c9', text: '#f4cae0' },
  },
  {
    id: 'scarlet-fire',
    name: 'Scarlet Fire',
    category: 'Dark',
    colors: { primary: '#ff220c', secondary: '#d33e43', accent: '#9b7874', background: '#1c1f33', text: '#666370' },
  },
  {
    id: 'lavender-veil',
    name: 'Lavender Veil',
    category: 'Light',
    colors: { primary: '#3590f3', secondary: '#62bfed', accent: '#8fb8ed', background: '#f1e3f3', text: '#c2bbf0' },
  },
  {
    id: 'electric-aqua',
    name: 'Electric Aqua',
    category: 'Vibrant',
    colors: { primary: '#44ffd2', secondary: '#87f6ff', accent: '#ffbfa0', background: '#616163', text: '#daf5ff' },
  },
  {
    id: 'princeton-orange',
    name: 'Princeton Orange',
    category: 'Vibrant',
    colors: { primary: '#ff8811', secondary: '#f4d06f', accent: '#9dd9d2', background: '#392f5a', text: '#fff8f0' },
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    category: 'Light',
    colors: { primary: '#db5461', secondary: '#8aa29e', accent: '#e3f2fd', background: '#fafafa', text: '#686963' },
  },
  {
    id: 'ocean-dark',
    name: 'Ocean Dark',
    category: 'Dark',
    colors: { primary: '#3c91e6', secondary: '#a2d729', accent: '#fa824c', background: '#342e37', text: '#fafffd' },
  },
  {
    id: 'lime-coffee',
    name: 'Lime Coffee',
    category: 'Nature',
    colors: { primary: '#c5d86d', secondary: '#e4e6c3', accent: '#f05d23', background: '#261c15', text: '#f7f7f2' },
  },
  {
    id: 'cyber-indigo',
    name: 'Cyber Indigo',
    category: 'Vibrant',
    colors: { primary: '#e86a92', secondary: '#41e2ba', accent: '#f7e733', background: '#2b2d42', text: '#f7f7f9' },
  },
  {
    id: 'iron-mint',
    name: 'Iron Mint',
    category: 'Monochrome',
    colors: { primary: '#b5ffe9', secondary: '#c5e0d8', accent: '#ceabb1', background: '#444545', text: '#c9c9c9' },
  },
  {
    id: 'dark-teal-pink',
    name: 'Dark Teal Pink',
    category: 'Dark',
    colors: { primary: '#f45b69', secondary: '#028090', accent: '#e4fde1', background: '#114b5f', text: '#456990' },
  },
  // Batch 2 Refactored
  {
    id: 'neon-ice-vibrant',
    name: 'Neon Ice',
    category: 'Vibrant',
    colors: { primary: '#03f7eb', secondary: '#00b295', accent: '#ab2346', background: '#191516', text: '#c9daea' },
  },
  {
    id: 'spicy-olive',
    name: 'Spicy Olive',
    category: 'Nature',
    colors: { primary: '#de541e', secondary: '#878472', accent: '#d6d6b1', background: '#3f3f37', text: '#494331' },
  },
  {
    id: 'bright-sky-graphite',
    name: 'Bright Sky',
    category: 'Vibrant',
    colors: { primary: '#30bced', secondary: '#fc5130', accent: '#fffaff', background: '#050401', text: '#303036' },
  },
  {
    id: 'vintage-grape',
    name: 'Vintage Grape',
    category: 'Pastel',
    colors: { primary: '#9792e3', secondary: '#61e786', accent: '#edffec', background: '#48435c', text: '#5a5766' },
  },
  {
    id: 'tuscan-sun-graphite',
    name: 'Tuscan Graphite',
    category: 'Nature',
    colors: { primary: '#e8c547', secondary: '#5c80bc', accent: '#cdd1c4', background: '#30323d', text: '#4d5061' },
  },
  {
    id: 'graphite-turquoise',
    name: 'Graphite Turquoise',
    category: 'Dark',
    colors: { primary: '#48e5c2', secondary: '#f3d3bd', accent: '#fcfaf9', background: '#333333', text: '#5e5e5e' },
  },
  {
    id: 'steel-blue-shadow',
    name: 'Steel Shadow',
    category: 'Monochrome',
    colors: { primary: '#4d7ea8', secondary: '#9e90a2', accent: '#b6c2d9', background: '#272932', text: '#828489' },
  },
  {
    id: 'honey-bronze',
    name: 'Honey Bronze',
    category: 'Nature',
    colors: { primary: '#eec670', secondary: '#f58549', accent: '#f2a65a', background: '#585123', text: '#772f1a' },
  },
  {
    id: 'amber-neon',
    name: 'Amber Neon',
    category: 'Vibrant',
    colors: { primary: '#ffae03', secondary: '#fe4e00', accent: '#ff0f80', background: '#e9190f', text: '#e67f0d' },
  },
  {
    id: 'raspberry-graphite',
    name: 'Raspberry Graphite',
    category: 'Dark',
    colors: { primary: '#d81e5b', secondary: '#f0544f', accent: '#fdf0d5', background: '#3a3335', text: '#c6d8d3' },
  },
  {
    id: 'electric-rosewood',
    name: 'Electric Rosewood',
    category: 'Vibrant',
    colors: { primary: '#56eef4', secondary: '#5438dc', accent: '#32e875', background: '#b24c63', text: '#357ded' },
  },
  {
    id: 'frosted-obsidian',
    name: 'Frosted Obsidian',
    category: 'Monochrome',
    colors: { primary: '#92dce5', secondary: '#d64933', accent: '#eee5e9', background: '#000000', text: '#7c7c7c' },
  },
  {
    id: 'mauve-mint',
    name: 'Mauve Mint',
    category: 'Pastel',
    colors: { primary: '#ca6680', secondary: '#63a375', accent: '#edc79b', background: '#713e5a', text: '#d57a66' },
  },
  {
    id: 'ultrasonic-blue',
    name: 'Ultrasonic Blue',
    category: 'Vibrant',
    colors: { primary: '#0008e6', secondary: '#ff1aec', accent: '#cd8fff', background: '#000d24', text: '#003f9e' },
  },
  {
    id: 'oxblood-spice',
    name: 'Oxblood Spice',
    category: 'Dark',
    colors: { primary: '#941b0c', secondary: '#bc3908', accent: '#f6aa1c', background: '#220901', text: '#621708' },
  },

  // --- 4. NEW ADDITIONS BATCH 3 (12) ---
  {
    id: 'amethyst-flame',
    name: 'Amethyst Flame',
    category: 'Vibrant',
    colors: { primary: '#ff470f', secondary: '#e2ff61', accent: '#ffc847', background: '#370042', text: '#753700' },
  },
  {
    id: 'molten-walnut',
    name: 'Molten Walnut',
    category: 'Dark',
    colors: { primary: '#ffa114', secondary: '#6bdaff', accent: '#fff8db', background: '#421f00', text: '#751600' },
  },
  {
    id: 'aquamarine-mist',
    name: 'Aquamarine Mist',
    category: 'Vibrant',
    colors: { primary: '#4dffe1', secondary: '#00fa64', accent: '#ff94c4', background: '#0085ad', text: '#ffc2c8' },
  },
  {
    id: 'banana-coral',
    name: 'Banana Coral',
    category: 'Light',
    colors: { primary: '#f25757', secondary: '#61e8e1', accent: '#f2cd60', background: '#eaf2e3', text: '#f2e863' },
  },
  {
    id: 'caramel-ash',
    name: 'Caramel Ash',
    category: 'Pastel',
    colors: { primary: '#fcb97d', secondary: '#edd892', accent: '#aaba9e', background: '#b5b8a3', text: '#c6b89e' },
  },
  {
    id: 'razzmatazz-plum',
    name: 'Razzmatazz Plum',
    category: 'Vibrant',
    colors: { primary: '#ec0072', secondary: '#e8003e', accent: '#d52193', background: '#ae3792', text: '#b32787' },
  },
  {
    id: 'pearl-tea-green',
    name: 'Pearl Tea',
    category: 'Pastel',
    colors: { primary: '#ffb0d7', secondary: '#c5e8d2', accent: '#ffdcc4', background: '#d993a9', text: '#a7d4c4' },
  },
  {
    id: 'electric-berry',
    name: 'Electric Berry',
    category: 'Vibrant',
    colors: { primary: '#4dffed', secondary: '#5fff59', accent: '#ff36a1', background: '#8c385e', text: '#ffffff' },
  },
  {
    id: 'glacial-ice',
    name: 'Glacial Ice',
    category: 'Light',
    colors: { primary: '#bae6fd', secondary: '#dbeafe', accent: '#7dd3fc', background: '#082f49', text: '#f0f9ff' },
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    category: 'Nature',
    colors: { primary: '#10b981', secondary: '#059669', accent: '#6ee7b7', background: '#022c22', text: '#ecfdf5' },
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    category: 'Vibrant',
    colors: { primary: '#fb923c', secondary: '#f97316', accent: '#fdba74', background: '#431407', text: '#fff7ed' },
  },
  {
    id: 'royal-velvet',
    name: 'Royal Velvet',
    category: 'Dark',
    colors: { primary: '#a855f7', secondary: '#7e22ce', accent: '#d8b4fe', background: '#3b0764', text: '#faf5ff' },
  },

  // --- 5. FINAL BATCH TO REACH 100 (14) ---
  {
    id: 'slate-concrete',
    name: 'Slate Concrete',
    category: 'Monochrome',
    colors: { primary: '#94a3b8', secondary: '#64748b', accent: '#cbd5e1', background: '#0f172a', text: '#f1f5f9' },
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    category: 'Pastel',
    colors: { primary: '#f9a8d4', secondary: '#f472b6', accent: '#fbcfe8', background: '#831843', text: '#fff1f2' },
  },
  {
    id: 'cyber-punk-city',
    name: 'Cyber City',
    category: 'Vibrant',
    colors: { primary: '#d946ef', secondary: '#e879f9', accent: '#fae8ff', background: '#4a044e', text: '#f5d0fe' },
  },
  {
    id: 'deep-sea-diver',
    name: 'Deep Sea',
    category: 'Dark',
    colors: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#7dd3fc', background: '#0c4a6e', text: '#f0f9ff' },
  },
  {
    id: 'apricot-glow',
    name: 'Apricot Glow',
    category: 'Pastel',
    colors: { primary: '#fdba74', secondary: '#fb923c', accent: '#ffedd5', background: '#7c2d12', text: '#fff7ed' },
  },
  {
    id: 'graphite-mono',
    name: 'Graphite Mono',
    category: 'Monochrome',
    colors: { primary: '#525252', secondary: '#404040', accent: '#737373', background: '#171717', text: '#e5e5e5' },
  },
  {
    id: 'toxic-lime',
    name: 'Toxic Lime',
    category: 'Vibrant',
    colors: { primary: '#84cc16', secondary: '#65a30d', accent: '#bef264', background: '#1a2e05', text: '#f7fee7' },
  },
  {
    id: 'ruby-red',
    name: 'Ruby Red',
    category: 'Dark',
    colors: { primary: '#e11d48', secondary: '#be123c', accent: '#fda4af', background: '#881337', text: '#fff1f2' },
  },
  {
    id: 'golden-sand',
    name: 'Golden Sand',
    category: 'Nature',
    colors: { primary: '#d97706', secondary: '#b45309', accent: '#fcd34d', background: '#451a03', text: '#fffbeb' },
  },
  {
    id: 'midnight-indigo',
    name: 'Midnight Indigo',
    category: 'Dark',
    colors: { primary: '#6366f1', secondary: '#4f46e5', accent: '#a5b4fc', background: '#1e1b4b', text: '#eef2ff' },
  },
  {
    id: 'teal-wave',
    name: 'Teal Wave',
    category: 'Nature',
    colors: { primary: '#14b8a6', secondary: '#0d9488', accent: '#5eead4', background: '#134e4a', text: '#f0fdfa' },
  },
  {
    id: 'rose-gold-lux',
    name: 'Rose Gold',
    category: 'Light',
    colors: { primary: '#fb7185', secondary: '#f43f5e', accent: '#fda4af', background: '#881337', text: '#fff1f2' },
  },
  {
    id: 'cyber-yellow',
    name: 'Cyber Yellow',
    category: 'Vibrant',
    colors: { primary: '#eab308', secondary: '#ca8a04', accent: '#fef08a', background: '#422006', text: '#fefce8' },
  },
  {
    id: 'storm-cloud',
    name: 'Storm Cloud',
    category: 'Monochrome',
    colors: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8', background: '#0f172a', text: '#f8fafc' },
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
      currentTheme: themes[1], // Default to Garden Dusk

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