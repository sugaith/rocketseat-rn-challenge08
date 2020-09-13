import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const newProds = await AsyncStorage.getItem('@GoMarketPlace:products');
      if (newProds) {
        setProducts([...JSON.parse(newProds)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const thereIsProds = products.find(prod => prod.id === product.id);
    if (thereIsProds) {
      setProducts(
        products.map(prod => prod.id === product.id ? {...product, quantity: prod.quantity +1} : prod)
      )
    } else {
      setProducts([...products, {...product, quantity: 1}])
    }

    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(products),
    );
  }, [products]);

  const increment = useCallback(async id => {
    const newProds =       products.map(
      prod => prod.id === id ? {...prod, quantity: prod.quantity + 1} : prod
    );
    setProducts(newProds);
    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(newProds)
    );
  }, [products]);

  const decrement = useCallback(async id => {
    const newProds =       products.map(
      prod => prod.id === id ? {...prod, quantity: prod.quantity - 1} : prod
    );
    setProducts(newProds);
    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(newProds)
    );
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
