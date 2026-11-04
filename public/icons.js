// Hand-drawn doodle SVG icon set for NHAM EY KE
const DRAWING_ICONS = {
  skillet: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="doodle-icon">
      <!-- Frying Pan Body -->
      <path d="M7 23C7 31.8366 14.1634 39 23 39C31.8366 39 39 31.8366 39 23H7Z" fill="rgba(230, 57, 70, 0.12)" />
      <path d="M7 23C7 31.8366 14.1634 39 23 39C31.8366 39 39 31.8366 39 23C39 23 38 21 23 21C8 21 7 23 7 23Z" />
      <!-- Pan handle -->
      <path d="M38 26L45 28C46 28.3 47 29.5 46.5 30.5C46 31.5 44.8 32 43.8 31.5L37 29" stroke-width="3" />
      <circle cx="43" cy="29.5" r="1.5" fill="currentColor" />
      <!-- Steam / Sizzle doodles -->
      <path d="M16 16C15 13 18 11 17 8" stroke="#FFB703" stroke-dasharray="1 3" stroke-width="2.5" />
      <path d="M23 15C22 11 25 9 24 6" stroke="#E63946" stroke-dasharray="1 3" stroke-width="2.5" />
      <path d="M30 16C29 13 32 11 31 8" stroke="#2A9D8F" stroke-dasharray="1 3" stroke-width="2.5" />
      <!-- Fried egg inside pan -->
      <ellipse cx="22" cy="28" rx="7" ry="5" fill="#FFFDF9" stroke="currentColor" stroke-width="1.8" />
      <circle cx="21" cy="27.5" r="2.8" fill="#FFB703" stroke="#F4A261" stroke-width="1.5" />
    </svg>
  `,

  pot: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="doodle-icon">
      <!-- Pot Body -->
      <path d="M10 20H38V33C38 37.4 34.4 41 30 41H18C13.6 41 10 37.4 10 33V20Z" fill="rgba(255, 183, 3, 0.15)" />
      <!-- Pot Handles -->
      <path d="M10 24C6.5 24 5 26.5 5 28.5C5 30.5 7 32 10 32" stroke-width="2.5" />
      <path d="M38 24C41.5 24 43 26.5 43 28.5C43 30.5 41 32 38 32" stroke-width="2.5" />
      <!-- Pot Lid -->
      <path d="M8 20C8 19 12 15 24 15C36 15 40 19 40 20H8Z" fill="#FFFDF9" />
      <!-- Lid Knob -->
      <path d="M21 15V12C21 10.5 22.5 10 24 10C25.5 10 27 10.5 27 12V15" stroke-width="2.5" />
      <!-- Steam bubbles -->
      <circle cx="18" cy="7" r="1.5" fill="#2A9D8F" />
      <circle cx="29" cy="6" r="2" fill="#E63946" />
      <circle cx="24" cy="4" r="1" fill="#FFB703" />
    </svg>
  `,

  "heart-pot": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="doodle-icon">
      <!-- Mom's Soup Pot with Heart -->
      <path d="M9 22H39V34C39 38 35.5 41 31 41H17C12.5 41 9 38 9 34V22Z" fill="rgba(42, 157, 143, 0.15)" />
      <!-- Heart badge on pot -->
      <path d="M24 35L20 30.5C18.5 29 18.5 26.5 20.2 25.2C21.8 24 23.5 24.8 24 25.5C24.5 24.8 26.2 24 27.8 25.2C29.5 26.5 29.5 29 28 30.5L24 35Z" fill="#E63946" stroke="#E63946" stroke-width="1.5" />
      <!-- Wooden Ladle dipping into pot -->
      <path d="M28 8L34 24" stroke="#F4A261" stroke-width="3" />
      <!-- Steam curls -->
      <path d="M16 16C15 13 18 11 17 8" stroke="#E63946" stroke-width="2" />
      <path d="M23 15C22 12 25 10 24 7" stroke="#FFB703" stroke-width="2" />
    </svg>
  `,

  bowl: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="doodle-icon">
      <path d="M8 22C8 32 15 40 24 40C33 40 40 32 40 22H8Z" fill="rgba(255, 183, 3, 0.18)" />
      <path d="M16 40L14 43H34L32 40" stroke-width="2.5" />
      <!-- Chopsticks -->
      <line x1="12" y1="12" x2="38" y2="20" stroke="#FB8500" stroke-width="2.5" />
      <line x1="10" y1="15" x2="36" y2="23" stroke="#FB8500" stroke-width="2.5" />
      <!-- Steam curls -->
      <path d="M20 16C19 13 22 10 21 7" stroke="#E63946" stroke-width="2" />
      <path d="M28 16C27 13 30 10 29 7" stroke="#2A9D8F" stroke-width="2" />
    </svg>
  `,

  fish: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="doodle-icon">
      <path d="M6 24C12 16 28 16 38 24C28 32 12 32 6 24Z" fill="rgba(42, 157, 143, 0.18)" />
      <path d="M38 24L44 18V30L38 24Z" fill="rgba(42, 157, 143, 0.3)" />
      <circle cx="14" cy="23" r="2" fill="currentColor" />
      <path d="M24 20C25 22 25 26 24 28" stroke-width="2" />
      <path d="M29 21C30 23 30 25 29 27" stroke-width="2" />
    </svg>
  `,

  egg: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="doodle-icon">
      <!-- Fried Egg with crispy edge -->
      <path d="M12 28C8 24 10 16 16 14C22 12 26 8 33 12C40 16 42 24 38 31C34 38 26 40 19 38C13 36 14 30 12 28Z" fill="#FFFDF8" />
      <circle cx="25" cy="24" r="8" fill="#FFB703" stroke="#FB8500" stroke-width="2" />
      <circle cx="23" cy="22" r="2.5" fill="#FFFFFF" />
    </svg>
  `,

  veggies: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="doodle-icon">
      <!-- Vegetable leaves -->
      <path d="M24 42V18" stroke="#2A9D8F" stroke-width="3" />
      <path d="M24 18C16 16 12 22 14 30C16 38 24 38 24 38" fill="rgba(42, 157, 143, 0.2)" />
      <path d="M24 22C32 20 36 26 34 34C32 40 24 40 24 40" fill="rgba(42, 157, 143, 0.3)" />
      <path d="M24 18C20 12 24 6 28 6C32 6 32 12 24 18Z" fill="rgba(42, 157, 143, 0.4)" />
    </svg>
  `,

  rice: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="doodle-icon">
      <!-- Rice bowl with steaming mound -->
      <path d="M10 24C10 34 16 40 24 40C32 40 38 34 38 24H10Z" fill="rgba(230, 57, 70, 0.15)" />
      <path d="M10 24C12 18 18 14 24 14C30 14 36 18 38 24H10Z" fill="#FFFDF8" />
      <line x1="17" y1="40" x2="15" y2="43" stroke-width="2.5" />
      <line x1="31" y1="40" x2="33" y2="43" stroke-width="2.5" />
      <path d="M24 10C23 8 25 6 24 4" stroke="#E63946" stroke-width="2" />
    </svg>
  `,

  fire: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="doodle-icon">
      <!-- Flame -->
      <path d="M24 6C24 6 29 14 26 21C26 21 31 19 32 24C34 29 32 36 27 39C21 42 15 39 14 33C13 26 19 20 19 16C19 16 22 17 24 6Z" fill="rgba(251, 133, 0, 0.25)" stroke="#FB8500" />
      <path d="M24 23C24 23 27 27 25 31C23 34 20 34 19 31C18 28 22 25 24 23Z" fill="#FFB703" stroke="#FFB703" />
    </svg>
  `,

  chili: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="doodle-mini">
      <path d="M19 4C19 4 17 5 15 5C10 5 4 10 4 16C4 18 6 20 8 20C14 20 20 14 20 8C20 6 19 4 19 4Z" fill="#E63946" stroke="#E63946" />
      <path d="M19 4C21 2 22 2 22 2" stroke="#2A9D8F" stroke-width="2" />
    </svg>
  `,

  clock: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="doodle-mini">
      <circle cx="12" cy="12" r="9" fill="rgba(255, 183, 3, 0.18)" />
      <path d="M12 7V12L15 14" stroke="#E63946" stroke-width="2.2" />
    </svg>
  `,

  coin: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="doodle-mini">
      <circle cx="12" cy="12" r="9" fill="rgba(42, 157, 143, 0.18)" />
      <path d="M12 6V18M9 9H14C15 9 15.5 10 15.5 11C15.5 12 14.5 13 13 13H11C9.5 13 8.5 14 8.5 15C8.5 16 9 17 10 17H15" stroke="#2A9D8F" stroke-width="2" />
    </svg>
  `,

  mortar: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="doodle-mini">
      <path d="M4 11C4 16.5 7.5 21 12 21C16.5 21 20 16.5 20 11H4Z" fill="rgba(255, 183, 3, 0.15)" />
      <path d="M15 3L11 12" stroke-width="2.5" />
    </svg>
  `,

  search: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  `,

  inbox: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 8L12 14L21 8" />
    </svg>
  `,

  home: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H15V15H9V21H4C3.4 21 3 20.6 3 20V10.5Z" />
    </svg>
  `,

  chefHat: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 18H18V21H6V18Z" fill="#FFFDF9" />
      <path d="M6 18C4 18 3 16 3 14C3 11.5 5 10 7 10C7 7 9.5 5 12 5C14.5 5 17 7 17 10C19 10 21 11.5 21 14C21 16 20 18 18 18" fill="rgba(230, 57, 70, 0.1)" />
    </svg>
  `,

  check: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  `,

  arrowLeft: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  `,

  share: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  `,

  bookmark: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21L12 16L5 21V5C5 3.9 5.9 3 7 3H17C18.1 3 19 3.9 19 5V21Z" />
    </svg>
  `,

  camera: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M23 19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V8C1 6.9 1.9 6 3 6H7L9 3H15L17 6H21C22.1 6 23 6.9 23 8V19Z" fill="rgba(255, 183, 3, 0.15)" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  `,

  trash: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  `,

  plus: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  `
};

// Universal Icon Renderer Helper (Handles SVG key, Raw SVG, Image URL, Emoji, or 'none')
function renderIcon(iconKey, customStyle = '') {
  if (!iconKey || iconKey === 'none' || iconKey === 'null' || iconKey === 'empty') {
    return '';
  }
  // Check if it's a known drawing icon
  if (DRAWING_ICONS[iconKey]) {
    return DRAWING_ICONS[iconKey];
  }
  // Check if it's raw SVG
  if (typeof iconKey === 'string' && iconKey.trim().startsWith('<svg')) {
    return iconKey;
  }
  // Check if it's an image path/URL
  if (typeof iconKey === 'string' && (iconKey.startsWith('/') || iconKey.startsWith('http') || iconKey.startsWith('data:image'))) {
    return `<img src="${iconKey}" alt="icon" style="width:100%; height:100%; object-fit:contain; ${customStyle}" />`;
  }
  // Otherwise treat as Emoji / text icon
  return `<span style="font-size:1.8rem; line-height:1; display:inline-block; ${customStyle}">${iconKey}</span>`;
}

window.DRAWING_ICONS = DRAWING_ICONS;
window.renderIcon = renderIcon;
