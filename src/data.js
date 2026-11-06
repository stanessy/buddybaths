// Buddy Baths, all site copy in one place. Edit here, then `node build.js`.
// Cloned from the Buddy Fence / Buddy Tile sites (same generator, same brand system).
// The manufacturer is not named anywhere on the site (Stan, 2026-11-05). Product
// photos and material claims come from the manufacturer's dealer content.

const SITE = {
  name: 'Buddy Baths',
  domain: 'https://buddybaths.com',
  tagline: 'One-Day Showers & Custom Bathrooms.',
  phone: process.env.BB_PHONE || '(360) 899-6336',
  email: 'info@buddybaths.com',
  // Platform API, the lead form posts straight into the Buddy Built CRM
  apiBase: 'https://buddybuilt.com',
  // "Buddy Baths" division in the platform. main.js resolves the id at runtime
  // from /api/public/divisions by this slug, so dev and prod never drift.
  divisionSlug: 'baths',
  accent: '#4AA1B4',
  navy: '#04243A',
  // Acorn Finance dealer pre-qual link (blocks iframing, always open a new tab)
  acornUrl: 'https://www.acornfinance.com/pre-qualify/?d=2T7C4&utm_medium=web_pre_qual_link_copy_welcome',
  legalLine:
    'Buddy Baths is a registered trade name of Buddy Built LLC · WA reg #BUDDYBL746MO · OR CCB #263768',
  serviceAreaBlurb: 'Serving Vancouver, Portland, and the surrounding metro, Washington and Oregon.',
  manufacturer: {
    blurb: 'Our shower and bath systems are made in the USA: non-porous high-tech polymer and PuroStone walls, built to order for your bathroom, with a lifetime warranty on every system.',
  },
  // The one-day promise, worded the way we can stand behind it
  oneDayNote: 'One-day installation available for qualifying projects. Ordering, scheduling, and repairs may add time.',
};

