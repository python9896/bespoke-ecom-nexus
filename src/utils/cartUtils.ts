import { toast } from "sonner";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  stock: number;
}

// Get cart from localStorage
export const getCart = (): CartItem[] => {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
};

// Save cart to localStorage
export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// Add item to cart
export const addToCart = (product: any, quantity: number = 1): void => {
  const cart = getCart();

  // Check if product already exists in cart
  const existingItemIndex = cart.findIndex(item => item.id === product.id);

  if (existingItemIndex >= 0) {
    // Update quantity if product already in cart
    const updatedCart = [...cart];
    const newQuantity = updatedCart[existingItemIndex].quantity + quantity;

    // Ensure we don't exceed stock
    if (newQuantity > product.stock) {
      toast.error(`Sorry, only ${product.stock} items available in stock`);
      return;
    }

    updatedCart[existingItemIndex].quantity = newQuantity;
    saveCart(updatedCart);
    toast.success(`Updated ${product.name} quantity in your cart`);
  } else {
    // Add new product to cart
    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url,
      stock: product.stock
    };

    saveCart([...cart, newItem]);
    toast.success(`${product.name} added to cart`);
  }
};

export const getCart = (): CartItem[] => {
  // Defensive: handle JSON parse errors
  try {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    localStorage.removeItem("cart");
    return [];
  }
};

// Remove item from cart
export const removeFromCart = (productId: number): void => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== productId);
  saveCart(updatedCart);
};

// Update item quantity
export const updateCartItemQuantity = (productId: number, quantity: number): void => {
  if (quantity < 1) return;

  const cart = getCart();
  const updatedCart = cart.map(item =>
    item.id === productId ? { ...item, quantity } : item
  );

  saveCart(updatedCart);
};

// Clear cart
export const clearCart = (): void => {
  localStorage.removeItem("cart");
};
