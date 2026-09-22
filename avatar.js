/* ============================================================
   AI ENGINEER: LEVEL UP — avatar + gear system
   Pure inline SVG. No images, no fonts, no network.
   ------------------------------------------------------------
   HOW TO EDIT:
   - SKINS / HAIRS / OUTFITS below are the character creator palettes.
   - REWARDS[level] is the list of gear a player can EARN after
     clearing that level. They are offered 2 at random and pick 1.
   - Each gear item has a `slot`. A new item replaces whatever was
     in that slot. Slots: head, face, body, hand, side, cape, aura.
   ============================================================ */

const SKINS = [
  { id: 's1', name: 'Deep',    hex: '#5b3420' },
  { id: 's2', name: 'Rich',    hex: '#7a4a28' },
  { id: 's3', name: 'Warm',    hex: '#9c6440' },
  { id: 's4', name: 'Golden',  hex: '#c08552' },
  { id: 's5', name: 'Olive',   hex: '#d9a066' },
  { id: 's6', name: 'Light',   hex: '#f0c49b' }
];

const HAIRCOLORS = [
  { id: 'h1', name: 'Black',   hex: '#191320' },
  { id: 'h2', name: 'Brown',   hex: '#4a2c18' },
  { id: 'h3', name: 'Auburn',  hex: '#8a3a1e' },
  { id: 'h4', name: 'Blonde',  hex: '#d8a12a' },
  { id: 'h5', name: 'Violet',  hex: '#9333ea' },
  { id: 'h6', name: 'Teal',    hex: '#0d9488' }
];

const OUTFITS = [
  { id: 'o1', name: 'Purple', hex: '#7c3aed' },
  { id: 'o2', name: 'Cyan',   hex: '#0891b2' },
  { id: 'o3', name: 'Rose',   hex: '#e11d48' },
  { id: 'o4', name: 'Green',  hex: '#15803d' },
  { id: 'o5', name: 'Amber',  hex: '#d97706' },
  { id: 'o6', name: 'Slate',  hex: '#475569' }
];

/* Genders drive hairstyle + silhouette. Players may also pick any
   hairstyle they like — identity here is the player's choice. */
const GENDERS = [
  { id: 'girl',    label: 'Girl',            hair: 'long'  },
  { id: 'boy',     label: 'Boy',             hair: 'short' },
  { id: 'nonbin',  label: 'Non-binary',      hair: 'curly' },
  { id: 'private', label: 'Rather not say',  hair: 'locs'  }
];

const HAIRSTYLES = [
  { id: 'long',  name: 'Long' },
  { id: 'short', name: 'Short' },
  { id: 'curly', name: 'Curly' },
  { id: 'locs',  name: 'Locs' },
  { id: 'puffs', name: 'Puffs' },
  { id: 'fade',  name: 'Fade' }
];

/* ============================================================
   GEAR — earned by clearing levels
   ============================================================ */