const SERVICES = [
  {
    slug: 'shower-replacement',
    name: 'Shower Replacement',
    short: 'Showers',
    h1: 'One-Day Shower Replacement',
    metaTitle: 'One-Day Shower Replacement | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Replace your worn-out shower with a new base, wall system, and glass, installed in as little as one day. Free in-home estimates in Vancouver WA and Portland OR.',
    intro:
      'A shower replacement swaps the whole stall, base, walls, and door, for a new system measured to your space. No tile, no grout lines, no weeks of dust. Our crew removes the old shower in the morning and most qualifying projects are ready to use the next day.',
    bullets: [
      'Old shower removed and hauled away the same day',
      'New base with a built-in slope and a slip-resistant floor',
      'Seamless wall system in your choice of color and pattern, no grout',
      'Sliding or swinging glass door in matte black, nickel, bronze, or chrome',
      'Shelves, seats, and grab bars built in, not bolted on later',
    ],
    faqs: [
      { q: 'How much does a shower replacement cost in Vancouver WA?', a: 'Most one-day shower replacements run $9,000-$17,000 installed, depending on size, wall finish, glass style, and whether the plumbing moves. Your written in-home estimate is free and the price does not change unless you change the plan.' },
      { q: 'Is a one-day shower really done in one day?', a: 'For most straight swaps, yes: tear-out in the morning, new base and walls by afternoon, door hung before we leave. Projects that need plumbing or subfloor repair, or a special-order color, can add a day or two. We tell you the timeline before you sign.' },
      { q: 'What are the walls made of?', a: 'Our wall systems are a non-porous high-tech polymer that resists chips, stains, mold, and mildew. There is no grout to scrub and no tile to crack. Every system carries a lifetime warranty.' },
      { q: 'Can I pick the color and tile pattern?', a: 'Yes. Choose from 30 colors and finishes and 17 laser-etched patterns like subway, herringbone, and hexagonal, plus glass and hardware finishes. See the Design Options page for the full list.' },
    ],
    photo: 'shower-replacement.jpg',
    icon: 'shower',
  },
  {
    slug: 'tub-to-shower-conversion',
    name: 'Tub-to-Shower Conversions',
    short: 'Bath Conversions',
    h1: 'Tub-to-Shower Conversion',
    metaTitle: 'Tub-to-Shower Conversion in One Day | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Turn an old bathtub into a walk-in shower in as little as one day. Low thresholds, built-in seats, and grab bars. Free in-home estimates in Vancouver WA and Portland OR.',
    intro:
      'If nobody takes baths anymore, the tub is just a wall you climb over twice a day. We pull the tub, set a low-threshold shower base in its footprint, and finish the walls and glass, usually in a single day. Same plumbing location, no permits for a straight conversion, and a bathroom that finally works for how you live.',
    bullets: [
      'Tub removed and a shower base fitted to the same 60" footprint',
      'Low threshold for an easy step in, or barrier-free on request',
      'Seamless wall system to the ceiling, no grout, no tile',
      'Built-in seat, corner shelves, and grab bars where you want them',
      'Sliding glass door or a curtain rod, your call',
    ],
    faqs: [
      { q: 'How much does a tub-to-shower conversion cost?', a: 'Most conversions run $9,000-$17,000 installed, depending on the wall finish, glass, and accessories like seats and grab bars. The free in-home estimate puts the exact number in writing.' },
      { q: 'Will converting my tub hurt resale value?', a: 'Not if the home keeps at least one tub. For a hall bath in a one-bath home we will say so honestly. For a primary bath, most buyers prefer the walk-in shower.' },
      { q: 'Do I need a permit?', a: 'A straight tub-to-shower swap that keeps the drain and valve in place usually does not need a permit in Vancouver or Portland. If the plumbing moves, we handle the permit.' },
    ],
    photo: 'tub-to-shower-conversion.jpg',
    icon: 'bath',
  },
  {
    slug: 'walk-in-showers',
    name: 'Walk-In & Low-Threshold Showers',
    short: 'Walk-In Showers',
    h1: 'Walk-In & Low-Threshold Showers',
    metaTitle: 'Walk-In Showers & Low-Threshold Showers | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Open, easy-entry walk-in showers with low or zero thresholds, built-in seats, and clean modern lines. Installed in as little as one day in Vancouver WA and Portland OR.',
    intro:
      'A walk-in shower is the modern bathroom, and it is also the safest one. Low or barrier-free thresholds, a wide opening, a built-in bench, and smooth walls that wipe clean. We build them from one-piece bases and seamless wall systems, so there is nothing to leak and nothing to regrout.',
    bullets: [
      'Low-threshold and barrier-free base options',
      'Wide openings with a fixed glass panel or full enclosure',
      'Built-in bench seats and corner shelves',
      'Hand-held and rain shower heads in matching finishes',
      'Slip-resistant floor pattern molded into the base',
    ],
    faqs: [
      { q: 'What is the difference between low-threshold and barrier-free?', a: 'A low-threshold base has a short lip, about 1 to 3 inches, that keeps water in with a standard door. A barrier-free base sits flush with the floor for a walker or wheelchair and uses a collapsible water dam or a trench drain.' },
      { q: 'Can a walk-in shower be installed in one day?', a: 'Most can, when the plumbing stays put. Barrier-free showers sometimes need the subfloor recessed, which adds a day. We confirm the timeline at the estimate.' },
    ],
    photo: 'walk-in-shower.jpg',
    icon: 'door',
  },
  {
    slug: 'shower-doors',
    name: 'Shower Doors & Enclosures',
    short: 'Doors & Glass',
    h1: 'Shower Doors & Glass Enclosures',
    metaTitle: 'Shower Doors & Glass Enclosures | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Sliding and swinging shower doors in clear, rain, frosted, or patterned glass with matte black, nickel, bronze, or chrome hardware. Installed in Vancouver WA and Portland OR.',
    intro:
      'The glass is what you see first. We install sliding and swinging enclosures in 1/4", 5/16", and 3/8" glass, clear or obscured, with hardware in matte black, brushed nickel, oil-rubbed bronze, or chrome. Every door is measured to your opening and hung plumb, so it glides and seals for years.',
    bullets: [
      'Sliding bypass doors for tub and 60" shower openings',
      'Swinging and pivot doors for walk-in showers',
      'Clear, rain, frosted, and corrugated glass finishes',
      'V-groove patterns: arrow, hopscotch, roman block, vertical block',
      'Matte black, brushed nickel, oil-rubbed bronze, and chrome hardware',
    ],
    faqs: [
      { q: 'Can you replace just my shower door?', a: 'Yes. If the base and walls are sound, a new door or enclosure is a half-day job. We measure the opening and order the glass to fit.' },
      { q: 'Which glass is easiest to keep clean?', a: 'Clear glass shows water spots the most. Rain and frosted glass hide them and still let light in. A quick squeegee after each shower keeps any of them looking new.' },
    ],
    photo: 'shower-doors-glass.jpg',
    icon: 'glass',
  },
  {
    slug: 'wall-systems',
    name: 'Wall Systems & PuroStone',
    short: 'Wall Systems',
    h1: 'Shower Wall Systems & PuroStone',
    metaTitle: 'Grout-Free Shower Wall Systems & PuroStone | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Seamless, grout-free shower walls in 30 colors and 17 laser-etched tile patterns, or PuroStone engineered stone. Lifetime warranty. Vancouver WA and Portland OR.',
    intro:
      'This is the part that replaces tile. Large, seamless wall panels in marble, travertine, concrete, and solid colors, laser-etched with subway, herringbone, hexagonal, and other patterns that look like real tile without a single grout line. Or step up to PuroStone, an engineered stone surface that is warm to the touch, matte, and GREENGUARD certified.',
    bullets: [
      '30 colors and finishes, from Calcutta Marble to Carbon Ash Concrete',
      '17 laser-etched patterns: 3x6 and 4x12 subway, herringbone, hexagonal, chevron, and more',
      'PuroStone in Tundra, Stratus, Coastal Mist, Sahara, and Marbled Ash',
      'Non-porous surface resists mold, mildew, chips, and stains',
      'Cleans with mild soap and water, never needs sealing',
      'Lifetime warranty from the manufacturer',
    ],
    faqs: [
      { q: 'Do the wall panels look like plastic?', a: 'No. The patterns are laser-etched into a thick polymer panel with realistic stone and tile texture. Most visitors assume it is tile until they look for grout lines.' },
      { q: 'What is PuroStone?', a: 'PuroStone is an engineered stone wall surface. It has a matte finish, stays warm to the touch, resists stains, scratches, heat, and moisture, and is GREENGUARD certified for indoor air quality. It comes in five natural stone colors.' },
      { q: 'How do I clean a grout-free shower?', a: 'Mild soap and water. There is no grout to seal, no caulk lines to scrub, and the non-porous surface does not give mold anywhere to grow.' },
    ],
    photo: 'wall-systems.jpg',
    icon: 'layers',
  },
  {
    slug: 'accessible-showers',
    name: 'Accessible & Safety Showers',
    short: 'Accessible Showers',
    h1: 'Accessible & Safety Showers',
    metaTitle: 'Accessible Showers, Grab Bars & Barrier-Free Bathing | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Barrier-free showers, built-in seats, grab bars, and hand-held fixtures for aging in place. Installed in as little as one day in Vancouver WA and Portland OR.',
    intro:
      'Staying in the home you love starts in the bathroom. We build showers with no step to trip on, a seat you can transfer to, grab bars anchored into blocking, and a hand-held shower head within reach. It looks like a modern bathroom, because it is one.',
    bullets: [
      'Barrier-free and low-threshold bases',
      'Fold-down and built-in bench seats',
      'Grab bars anchored into solid blocking, placed where you reach',
      'Hand-held shower heads on slide bars',
      'Slip-resistant floor molded into the base',
      'Walk-in tubs available on request',
    ],
    faqs: [
      { q: 'Will it look like a hospital bathroom?', a: 'No. Grab bars come in the same matte black, nickel, and bronze finishes as the door hardware, seats are molded into the wall system, and the base is flush with the floor. Safety is built in, not bolted on.' },
      { q: 'Do you work with VA or insurance programs?', a: 'Yes. We provide written scopes and itemized estimates for VA, L&I, and insurance-funded bathroom modifications. Ask at the estimate and we will handle the paperwork.' },
    ],
    photo: 'accessible-shower.jpg',
    icon: 'shield',
  },
  {
    slug: 'bathtub-replacement',
    name: 'New Bathtubs & Tub Replacement',
    short: 'Bathtubs',
    h1: 'Bathtub Replacement',
    metaTitle: 'Bathtub Replacement in One Day | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Replace a stained, chipped bathtub with a new tub and seamless wall surround in as little as one day. Free in-home estimates in Vancouver WA and Portland OR.',
    intro:
      'A tub that is chipped, yellowed, or refinished one too many times does not need a full remodel. We remove it, set a new tub in the same footprint, and finish the walls with a seamless surround, in a day for most homes. Keep the tub for the kids, and get a bathroom that looks new.',
    bullets: [
      'New soaking or standard tubs fitted to the existing 60" alcove',
      'Seamless wall surround in your choice of color and pattern',
      'Sliding glass tub door or curtain rod',
      'New fixtures in matching finishes',
      'Old tub and walls hauled away the same day',
    ],
    faqs: [
      { q: 'Should I refinish my tub or replace it?', a: 'Refinishing lasts 3 to 5 years and can be done once or twice. If the tub has been refinished before, or the walls around it are failing, replacement costs more up front and is the last time you deal with it.' },
      { q: 'How long does a tub replacement take?', a: 'Most alcove tub replacements with a new surround are done in one day. If the drain needs to move or the subfloor is soft, plan on two.' },
    ],
    photo: 'bathtub-replacement.jpg',
    icon: 'bath',
  },
];

