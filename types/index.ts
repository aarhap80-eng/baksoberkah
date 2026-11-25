export type MenuCategory = 'bakso' | 'mie' | 'nasi' | 'minuman'
export type OrderType = 'dine_in' | 'takeaway' | 'delivery'
export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled'

export interface StoreSettings {
  id: number
  store_name: string
  tagline: string
  is_open: boolean
  whatsapp_number: string
  address: string
  open_hours: string
  maps_url: string | null
  maps_embed_url: string | null
}

export interface MenuItem {
  id: number
  name: string
  category: MenuCategory
  description: string
  price: number
  image_url: string
  is_available: boolean
  is_bestseller: boolean
}

export interface OrderItemCustomization {
  noodleMix?: string
  servingStyle?: string
  spiceLevel?: string
  notes?: string
}

export interface OrderItem {
  menu_item_id: number
  name: string
  category: MenuCategory
  unit_price: number
  quantity: number
  subtotal: number
  customization: OrderItemCustomization
}

export interface OrderRecord {
  id: string
  order_code: string
  customer_name: string
  customer_phone: string | null
  order_type: OrderType
  table_number: string | null
  delivery_address: string | null
  items_json: OrderItem[]
  total_amount: number
  status: OrderStatus
  created_at: string
}

export interface CartItem {
  key: string
  menuItem: MenuItem
  quantity: number
  customization: OrderItemCustomization
}
