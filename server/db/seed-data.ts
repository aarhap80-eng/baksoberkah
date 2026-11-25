import type { MenuCategory, StoreSettings } from '../../types'

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  id: 1,
  store_name: 'Bakso Berkah',
  tagline: 'Gurih Kuahnya, Mantap Dagingnya',
  is_open: true,
  whatsapp_number: '6281234567890',
  address: 'Alamat warung belum diatur — hubungi WhatsApp untuk lokasi',
  open_hours: 'Setiap Hari, 10.00 - 21.00 WIB',
  maps_url: null,
  maps_embed_url: null,
}

export interface SeedMenuItemInput {
  name: string
  category: MenuCategory
  description: string
  price: number
  image_url: string
  is_available: boolean
  is_bestseller: boolean
}

export const INITIAL_MENU_ITEMS: SeedMenuItemInput[] = [
  {
    name: 'Bakso Urat',
    category: 'bakso',
    description: 'Bakso daging sapi urat kenyal dan gurih dengan kuah kaldu sapi asli',
    price: 18000,
    image_url: '/images/menu/bakso-urat.jpg',
    is_available: true,
    is_bestseller: true,
  },
  {
    name: 'Bakso Telur',
    category: 'bakso',
    description: 'Bakso sapi lembut berisi telur ayam utuh di dalamnya dengan kuah kaldu hangat',
    price: 18000,
    image_url: '/images/menu/bakso-telur.jpg',
    is_available: true,
    is_bestseller: true,
  },
  {
    name: 'Mie Ayam',
    category: 'mie',
    description: 'Mie kenyal dengan topping ayam kecap manis gurih, sawi hijau, dan kuah terpisah',
    price: 15000,
    image_url: '/images/menu/mie-ayam.jpg',
    is_available: true,
    is_bestseller: false,
  },
  {
    name: 'Nasi Goreng (Nasgor)',
    category: 'nasi',
    description: 'Nasi goreng bumbu rempah spesial lengkap dengan telur, suwiran ayam, dan kerupuk',
    price: 17000,
    image_url: '/images/menu/nasi-goreng.jpg',
    is_available: true,
    is_bestseller: false,
  },
  {
    name: 'Mie Tiaw Sapi',
    category: 'mie',
    description: 'Kwetiau goreng/kuah dengan irisan daging sapi empuk dan sayuran segar',
    price: 20000,
    image_url: '/images/menu/mie-tiaw-sapi.jpg',
    is_available: true,
    is_bestseller: true,
  },
  {
    name: 'Mie Tiaw Ayam',
    category: 'mie',
    description: 'Kwetiau lezat dengan potongan daging ayam berbumbu gurih dan sayuran',
    price: 17000,
    image_url: '/images/menu/mie-tiaw-ayam.jpg',
    is_available: true,
    is_bestseller: false,
  },
  {
    name: 'Es Teh Manis',
    category: 'minuman',
    description: 'Teh manis dingin segar',
    price: 5000,
    image_url: '/images/menu/es-teh-manis.jpg',
    is_available: true,
    is_bestseller: false,
  },
  {
    name: 'Es Jeruk',
    category: 'minuman',
    description: 'Perasan jeruk segar dingin',
    price: 7000,
    image_url: '/images/menu/es-jeruk.jpg',
    is_available: true,
    is_bestseller: false,
  },
]