// ---- Custom path: hand-built tile showers and full remodels (2026-11-05) ----
// Copy adapted from the Buddy Tile site; Buddy Baths now owns all bathroom work.
const CUSTOM_SERVICES = [
  {
    slug: 'custom-tile-showers', path: 'custom',
    name: 'Custom Tile Showers',
    short: 'Tile showers',
    h1: 'Custom Tile Showers',
    metaTitle: 'Custom Tile Showers | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Custom tile showers built right: RedGard waterproofing, curbless options, niches, benches, and glass. Free in-home design visits in Vancouver WA and Portland OR.',
    intro:
      'The shower is the hardest room in the house to get right, and the most expensive to get wrong. We build tile showers on proper waterproofing systems, not shortcuts: a full RedGard liquid membrane, flood-tested pans, and tile set to industry standards, any tile and any layout you want.',
    bullets: [
      'RedGard liquid-membrane waterproofing with a flood test before tile',
      'Any tile, any layout: large format, mosaics, natural stone, herringbone',
      'Curbless and walk-in entries, linear or center drains',
      'Niches, benches, corner shelves, and grab bars planned before demo',
      'Heated floors and glass enclosures coordinated by one crew',
    ],
    faqs: [
      { q: 'How much does a custom tile shower cost in Vancouver WA?', a: 'Most full tile showers run $7,000-$10,500 for labor and waterproofing, depending on size and features like niches, benches, or curbless entries. Finish tile is priced with your selections, and your written in-home estimate is free.' },
      { q: 'How long does a custom tile shower take?', a: 'Most showers run 5-8 working days from demo to grout: tear-out, waterproofing with a flood test, tile, then grout and seal. If you need it faster and like a seamless look, ask about our one-day shower systems.' },
      { q: 'What waterproofing do you use?', a: 'RedGard. Every shower gets a full liquid membrane over cement board, a flood-tested pan, and photos of the waterproofing before tile covers it.' },
      { q: 'Can you convert my tub to a custom tile shower?', a: 'Yes. We remove the tub, rebuild the wet area with proper waterproofing, and tile a walk-in or curbless shower, usually within a week or two.' },
    ],
    photo: 'custom-tile-shower.jpg',
    icon: 'grid',
  },
  {
    slug: 'full-bathroom-remodels', path: 'custom',
    name: 'Full Bathroom Remodels',
    short: 'Full remodels',
    h1: 'Full Bathroom Remodels',
    metaTitle: 'Full Bathroom Remodels | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Whole-bathroom remodels by one crew: tile showers, floors, vanities, fixtures, lighting, and paint, on one schedule and one invoice. Free in-home design visits in Vancouver WA and Portland OR.',
    intro:
      'A full remodel is every surface and fixture in the room, done in the right order by one crew. We handle demo, plumbing and electrical through our Buddy Built trades, waterproofing, tile, vanity, fixtures, lighting, and paint, with daily progress photos to your phone.',
    bullets: [
      'One written scope and price for the whole room before demo',
      'Tile showers and floors on flood-tested waterproofing',
      'Vanities, countertops, toilets, fixtures, and lighting installed',
      'Plumbing, electrical, drywall, and paint through the Buddy Built family',
      'Daily progress photos and a final walkthrough with the lead',
    ],
    faqs: [
      { q: 'How much does a full bathroom remodel cost?', a: 'Full remodels are priced from a written scope, because tile, vanity, fixtures, and any plumbing or wall changes drive the number. Your free in-home design visit produces that scope and price the same day, and it does not change unless you change the plan.' },
      { q: 'How long does a bathroom remodel take?', a: 'Most hall and primary bath remodels run two to four weeks from demo to final walkthrough. You get a written schedule before we start and daily photos while we work.' },
      { q: 'Do you handle plumbing and electrical?', a: 'Yes. Buddy Baths is part of Buddy Built, so plumbing, electrical, drywall, and paint come from our own trades, on one schedule and one invoice.' },
    ],
    photo: 'full-bathroom-remodel.jpg',
    icon: 'home',
  },
  {
    slug: 'bathroom-tile', path: 'custom',
    name: 'Bathroom Floor & Wall Tile',
    short: 'Floor & wall tile',
    h1: 'Bathroom Floor & Wall Tile Installation',
    metaTitle: 'Bathroom Tile Installation | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Bathroom floor and wall tile installed flat, level, and sealed: large format, mosaics, and natural stone. Free in-home estimates in Vancouver WA and Portland OR.',
    intro:
      'Bathroom tile lives in the wettest room in the house. We prep the substrate properly, with self-leveling and uncoupling membranes where they belong, so your floor stays flat and your grout lines stay tight for decades.',
    bullets: [
      'Large-format porcelain, mosaics, and natural stone',
      'Substrate prep: self-leveler, uncoupling membrane, crack isolation',
      'Heated floor systems installed under the tile',
      'Baseboard, trim, and transitions finished clean',
    ],
    faqs: [
      { q: 'How much does bathroom floor tile cost installed?', a: 'Figure roughly $16 per square foot for labor and prep on most bathroom floors, with a $900 minimum. A typical hall bath floor lands between $900 and $1,600 before tile selection. Heated floor systems add about $950.' },
      { q: 'Can you install large-format tile?', a: 'Yes, large format is most of what we set. It needs flatter substrates, so we self-level and use uncoupling membranes where the floor calls for it.' },
      { q: 'Do you level the floor first?', a: 'Every floor gets checked with a straightedge before tile. If it needs self-leveler or crack isolation, that goes in your estimate up front, not as a surprise later.' },
    ],
    photo: 'bathroom-tile.jpg',
    icon: 'rows',
  },
  {
    slug: 'heated-floors', path: 'custom',
    name: 'Heated Tile Floors',
    short: 'Heated floors',
    h1: 'Heated Tile Floor Installation',
    metaTitle: 'Heated Tile Floors | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription:
      'Electric radiant heat under new tile floors with programmable thermostats. Installed with the tile as one project, one crew, one warranty.',
    intro:
      "In the Northwest, a heated bathroom floor is the upgrade people say they'd do again first. We install electric radiant systems under the tile as one project, mat, thermostat, and floor, so there's one crew and one warranty.",
    bullets: [
      'Electric radiant mats sized to your room',
      'Programmable and smart thermostats',
      'Installed with uncoupling membranes the right way',
      'Adds comfort and resale value for a modest add-on cost',
    ],
    faqs: [
      { q: 'How much does a heated tile floor cost to add?', a: 'Adding electric radiant heat to a bathroom floor we are already tiling typically runs about $950-$1,400 including the thermostat, depending on room size.' },
      { q: 'How much does a heated floor cost to run?', a: 'A typical bathroom mat draws about as much as a hair dryer while warming up, and a programmable thermostat only runs it when you use the room. Most homeowners see a few dollars a month.' },
      { q: 'Can you add heat under my existing tile?', a: 'The mat has to go under the tile, so heat gets added when a floor is being redone, which is why we always ask about it before a floor project starts.' },
    ],
    photo: 'heated-floors.jpg',
    icon: 'sparkles',
  },
  {
    slug: 'waterproofing', path: 'custom',
    name: 'Shower Waterproofing',
    short: 'Waterproofing',
    h1: 'Shower Waterproofing Done Right',
    metaTitle: 'Shower Waterproofing (RedGard Liquid Membrane) | Buddy Baths',
    metaDescription:
      'Waterproofing is the part of a shower you never see and can never skip. RedGard liquid membrane over cement board, installed and flood-tested.',
    intro:
      "Tile and grout are not waterproof. The membrane behind them is. Most shower failures we're called to fix were tiled beautifully over nothing. We build the system: membrane, pan, drain, seams, and a flood test before a single tile goes up.",
    bullets: [
      'RedGard liquid membrane over cement board, rolled to the rated thickness',
      'Flood-tested pans before tile, every time',
      'Fix-it work: we diagnose and rebuild failed showers',
      'Photos of the membrane before it disappears behind tile',
    ],
    faqs: [
      { q: 'How do I know if my shower is leaking behind the tile?', a: 'Soft baseboards, a musty smell, cracked or dark grout lines, and hollow-sounding tile are the common signs. We diagnose honestly. Sometimes it is a $400 regrout, sometimes the pan has failed.' },
      { q: 'Is grout waterproof?', a: 'No, grout and tile both pass moisture. The membrane behind them does the waterproofing, which is why we photograph and flood-test it before tile ever goes up.' },
      { q: 'Can you fix just the shower pan?', a: 'Sometimes. If the wall membrane is sound we can rebuild the pan alone. If the system behind the walls has failed, we will show you the evidence and price the honest fix.' },
    ],
    photo: 'waterproofing.jpg',
    icon: 'droplet',
  },
];
SERVICES.forEach((x) => { x.path = x.path || 'one-day'; });
SERVICES.push(...CUSTOM_SERVICES);