const GEAR = {
  /* head */
  goggles:  { name: 'Lab Goggles',       slot: 'face', blurb: 'Standard issue. You booted up.' },
  beanie:   { name: 'Circuit Beanie',    slot: 'head', blurb: 'Warm, and slightly conductive.' },
  headset:  { name: 'Comms Headset',     slot: 'head', blurb: 'For talking to machines.' },
  visor:    { name: 'Token Visor',       slot: 'face', blurb: 'See text the way a model does.' },
  crown:    { name: 'Capstone Crown',    slot: 'head', blurb: 'Only the boss drops this.' },
  hardhat:  { name: 'Data Mine Hardhat', slot: 'head', blurb: 'Digging through messy data is dangerous work.' },
  halo:     { name: 'Ethics Halo',       slot: 'aura', blurb: 'Earned at the Responsibility Gate.' },
  /* body */
  hoodie:   { name: 'Dev Hoodie',        slot: 'body', blurb: 'The uniform.' },
  labcoat:  { name: 'Lab Coat',          slot: 'body', blurb: 'Now it is official science.' },
  jacket:   { name: 'Captain Jacket',    slot: 'body', blurb: 'You shipped it.' },
  sash:     { name: 'Responsible AI Sash', slot: 'body', blurb: 'Fairness, safety, privacy, accountability.' },
  vest:     { name: 'Field Vest',        slot: 'body', blurb: 'Pockets for everything.' },
  /* hand */
  wand:     { name: 'Prompt Wand',       slot: 'hand', blurb: 'Specificity, not magic. Mostly.' },
  wrench:   { name: 'Debug Wrench',      slot: 'hand', blurb: 'For when the error message is honest.' },
  anchor:   { name: 'Grounding Anchor',  slot: 'hand', blurb: 'Answers you can actually check.' },
  torch:    { name: 'Eval Torch',        slot: 'hand', blurb: 'Shines on what is actually broken.' },
  tablet:   { name: 'Spec Tablet',       slot: 'hand', blurb: 'Write the spec before the prompt.' },
  /* side companions */
  drone:    { name: 'Agent Drone',       slot: 'side', blurb: 'Loops, calls tools, checks results.' },
  robopet:  { name: 'Robo Pup',          slot: 'side', blurb: 'Fetches, but verifies first.' },
  /* cape / aura */
  cape:     { name: 'Shipper Cape',      slot: 'cape', blurb: 'Earned in production.' },
  scarf:    { name: 'Vector Scarf',      slot: 'cape', blurb: 'Meaning, in many dimensions.' },
  sparks:   { name: 'Signal Aura',       slot: 'aura', blurb: 'People can tell you know things.' }
};

/* Which gear each level can drop. The game offers 2 at random. */
const REWARDS = {
  1:  ['goggles', 'beanie', 'vest'],
  2:  ['wand', 'headset', 'tablet'],
  3:  ['visor', 'scarf', 'sparks'],
  4:  ['hoodie', 'wrench', 'tablet'],
  5:  ['hardhat', 'labcoat', 'vest'],
  6:  ['sash', 'halo'],              // Responsible AI — both are honors
  7:  ['anchor', 'scarf', 'labcoat'],
  8:  ['drone', 'robopet', 'headset'],
  9:  ['jacket', 'cape', 'torch'],
  10: ['crown']                       // boss drop, always the crown
};

/* ============================================================
   SVG BUILDER
   ============================================================ */
