import { Routes, Route } from 'react-router-dom';
import React, { useMemo, useRef, useState } from 'react';
import Cart from './pages/Cart';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Navbar from './components/navbar';
import './app-shell.css';

function App() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cartToast, setCartToast] = useState('');
  const [cartPulseTick, setCartPulseTick] = useState(0);
  const toastTimerRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  const addToCart = (product) => {
    setCart((c) => {
      const id = product?._id;
      if (!id) return c;
      const idx = c.findIndex((x) => x._id === id);
      if (idx >= 0) {
        const next = [...c];
        next[idx] = { ...next[idx], qty: (next[idx].qty || 1) + 1 };
        return next;
      }
      return [...c, { ...product, qty: 1 }];
    });
    setCartToast(`${product?.title || 'Product'} added to cart`);
    setCartPulseTick((n) => n + 1);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setCartToast(''), 1400);
  };

  const decQty = (id) =>
    setCart((c) => {
      const idx = c.findIndex((x) => x._id === id);
      if (idx < 0) return c;
      const cur = c[idx];
      const q = cur.qty || 1;
      if (q <= 1) return c.filter((x) => x._id !== id);
      const next = [...c];
      next[idx] = { ...cur, qty: q - 1 };
      return next;
    });

  const incQty = (id) =>
    setCart((c) => {
      const idx = c.findIndex((x) => x._id === id);
      if (idx < 0) return c;
      const cur = c[idx];
      const next = [...c];
      next[idx] = { ...cur, qty: (cur.qty || 1) + 1 };
      return next;
    });

  const removeFromCart = (id) => setCart((c) => c.filter((x) => x._id !== id));

  const cartApi = useMemo(
    () => ({
      cart,
      setCart,
      addToCart,
      incQty,
      decQty,
      removeFromCart,
      cartCount
    }),
    [cart, cartCount]
  );

  return (
    <div className="fk-app">
      <Navbar
        cartCount={cartCount}
        cartPulseTick={cartPulseTick}
        search={search}
        setSearch={setSearch}
      />
      {cartToast ? <div className="fk-toast">{cartToast}</div> : null}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              search={search}
              category={category}
              onCategoryChange={setCategory}
              onAddToCart={cartApi.addToCart}
            />
          }
        />

        <Route
          path="/product/:id"
          element={<ProductDetails onAddToCart={cartApi.addToCart} />}
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cartApi.cart}
              incQty={cartApi.incQty}
              decQty={cartApi.decQty}
              removeFromCart={cartApi.removeFromCart}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