// ---- The two paths + the home chooser. Each config drives one full page. ----
const PATHS = {
  'one-day': {
    key: 'one-day', url: '/one-day-showers/', name: 'One-Day Showers', label: 'One-day', blurb: 'Fast and clean',
    metaTitle: 'One-Day Shower Replacement & Tub-to-Shower Conversions | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription: 'A new shower in as little as one day. Shower replacements, tub-to-shower conversions, walk-in showers, and glass doors in Vancouver WA and Portland OR. Grout-free walls, lifetime warranty, free in-home estimates.',
    hero: {
      photo: 'hero-one-day-shower.jpg', h1a: 'A NEW SHOWER.', h1b: 'IN AS LITTLE AS ONE DAY.',
      tags: ['Shower Replacements', 'Tub-to-Shower', 'Walk-In', 'Glass'],
      points: [['clock', 'Installed in a day', 'Qualifying projects, out the door by evening'], ['layers', 'Easy-care walls', 'Grout-free panels, lifetime warranty'], ['hammer', 'Professional installation', 'Licensed crews in WA + OR']],
      cta: 'Design Your Shower →', ctaHref: '/design-options/',
      cardH3: "Let's plan your new shower.", cardSub: 'We measure your bathroom and bring the samples. Your written price arrives the same day.',
    },
    intro: {
      eyebrow: 'Showers built for how you live', h2: ["A shower you'll love, without the ", 'weeks of remodel.'],
      p1: 'Buddy Baths one-day showers are measured to your bathroom and built before we arrive. We replace showers, convert tubs into walk-in showers, and install new glass doors, with seamless grout-free wall systems made in the USA.',
      p2: 'Most installs start in the morning and finish the same day, and the old shower leaves with us. Want tile instead? Our custom crews build those too.',
      photo: 'intro-shower-install.jpg', caption: 'Seamless wall panels, a low-threshold base, and a sliding glass door, installed in a day.',
    },
    trust2: [['award', 'Lifetime warranty'], ['shield', 'Made in the USA'], ['sparkles', 'Grout-free walls'], ['pin', 'Crews in WA + OR']],
    servicesHead: { eyebrow: 'What we install', h2: ['Showers, conversions &amp; doors, installed in ', 'as little as one day'], sub: 'One crew, one day, one written price. Every system is measured to your bathroom, built in the USA, and backed by a lifetime warranty.' },
    design: true,
    ctaH2: ["Let's plan a shower you're ", 'proud of.'],
    final: { eyebrow: 'Free in-home design visit', h2: ['Ready for a shower you ', 'never scrub grout in?'] },
    faqSlugs: [['shower-replacement', 4], ['tub-to-shower-conversion', 2], ['wall-systems', 1]],
  },
  custom: {
    key: 'custom', url: '/custom-bathrooms/', name: 'Custom Bathrooms', label: 'Custom', blurb: 'Built from scratch',
    metaTitle: 'Custom Tile Showers & Full Bathroom Remodels | Vancouver WA & Portland OR | Buddy Baths',
    metaDescription: 'Hand-built tile showers, heated floors, and full bathroom remodels on flood-tested waterproofing. One crew start to finish in Vancouver WA and Portland OR. Free in-home design visits.',
    hero: {
      photo: 'hero-custom-bathroom.jpg', h1a: 'CUSTOM BATHROOMS.', h1b: 'BUILT FROM SCRATCH.',
      tags: ['Tile Showers', 'Full Remodels', 'Heated Floors', 'Waterproofing'],
      points: [['ruler', 'Designed around you', 'Any tile, any layout, niches and benches'], ['grid', 'Hand-set tile', 'RedGard waterproofing, flood-tested'], ['hammer', 'One crew, start to finish', 'Demo to done, daily photos to your phone']],
      cta: 'See custom tile showers →', ctaHref: '/services/custom-tile-showers/',
      cardH3: "Let's plan your bathroom.", cardSub: 'We measure, bring tile and layout ideas, and your written price arrives the same day.',
    },
    intro: {
      eyebrow: 'Built from scratch, built to last', h2: ['A bathroom designed around you, ', 'not around a panel.'],
      p1: 'Buddy Baths custom bathrooms are hand-built: tile showers on flood-tested RedGard waterproofing, heated floors, large-format porcelain and natural stone, vanities and fixtures, start to finish by one crew.',
      p2: 'Your designer measures, brings tile and layout ideas to your home, and your written price lands the same day. Most tile showers take one to two weeks, full remodels two to four.',
      photo: 'custom-intro.jpg', caption: 'Marble-look porcelain, a linear drain, and frameless glass, set by hand.',
    },
    trust2: [['shield', 'RedGard waterproofing'], ['camera', 'Photos before tile covers it'], ['award', 'Workmanship warranty'], ['pin', 'Crews in WA + OR']],
    servicesHead: { eyebrow: 'What we build', h2: ['Showers, floors &amp; full remodels, ', 'built by hand'], sub: 'Custom means custom: any tile, any layout, heated floors, and a crew that finishes what it starts. One written price before demo.' },
    design: false,
    ctaH2: ["Let's build a bathroom you're ", 'proud of.'],
    final: { eyebrow: 'Free in-home design visit', h2: ['Ready for a bathroom ', 'built around you?'] },
    faqSlugs: [['custom-tile-showers', 4], ['full-bathroom-remodels', 2], ['heated-floors', 1]],
  },
};
const HOME_PATH = {
  key: 'home', split: true,
  intro: {
    eyebrow: 'One company, two ways to a new bathroom', h2: ['The bathroom company for ', 'both sides of the river.'],
    p1: 'Buddy Baths is the bathroom division of Buddy Built, serving Vancouver, Camas, and Battle Ground in Washington and the Portland metro in Oregon. Need it fast and clean? Our one-day shower systems are measured to your bathroom and installed before dinner. Want it custom? Our tile crews build showers and whole bathrooms by hand.',
    p2: 'Either way you get one written price, one crew, and one number to call.',
    photo: 'intro-shower-install.jpg', caption: 'A one-day shower system with a sliding glass door, installed before dinner.',
  },
  trust2: [['award', 'Lifetime warranty on wall systems'], ['shield', 'Flood-tested waterproofing'], ['checkCircle', 'One written price'], ['pin', 'Crews in WA + OR']],
  design: false,
  ctaH2: ["Let's plan a bathroom you're ", 'proud of.'],
  final: { eyebrow: 'Free in-home design visit', h2: ['Ready for a bathroom you ', 'love walking into?'] },
  faqSlugs: [['shower-replacement', 2], ['custom-tile-showers', 2], ['full-bathroom-remodels', 1]],
  extraFaqs: [{ q: 'One-day shower or custom tile: which is right for me?', a: 'Pick one-day if you want a clean, modern shower fast, with no grout and a lifetime warranty on the walls. Pick custom if you want a specific tile, a new layout, heated floors, or the whole bathroom redone. Not sure? The free design visit covers both, and we price whichever fits.' }],
};

