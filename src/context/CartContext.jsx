import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { loadCart, saveCart } from "../utils/storage";

const CartContext = createContext(null);

// Actions
const ACTIONS = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  UPDATE_QTY: "UPDATE_QTY",
  CLEAR: "CLEAR",
  INIT: "INIT",
};

function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.INIT:
      return action.payload;

    case ACTIONS.ADD: {
      const existing = state.find((item) => item.product.id === action.payload.id);
      if (existing) {
        return state.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: Math.min(item.quantity + 1, action.payload.stock || 99) }
            : item
        );
      }
      return [...state, { product: action.payload, quantity: 1 }];
    }

    case ACTIONS.REMOVE:
      return state.filter((item) => item.product.id !== action.payload);

    case ACTIONS.UPDATE_QTY: {
      const { id, quantity } = action.payload;
      if (quantity <= 0) return state.filter((item) => item.product.id !== id);
      return state.map((item) =>
        item.product.id === id ? { ...item, quantity } : item
      );
    }

    case ACTIONS.CLEAR:
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadCart();
    if (saved.length > 0) {
      dispatch({ type: ACTIONS.INIT, payload: saved });
    }
  }, []);

  // Persist whenever cart changes
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = useCallback((product) => {
    dispatch({ type: ACTIONS.ADD, payload: product });
  }, []);

  const removeFromCart = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE, payload: id });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: ACTIONS.UPDATE_QTY, payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR });
  }, []);

  const isInCart = useCallback(
    (id) => cart.some((item) => item.product.id === id),
    [cart]
  );

  const getQuantity = useCallback(
    (id) => cart.find((item) => item.product.id === id)?.quantity || 0,
    [cart]
  );

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discount = cart.reduce(
    (sum, item) =>
      sum +
      (item.product.price *
        (item.product.discountPercentage || 0) *
        item.quantity) /
        100,
    0
  );

  const total = subtotal - discount;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        discount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