function hairSVG(style, c) {
  const d = shade(c, -28);
  switch (style) {
    case 'long':
      return `<path d="M34 46c0-16 12-26 26-26s26 10 26 26v34c0 6-6 9-9 4-2-16-4-22-4-22-6 5-18 7-26 4-4-2-6-4-6-4s-2 6-4 22c-3 5-9 2-9-4z" fill="${c}"/>
              <path d="M38 40c6-12 16-16 22-16s16 4 22 16c-8-6-14-8-22-8s-14 2-22 8z" fill="${d}"/>`;
    case 'short':
      return `<path d="M36 46c0-15 11-25 24-25s24 10 24 25c0 3-1 5-2 5-2-9-6-13-10-14-5 4-20 6-30 2-3 3-4 7-4 12-1 0-2-2-2-5z" fill="${c}"/>`;
    case 'curly':
      return `<g fill="${c}"><circle cx="42" cy="34" r="10"/><circle cx="56" cy="27" r="11"/><circle cx="70" cy="30" r="10"/><circle cx="80" cy="40" r="9"/><circle cx="38" cy="46" r="8"/><circle cx="83" cy="50" r="8"/></g>
              <g fill="${d}" opacity=".5"><circle cx="50" cy="30" r="4"/><circle cx="74" cy="36" r="4"/></g>`;
    case 'locs':
      return `<path d="M36 48c0-16 11-27 24-27s24 11 24 27v2H36z" fill="${c}"/>
              <g fill="${c}"><rect x="33" y="44" width="6" height="40" rx="3"/><rect x="42" y="48" width="6" height="34" rx="3"/><rect x="72" y="48" width="6" height="34" rx="3"/><rect x="81" y="44" width="6" height="40" rx="3"/></g>
              <g fill="${d}" opacity=".55"><rect x="33" y="60" width="6" height="4" rx="2"/><rect x="81" y="60" width="6" height="4" rx="2"/><rect x="42" y="64" width="6" height="4" rx="2"/><rect x="72" y="64" width="6" height="4" rx="2"/></g>`;
    case 'puffs':
      return `<path d="M37 47c0-14 10-24 23-24s23 10 23 24v2H37z" fill="${c}"/>
              <circle cx="31" cy="36" r="13" fill="${c}"/><circle cx="89" cy="36" r="13" fill="${c}"/>
              <circle cx="28" cy="33" r="5" fill="${d}" opacity=".45"/><circle cx="86" cy="33" r="5" fill="${d}" opacity=".45"/>`;
    case 'fade':
    default:
      return `<path d="M38 46c0-14 10-23 22-23s22 9 22 23c0 2 0 4-1 4-3-7-8-11-12-12-6 3-16 4-24 1-4 2-6 5-6 11-1 0-1-2-1-4z" fill="${c}"/>
              <path d="M38 48c2-4 6-6 10-6h24c4 0 8 2 10 6z" fill="${d}" opacity=".6"/>`;
  }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const cl = v => Math.max(0, Math.min(255, v));
  const r = cl((n >> 16) + amt), g = cl(((n >> 8) & 255) + amt), b = cl((n & 255) + amt);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/* body silhouette varies a little by chosen gender, purely cosmetic */
function bodyPath(gender) {
  if (gender === 'girl') return 'M60 84c-14 0-22 8-24 20l-4 30c-1 6 3 10 9 10h38c6 0 10-4 9-10l-4-30c-2-12-10-20-24-20z';
  if (gender === 'boy')  return 'M60 84c-14 0-23 8-23 20v36c0 2 2 4 4 4h38c2 0 4-2 4-4v-36c0-12-9-20-23-20z';
  return 'M60 84c-14 0-23 8-23 20v34c0 3 2 6 5 6h36c3 0 5-3 5-6v-34c0-12-9-20-23-20z';
}

/* ---------- gear layers ---------- */
function gearSVG(slot, id, A) {
  if (!id) return '';
  const accent = '#facc15';
  switch (id) {
    /* --- face --- */
    case 'goggles':
      return `<g><rect x="38" y="42" width="44" height="6" rx="3" fill="#3f3f46"/>
        <circle cx="50" cy="45" r="10" fill="#22d3ee" opacity=".75" stroke="#3f3f46" stroke-width="3"/>
        <circle cx="70" cy="45" r="10" fill="#22d3ee" opacity=".75" stroke="#3f3f46" stroke-width="3"/></g>`;
    case 'visor':
      return `<g><rect x="34" y="40" width="52" height="14" rx="7" fill="#0f172a" stroke="#22d3ee" stroke-width="2"/>
        <text x="60" y="50" font-size="8" fill="#22d3ee" text-anchor="middle" font-family="monospace">10110</text></g>`;
    /* --- head --- */
    case 'beanie':
      return `<g><path d="M36 42c0-14 11-23 24-23s24 9 24 23z" fill="#7c3aed"/>
        <rect x="34" y="40" width="52" height="9" rx="4" fill="#a855f7"/>
        <path d="M40 34h40" stroke="#22d3ee" stroke-width="2" opacity=".8"/></g>`;
    case 'headset':
      return `<g><path d="M36 44a24 22 0 0 1 48 0" stroke="#3f3f46" stroke-width="5" fill="none"/>
        <rect x="30" y="42" width="9" height="16" rx="4" fill="#a855f7"/>
        <rect x="81" y="42" width="9" height="16" rx="4" fill="#a855f7"/>
        <path d="M34 58c0 8 8 10 12 10" stroke="#3f3f46" stroke-width="3" fill="none"/>
        <circle cx="47" cy="68" r="3" fill="#22d3ee"/></g>`;
    case 'hardhat':
      return `<g><path d="M34 46c0-15 12-25 26-25s26 10 26 25z" fill="#f59e0b"/>
        <rect x="30" y="44" width="60" height="7" rx="3.5" fill="#d97706"/>
        <rect x="57" y="22" width="6" height="24" rx="3" fill="#fbbf24"/></g>`;
    case 'crown':
      return `<g><path d="M34 40l6-22 12 13 8-19 8 19 12-13 6 22z" fill="${accent}" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/>
        <rect x="34" y="38" width="52" height="9" rx="3" fill="#eab308" stroke="#b45309" stroke-width="2"/>
        <circle cx="46" cy="42" r="3" fill="#ef4444"/><circle cx="60" cy="42" r="3.5" fill="#22d3ee"/><circle cx="74" cy="42" r="3" fill="#22c55e"/>
        <circle cx="60" cy="16" r="3.5" fill="#fff"/></g>`;
    /* --- body --- */
    case 'hoodie':
      return `<g><path d="${bodyPath(A.gender)}" fill="#334155"/>
        <path d="M46 86c4 10 24 10 28 0l4 3c-6 14-30 14-36 0z" fill="#1e293b"/>
        <rect x="57" y="96" width="6" height="26" rx="3" fill="#1e293b"/></g>`;
    case 'labcoat':
      return `<g><path d="${bodyPath(A.gender)}" fill="#f8fafc"/>
        <path d="M60 84v60" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="68" y="108" width="12" height="10" rx="2" fill="#e2e8f0"/>
        <rect x="70" y="104" width="3" height="8" rx="1.5" fill="#a855f7"/></g>`;
    case 'jacket':
      return `<g><path d="${bodyPath(A.gender)}" fill="#1e3a8a"/>
        <path d="M60 84 46 96v48h-9V104c0-12 9-20 23-20z" fill="#1d4ed8"/>
        <path d="M60 84l14 12v48h9V104c0-12-9-20-23-20z" fill="#1d4ed8"/>
        <circle cx="74" cy="104" r="3" fill="${accent}"/><circle cx="74" cy="116" r="3" fill="${accent}"/></g>`;
    case 'sash':
      return `<g><path d="${bodyPath(A.gender)}" fill="${A.outfit}"/>
        <path d="M42 88l40 46-9 7-40-46z" fill="#22c55e" opacity=".95"/>
        <circle cx="70" cy="120" r="8" fill="${accent}" stroke="#b45309" stroke-width="2"/>
        <text x="70" y="124" font-size="9" text-anchor="middle" fill="#7c2d12" font-family="sans-serif" font-weight="bold">RAI</text></g>`;
    case 'vest':
      return `<g><path d="${bodyPath(A.gender)}" fill="${A.outfit}"/>
        <path d="M44 90h12v54H41v-40c0-6 1-11 3-14z" fill="#3f6212"/>
        <path d="M76 90H64v54h15v-40c0-6-1-11-3-14z" fill="#3f6212"/>
        <rect x="44" y="112" width="11" height="8" rx="2" fill="#65a30d"/>
        <rect x="65" y="112" width="11" height="8" rx="2" fill="#65a30d"/></g>`;
    /* --- hand --- */
    case 'wand':
      return `<g><rect x="88" y="86" width="4" height="40" rx="2" fill="#78350f" transform="rotate(12 90 106)"/>
        <circle cx="94" cy="84" r="7" fill="#c084fc"/>
        <circle cx="94" cy="84" r="12" fill="#c084fc" opacity=".3"/>
        <path d="M94 70v-7M94 105v7M80 84h-7M108 84h7" stroke="#e9d5ff" stroke-width="2" stroke-linecap="round"/></g>`;
    case 'wrench':
      return `<g transform="rotate(20 96 110)"><rect x="93" y="94" width="6" height="32" rx="3" fill="#94a3b8"/>
        <path d="M96 88a8 8 0 1 0 0 12 8 8 0 0 0 0-12zm0 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z" fill="#cbd5e1"/></g>`;
    case 'anchor':
      return `<g><rect x="94" y="92" width="4" height="30" rx="2" fill="#475569"/>
        <circle cx="96" cy="88" r="5" fill="none" stroke="#475569" stroke-width="3"/>
        <path d="M82 112c0 10 6 14 14 14s14-4 14-14" fill="none" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
        <rect x="86" y="96" width="20" height="4" rx="2" fill="#475569"/></g>`;
    case 'torch':
      return `<g><rect x="94" y="96" width="5" height="30" rx="2.5" fill="#78350f"/>
        <path d="M96 78c8 8 10 12 10 16a10 10 0 0 1-20 0c0-6 6-10 10-16z" fill="#f59e0b"/>
        <path d="M96 86c4 4 5 7 5 9a5 5 0 0 1-10 0c0-3 3-5 5-9z" fill="#fef08a"/></g>`;
    case 'tablet':
      return `<g><rect x="82" y="92" width="26" height="34" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
        <rect x="86" y="97" width="18" height="3" rx="1.5" fill="#22d3ee"/>
        <rect x="86" y="104" width="14" height="3" rx="1.5" fill="#64748b"/>
        <rect x="86" y="111" width="16" height="3" rx="1.5" fill="#64748b"/>
        <rect x="86" y="118" width="10" height="3" rx="1.5" fill="#a855f7"/></g>`;
    /* --- side companions --- */
    case 'drone':
      return `<g><ellipse cx="22" cy="80" rx="13" ry="10" fill="#475569"/>
        <circle cx="22" cy="80" r="5" fill="#22d3ee"/>
        <rect x="6" y="70" width="14" height="3" rx="1.5" fill="#94a3b8"/>
        <rect x="24" y="70" width="14" height="3" rx="1.5" fill="#94a3b8"/>
        <circle cx="10" cy="70" r="4" fill="#cbd5e1" opacity=".6"/><circle cx="34" cy="70" r="4" fill="#cbd5e1" opacity=".6"/></g>`;
    case 'robopet':
      return `<g><rect x="8" y="118" width="30" height="20" rx="7" fill="#64748b"/>
        <rect x="4" y="110" width="18" height="16" rx="6" fill="#94a3b8"/>
        <circle cx="10" cy="117" r="2.5" fill="#22d3ee"/>
        <rect x="12" y="136" width="5" height="10" rx="2.5" fill="#475569"/>
        <rect x="29" y="136" width="5" height="10" rx="2.5" fill="#475569"/>
        <path d="M38 122l8-8" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/></g>`;
    /* --- cape --- */
    case 'cape':
      return `<path d="M42 88c-10 4-16 14-18 28l-4 34h28l-6-62zM78 88c10 4 16 14 18 28l4 34H72l6-62z" fill="#b91c1c" opacity=".92"/>`;
    case 'scarf':
      return `<g><path d="M42 86c10 8 26 8 36 0l2 8c-12 9-28 9-40 0z" fill="#0891b2"/>
        <path d="M76 94l10 26-8 3-8-25z" fill="#0e7490"/></g>`;
    /* --- aura --- */
    case 'halo':
      return `<g><ellipse cx="60" cy="14" rx="20" ry="5" fill="none" stroke="${accent}" stroke-width="4"/>
        <ellipse cx="60" cy="14" rx="20" ry="5" fill="none" stroke="#fef9c3" stroke-width="1.5"/></g>`;
    case 'sparks':
      return `<g fill="#22d3ee" opacity=".9">
        <path d="M20 40l2.5 6 6 2.5-6 2.5L20 57l-2.5-6-6-2.5 6-2.5z"/>
        <path d="M100 56l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>
        <path d="M96 30l1.5 4 4 1.5-4 1.5L96 41l-1.5-4-4-1.5 4-1.5z"/></g>`;
    default: return '';
  }
}

/* ============================================================
   RENDER
   ============================================================ */
function renderAvatar(A, size) {
  size = size || 180;
  const skin = A.skin, dark = shade(skin, -34);
  const g = A.gear || {};
  const hasBody = g.body && GEAR[g.body];

  return `
<svg viewBox="0 0 120 180" width="${size}" height="${size * 1.5}" role="img"
     aria-label="Your AI engineer character" class="avatar-svg">
  <defs>
    <clipPath id="headclip"><circle cx="60" cy="48" r="23"/></clipPath>
  </defs>

  ${gearSVG('aura', g.aura, A)}
  ${gearSVG('side', g.side, A)}
  ${gearSVG('cape', g.cape, A)}

  <!-- legs -->
  <rect x="45" y="138" width="12" height="32" rx="6" fill="${shade(A.outfit, -45)}"/>
  <rect x="63" y="138" width="12" height="32" rx="6" fill="${shade(A.outfit, -45)}"/>
  <rect x="42" y="164" width="18" height="9" rx="4" fill="#1f2937"/>
  <rect x="60" y="164" width="18" height="9" rx="4" fill="#1f2937"/>

  <!-- torso: either plain outfit or gear outfit -->
  ${hasBody ? gearSVG('body', g.body, A) : `<path d="${bodyPath(A.gender)}" fill="${A.outfit}"/>`}

  <!-- arms -->
  <rect x="28" y="90" width="11" height="42" rx="5.5" fill="${hasBody ? shade(A.outfit, -10) : A.outfit}"/>
  <rect x="81" y="90" width="11" height="42" rx="5.5" fill="${hasBody ? shade(A.outfit, -10) : A.outfit}"/>
  <circle cx="33.5" cy="134" r="6" fill="${skin}"/>
  <circle cx="86.5" cy="134" r="6" fill="${skin}"/>

  <!-- neck + head -->
  <rect x="54" y="66" width="12" height="14" rx="5" fill="${dark}"/>
  <circle cx="60" cy="48" r="23" fill="${skin}"/>

  <!-- hair -->
  <g clip-path="none">${hairSVG(A.hair, A.hairColor)}</g>

  <!-- face -->
  <circle cx="52" cy="48" r="2.6" fill="#1c1917"/>
  <circle cx="68" cy="48" r="2.6" fill="#1c1917"/>
  <circle cx="53" cy="47" r="0.9" fill="#fff"/>
  <circle cx="69" cy="47" r="0.9" fill="#fff"/>
  <path d="M53 57c3 3.5 11 3.5 14 0" stroke="#7c2d12" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="44" cy="54" rx="3.5" ry="2.4" fill="#fb7185" opacity=".28"/>
  <ellipse cx="76" cy="54" rx="3.5" ry="2.4" fill="#fb7185" opacity=".28"/>

  ${gearSVG('face', g.face, A)}
  ${gearSVG('head', g.head, A)}
  ${gearSVG('hand', g.hand, A)}
</svg>`;
}

/* small icon-only preview of one gear item, for the reward cards */
function renderGearPreview(id, A) {
  const item = GEAR[id];
  const test = Object.assign({}, A, { gear: Object.assign({}, A.gear) });
  test.gear[item.slot] = id;
  return renderAvatar(test, 90);
}

window.AVATAR_SYS = { SKINS, HAIRCOLORS, OUTFITS, GENDERS, HAIRSTYLES, GEAR, REWARDS, renderAvatar, renderGearPreview };