const CITIES = [
  { slug: 'vancouver', lat: 45.6387, lng: -122.6615, name: 'Vancouver', state: 'WA', neighborhoods: ['Salmon Creek', 'Felida', 'Cascade Park', 'Fishers Landing', 'Hazel Dell', 'Camas', 'Ridgefield', 'Battle Ground'], blurb: 'Our home base. Same-week in-home estimates across Clark County, Salmon Creek, Felida, Cascade Park, Camas, and Ridgefield.' },
  { slug: 'portland', lat: 45.5152, lng: -122.6784, name: 'Portland', state: 'OR', neighborhoods: ['Sellwood', 'St. Johns', 'Alberta', 'Mt. Tabor', 'Multnomah Village', 'Woodstock'], blurb: 'Full service across Portland, from 1920s bungalow baths in Sellwood to new builds in Mt. Tabor.' },
  { slug: 'beaverton', lat: 45.4871, lng: -122.8037, name: 'Beaverton', state: 'OR', neighborhoods: ['Cedar Hills', 'Aloha', 'Raleigh Hills', 'Sexton Mountain'], blurb: 'One-day showers and tub conversions across Beaverton, Cedar Hills, and Aloha.' },
  { slug: 'gresham', lat: 45.5001, lng: -122.4302, name: 'Gresham', state: 'OR', neighborhoods: ['Troutdale', 'Fairview', 'Wood Village', 'Powell Valley'], blurb: 'Serving Gresham, Troutdale, and Fairview with the same crews and the same standard.' },
  { slug: 'hillsboro', lat: 45.5229, lng: -122.9898, name: 'Hillsboro', state: 'OR', neighborhoods: ['Orenco', 'Tanasbourne', 'Jackson School', 'Reedville'], blurb: 'Shower replacements for Hillsboro and Orenco, fast scheduling for busy households.' },
  { slug: 'salem', lat: 44.9429, lng: -123.0351, name: 'Salem', state: 'OR', neighborhoods: ['Keizer', 'South Salem', 'West Salem', 'Four Corners'], blurb: 'Weekly routes to Salem and Keizer, book ahead and we bundle your neighborhood.' },
];

