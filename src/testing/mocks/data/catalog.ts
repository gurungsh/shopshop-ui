import type { Category, Product } from '@/api/types/catalog'

// Mock catalog shaped like the backend's responses. Ids are fixed so links
// and tests stay stable; dates follow the list order (the API sorts by them).

const id = (prefix: string, n: number) =>
  `${prefix}0000000-0000-4000-8000-${String(n).padStart(12, '0')}`

function category(n: number, name: string, description: string): Category {
  const date = `2026-01-0${String(n)}T09:00:00Z`
  return {
    id: id('c', n),
    name,
    description,
    isActive: true,
    createdAtUtc: date,
    updatedAtUtc: date,
  }
}

let count = 0

function product(
  categoryN: number,
  name: string,
  sku: string,
  price: number,
  description: string,
  isActive = true,
): Product {
  count += 1
  const date = new Date(Date.UTC(2026, 1, 1, count)).toISOString()
  return {
    id: id('a', count),
    categoryId: id('c', categoryN),
    name,
    description,
    sku,
    price,
    isActive,
    createdAtUtc: date,
    updatedAtUtc: date,
  }
}

export const categories: Category[] = [
  category(1, 'Audio', 'Headphones, speakers and everything in between.'),
  category(
    2,
    'Home office',
    'Desks, lighting and the small things that make work easier.',
  ),
  category(3, 'Kitchen', 'Cookware and tools for everyday cooking.'),
  category(4, 'Outdoor', 'Gear for walks, hikes and weekends away.'),
]

// prettier-ignore
export const products: Product[] = [
  product(1, 'Over-ear Wireless Headphones', 'AUD-HP-200', 149, 'Closed-back headphones with active noise canceling, a USB-C charging port and a folding frame for travel.'),
  product(2, 'Mechanical Keyboard, 75%', 'OFF-KB-075', 119, 'Hot-swappable switches, aluminum case and a compact layout.'),
  product(3, 'Pour-over Coffee Set', 'KIT-CF-001', 39, 'Ceramic dripper, glass carafe and a pack of paper filters.'),
  product(4, 'Insulated Bottle, 750 ml', 'OUT-BT-750', 29, 'Keeps drinks cold for 24 hours or hot for 12.'),
  product(1, 'Bookshelf Speaker Pair', 'AUD-SP-110', 229, 'Two-way passive speakers with a warm, detailed sound for small rooms.'),
  product(2, 'Adjustable Laptop Stand', 'OFF-LS-010', 49, 'Raises your screen to eye level and folds flat for travel.'),
  product(3, 'Cast Iron Skillet, 10 in', 'KIT-SK-010', 45, 'Pre-seasoned skillet that goes from stovetop to oven.'),
  product(4, 'Packable Rain Jacket', 'OUT-RJ-020', 89, 'Lightweight waterproof shell that packs into its own pocket.'),
  product(1, 'Wireless Earbuds', 'AUD-EB-050', 99, 'Compact earbuds with a pocket-sized charging case and six hours of playback.'),
  product(2, 'Desk Lamp with Dimmer', 'OFF-LM-022', 59, 'Warm-to-cool LED lamp with a touch dimmer and USB charging port.'),
  product(3, 'Chef’s Knife, 8 in', 'KIT-KN-008', 89, 'Forged stainless-steel blade with a full tang and riveted handle.'),
  product(4, 'Trekking Poles, Pair', 'OUT-TP-002', 65, 'Collapsible aluminum poles with cork grips.'),
  product(1, 'USB Audio Interface', 'AUD-IF-020', 129, 'Two inputs, phantom power and clean preamps for recording at home.'),
  product(2, 'Ergonomic Mouse', 'OFF-MS-031', 69, 'Vertical mouse that keeps your wrist in a natural position.'),
  product(3, 'Digital Kitchen Scale', 'KIT-SC-005', 25, 'Weighs up to 5 kg in 1 g steps, with a tare button.'),
  product(4, 'Headlamp, 400 Lumen', 'OUT-HL-400', 35, 'Rechargeable headlamp with a red-light mode.'),
  product(1, 'Portable Bluetooth Speaker', 'AUD-SP-030', 79, 'Water-resistant speaker with a strap and twelve hours of battery.'),
  product(2, 'Monitor Arm', 'OFF-MA-040', 139, 'Gas-spring arm for monitors up to 32 inches.'),
  product(3, 'Enameled Dutch Oven', 'KIT-DO-045', 119, '4.5-quart pot for braising, baking bread and slow cooking.'),
  product(4, 'Two-person Tent', 'OUT-TN-002', 229, 'Freestanding three-season tent that weighs under 2 kg.'),
  product(1, 'Turntable with Built-in Preamp', 'AUD-TT-001', 249, 'Belt-drive turntable that connects straight to powered speakers.'),
  product(2, 'Felt Desk Mat', 'OFF-DM-005', 29, 'Large wool-felt mat that protects the desk and quiets the keyboard.'),
  product(3, 'Electric Gooseneck Kettle', 'KIT-KT-010', 69, 'Variable-temperature kettle with a precise pouring spout.'),
  product(4, 'Camping Stove', 'OUT-CS-001', 55, 'Compact canister stove that boils a liter in four minutes.'),
  product(1, 'Studio Monitor Headphones', 'AUD-HP-090', 119, 'Flat-response wired headphones for mixing and editing.'),
  product(2, 'Cable Management Tray', 'OFF-CT-012', 35, 'Under-desk steel tray that hides power strips and cables.'),
  product(3, 'Bamboo Cutting Board Set', 'KIT-CB-003', 32, 'Three boards in different sizes with juice grooves.'),
  product(1, 'Desktop Microphone', 'AUD-MC-015', 89, 'Cardioid USB microphone with a headphone jack and mute button.'),
  product(2, 'Webcam, 1080p', 'OFF-WC-108', 79, 'Full HD webcam with a privacy shutter and dual microphones.'),
  product(1, 'Wired Earbuds (discontinued)', 'AUD-EB-001', 19, 'Replaced by the wireless model.', false),
]