// Smaller towns named on the city pages, plotted on the service-area map as
// secondary pins (no page of their own).
const NEARBY_TOWNS = [
  // Washington
  { name: 'Camas', state: 'WA', lat: 45.5871, lng: -122.3995 },
  { name: 'Battle Ground', state: 'WA', lat: 45.7807, lng: -122.5334 },
  { name: 'Ridgefield', state: 'WA', lat: 45.8151, lng: -122.7426 },
  { name: 'Longview', state: 'WA', lat: 46.1382, lng: -122.9382 },
  { name: 'Castle Rock', state: 'WA', lat: 46.2751, lng: -122.9076 },
  // Oregon
  { name: 'Tigard', state: 'OR', lat: 45.4312, lng: -122.7715 },
  { name: 'Lake Oswego', state: 'OR', lat: 45.4207, lng: -122.6706 },
  { name: 'Happy Valley', state: 'OR', lat: 45.4468, lng: -122.5303 },
  { name: 'Milwaukie', state: 'OR', lat: 45.4462, lng: -122.6393 },
  { name: 'Troutdale', state: 'OR', lat: 45.5393, lng: -122.3873 },
  { name: 'Fairview', state: 'OR', lat: 45.5387, lng: -122.434 },
  { name: 'Forest Grove', state: 'OR', lat: 45.5199, lng: -123.1107 },
  { name: 'McMinnville', state: 'OR', lat: 45.2101, lng: -123.1987 },
  { name: 'Keizer', state: 'OR', lat: 44.9901, lng: -123.0262 },
  { name: 'Hood River', state: 'OR', lat: 45.7054, lng: -121.5215 },
];

// How you'll be treated, the emotional core of the pitch. Every line is a
// promise about the homeowner's experience, not a feature.
const PROMISE = [
  { short: 'We protect your home.', title: 'We protect your home like it\'s ours', body: 'Floor protection from the front door to the bathroom, dust contained to one room, and the old shower gone when we leave. One bathroom, one day, and the rest of the house untouched.' },
  { short: 'You\'ll always know what\'s next.', title: 'You\'ll never wonder what\'s happening', body: 'A written scope and install date before we take a deposit, a text the morning we arrive, and a walkthrough before we go. No chasing your contractor for updates. Ever.' },
  { short: 'Your price is your price.', title: 'Your budget is safe with us', body: 'One written price for the whole shower, base, walls, glass, and labor, before we start. It doesn\'t move unless you change the plan. No surprise invoices, no games.' },
  { short: 'We\'re done when you smile.', title: 'We\'re not done until you smile', body: 'You run the water, swing the door, and sign off before the invoice comes. Then the lifetime warranty on the system and our workmanship warranty are both in your name.' },
];

// Placeholders until real Google reviews come in, swap before launch.
const TESTIMONIALS = [
  { quote: 'They pulled our old tub at 8 in the morning and I took a shower in the new one that night. No grout, no mess, and the glass door is gorgeous.', name: 'Rachel M.', where: 'Vancouver, WA' },
  { quote: 'The written price was the price. They put down floor protection to the front door and the house was spotless when they left.', name: 'Dan & Priya K.', where: 'Camas, WA' },
  { quote: 'My mom can finally step into the shower without help. The seat and grab bars look like they belong there, not like a hospital.', name: 'Steve T.', where: 'Beaverton, OR' },
];

const STEPS = [
  { short: 'Show us the bathroom', title: 'Request an estimate', body: 'Two minutes online or one phone call. Tell us about the shower or tub you have and the one you want.' },
  { short: 'Design it', title: 'In-home design visit', body: 'We measure your space, bring the color, pattern, and glass samples to your bathroom, and your written price lands in your inbox the same day.' },
  { short: 'We install it', title: 'Installed in as little as one day', body: 'Approve online in one tap. Your system is built to your measurements, and our certified crew removes the old shower and installs the new one, most projects in a single day.' },
  { short: 'Enjoy it', title: 'Walkthrough and warranty', body: 'You run the water and swing the door before you sign off. The lifetime system warranty and our workmanship warranty are both in your name.' },
];

const TRUST = [
  { title: 'Family Owned & Operated', body: 'You talk to the owner, not a call center, and the person who designs your shower knows the crew who installs it by name.' },
  { title: 'As Little As One Day', body: 'Most shower replacements and tub conversions are installed in a single day. Final timing is confirmed after project review.' },
  { title: 'Free In-Home Design Visit', body: 'Samples in your bathroom, your written price the same day, approved online.' },
  { title: 'One Written Price', body: 'Base, walls, glass, and labor in one number before we start, and it does not move unless you change the plan.' },
  { title: 'Licensed, Bonded & Insured', body: 'Registered in Washington and Oregon.' },
  { title: 'Lifetime Warranty', body: 'Every shower and bath system is backed by a lifetime manufacturer warranty, and Buddy Built stands behind the install.' },
];

// Design Options page: the catalog we install. Names are the
// manufacturer's; swatch files live in assets/img/swatches/.
const DESIGN = {
  purostone: [
    { name: 'Tundra', note: 'Crisp, serene, minimalist', img: 'ps-tundra.jpg' },
    { name: 'Stratus', note: 'Ethereal, refined, tranquil', img: 'ps-stratus.jpg' },
    { name: 'Coastal Mist', note: 'Fresh, airy, relaxed', img: 'ps-coastal-mist.jpg' },
    { name: 'Sahara', note: 'Warm, natural, textured', img: 'ps-sahara.jpg' },
    { name: 'Marbled Ash', note: 'Bold, sleek, modern', img: 'ps-marbled-ash.jpg' },
  ],
  colors: [
    { name: 'Calcutta Marble', img: 'c-calcutta-marble.jpg' },
    { name: 'Santorini White Marble', img: 'c-santorini-white-marble.jpg' },
    { name: 'Bianco Travertine', img: 'c-bianco-travertine.jpg' },
    { name: 'Arctic Ice', img: 'c-arctic-ice.jpg' },
    { name: 'Glacier Ice', img: 'c-glacier-ice.jpg' },
    { name: 'White, matte or glossy', img: 'c-white.jpg' },
    { name: 'London Fog', img: 'c-london-fog.jpg' },
    { name: 'Grayline', img: 'c-grayline.jpg' },
    { name: 'Galena', img: 'c-galena.jpg' },
    { name: 'Carbon Ash Concrete', img: 'c-carbon-ash-concrete.jpg' },
    { name: 'Horizon Beige', img: 'c-horizon-beige.jpg' },
    { name: 'Sandalwood', img: 'c-sandalwood.jpg' },
    { name: 'Tuscany', img: 'c-tuscany.jpg' },
    { name: 'Othello', img: 'c-othello.jpg' },
  ],
  moreColors: ['Brecchia', 'Sierra Sand', 'Madeira', 'Santa Cruz Granite', 'River Rock', 'Canyon Rock', 'Travertine', 'Lightning', 'Quartz', 'Silver White', 'Gray', 'Almond', 'Biscuit', 'Sandbar', 'Evo', 'Metapeake', 'Napoli Marble', 'Pompeii Marble', 'San Michele', 'Versailles'],
  patterns: [
    { name: '3x6 Subway', img: 'p-3x6-subway.jpg' },
    { name: '4x12 Subway', img: 'p-4x12-subway.jpg' },
    { name: '9x15 Monument', img: 'p-9x15-monument.jpg' },
    { name: '12x12', img: 'p-12x12.jpg' },
    { name: 'Herringbone', img: 'p-herringbone.jpg' },
    { name: 'Hexagonal', img: 'p-hexagonal.jpg' },
    { name: 'Chevron', img: 'p-chevron.jpg' },
    { name: 'Picket', img: 'p-picket.jpg' },
    { name: 'Cobblestone', img: 'p-cobblestone.jpg' },
    { name: 'Roman Block', img: 'p-roman-block.jpg' },
  ],
  morePatterns: ['8x10', 'Bayview', 'Fairfield', 'Flagstone', 'Hopscotch', 'Milano', 'Panorama'],
  glass: [
    { name: 'Clear', img: 'g-clear.jpg' },
    { name: 'Rain', img: 'g-rain.jpg' },
    { name: 'Frosted', img: 'g-frosted.jpg' },
    { name: 'Corrugated', img: 'g-corrugated.jpg' },
  ],
  vgroove: ['Arrow', 'Hopscotch', 'Roman Block', 'Vertical Block'],
  finishes: ['Matte Black', 'Brushed Nickel', 'Oil-Rubbed Bronze', 'Chrome'],
  accessories: ['Built-in bench seats', 'Fold-down seats', 'Corner shelves and caddies', 'Grab bars in matching finishes', 'Hand-held shower heads on slide bars', 'Rain shower heads', 'Soap dishes and towel bars'],
};

// Kept for the shared generator; the bath site has no ballpark calculator yet.
const BALLPARK = { disclaimerShort: 'Not a final quote. Your exact price comes from a free in-home estimate.', laborOnly: '', projects: [], extras: [], rangeLow: 0.9, rangeHigh: 1.2, jobMinCents: 400000 };
const DESIGNER = { rates: {}, features: [], rangeLo: 0.8, rangeHi: 1.3 };

module.exports = { SITE, SERVICES, PATHS, HOME_PATH, CITIES, NEARBY_TOWNS, STEPS, TRUST, PROMISE, TESTIMONIALS, DESIGN, BALLPARK, DESIGNER };
