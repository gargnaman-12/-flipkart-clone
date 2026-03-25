import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProducts, seedProducts } from '../api';
import './home.css';

const HERO = [
  {
    title: 'Big Saving Days',
    subtitle: 'Top deals on mobiles, TVs, and laptops',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1800&q=60'
  },
  {
    title: 'Fashion Fest',
    subtitle: 'Shoes, watches, and more',
    image:
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1800&q=60'
  },
  {
    title: 'Home Essentials',
    subtitle: 'Upgrade your kitchen & living',
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=60'
  }
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=60';

function useInterval(callback, delay) {
  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}

function formatMoney(n) {
  try {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
}

function ProductCard({ p, onAddToCart }) {
  const [imgSrc, setImgSrc] = useState(p.image || FALLBACK_IMAGE);

  return (
    <div className="fk-card">
      <Link to={`/product/${p._id}`} className="fk-cardLink">
        <div className="fk-thumb">
          <img
            src={imgSrc}
            alt={p.title}
            loading="lazy"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />
        </div>
        <div className="fk-cardBody">
          <div className="fk-title" title={p.title}>
            {p.title}
          </div>
          <div className="fk-meta">
            <span className="fk-price">₹{formatMoney(p.price)}</span>
            {p.mrp ? <span className="fk-mrp">₹{formatMoney(p.mrp)}</span> : null}
            {p.discountPercent ? (
              <span className="fk-off">{p.discountPercent}% off</span>
            ) : null}
          </div>
          <div className="fk-ratingRow">
            <span className="fk-rating">
              {Number(p.rating || 0).toFixed(1)} ★
            </span>
            <span className="fk-ratingCount">({formatMoney(p.ratingCount || 0)})</span>
            {!p.inStock ? <span className="fk-oos">Out of stock</span> : null}
          </div>
        </div>
      </Link>
      <button
        className="fk-addBtn"
        onClick={() => onAddToCart(p)}
        disabled={!p.inStock}
      >
        Add to cart
      </button>
    </div>
  );
}

function HorizontalRail({ title, items, onAddToCart }) {
  return (
    <section className="fk-rail">
      <div className="fk-railHead">
        <h2>{title}</h2>
        <span className="fk-railHint">Swipe / scroll</span>
      </div>
      <div className="fk-railTrack">
        {items.map((p) => (
          <div className="fk-railItem" key={p._id}>
            <ProductCard p={p} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home({ search, category, onCategoryChange, onAddToCart }) {
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: '' });
  const [heroIdx, setHeroIdx] = useState(0);

  const categories = useMemo(
    () => ['Mobiles', 'Audio', 'Laptops', 'TVs', 'Fashion', 'Home & Kitchen', 'Grocery', 'Beauty'],
    []
  );

  useInterval(() => setHeroIdx((x) => (x + 1) % HERO.length), 4500);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    listProducts({ search, category, limit: 60, sort: 'featured' })
      .then((data) => {
        if (!active) return;
        setState({ items: data.items || [], total: data.total || 0, loading: false, error: '' });
      })
      .catch(async (e) => {
        // If the DB is empty, try seeding once (demo-friendly)
        try {
          await seedProducts();
          const data = await listProducts({ search, category, limit: 60, sort: 'featured' });
          if (!active) return;
          setState({ items: data.items || [], total: data.total || 0, loading: false, error: '' });
        } catch {
          if (!active) return;
          setState({ items: [], total: 0, loading: false, error: e.message || 'Failed to load' });
        }
      });
    return () => {
      active = false;
    };
  }, [search, category]);

  const topDeals = state.items.slice(0, 12);
  const electronics = state.items
    .filter((p) => ['Mobiles', 'Audio', 'Laptops', 'TVs'].includes(p.category))
    .slice(0, 12);
  const homeAndLifestyle = state.items
    .filter((p) => ['Fashion', 'Home & Kitchen', 'Beauty', 'Grocery'].includes(p.category))
    .slice(0, 12);

  return (
    <div className="fk-home">
      <section
        className="fk-hero"
        style={{ backgroundImage: `url(${HERO[heroIdx].image})` }}
        aria-label="Hero banner"
      >
        <div className="fk-heroOverlay" />
        <div className="fk-heroInner">
          <div className="fk-heroBadge">Flipkart style demo</div>
          <h1>{HERO[heroIdx].title}</h1>
          <p>{HERO[heroIdx].subtitle}</p>
          <div className="fk-heroDots" role="tablist" aria-label="Hero slides">
            {HERO.map((_, i) => (
              <button
                key={i}
                className={i === heroIdx ? 'active' : ''}
                onClick={() => setHeroIdx(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="fk-cats">
        <div className="fk-catsInner">
          <button
            className={`fk-cat ${!category ? 'active' : ''}`}
            onClick={() => onCategoryChange('')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`fk-cat ${category === c ? 'active' : ''}`}
              onClick={() => onCategoryChange(c)}
            >
              {c}
            </button>
          ))}
          <div className="fk-catsRight">
            <span className="fk-count">
              {state.loading ? 'Loading…' : `${formatMoney(state.total)} products`}
            </span>
          </div>
        </div>
      </section>

      {state.error ? (
        <div className="fk-error">
          <div className="fk-errorCard">
            <div className="fk-errorTitle">Couldn’t load products</div>
            <div className="fk-errorMsg">{state.error}</div>
            <div className="fk-errorHint">
              Make sure the backend is running on <code>localhost:5000</code> and MongoDB Atlas is
              connected.
            </div>
          </div>
        </div>
      ) : null}

      <HorizontalRail title="Top Deals" items={topDeals} onAddToCart={onAddToCart} />
      <HorizontalRail title="Best of Electronics" items={electronics} onAddToCart={onAddToCart} />
      <HorizontalRail title="Home, Fashion & Beauty" items={homeAndLifestyle} onAddToCart={onAddToCart} />

      <section className="fk-about" id="about">
        <div className="fk-aboutBg" />
        <div className="fk-aboutInner">
          <h2>About us</h2>
          <p>
            This is a learning-focused Flipkart-like clone UI: sticky header, hero carousel, product
            rails, product details with reviews, and a clean shopping flow. Data is served from your
            local API connected to MongoDB Atlas.
          </p>
          <div className="fk-aboutStats">
            <div className="fk-stat">
              <div className="fk-statNum">Fast</div>
              <div className="fk-statLabel">scroll-snap rails</div>
            </div>
            <div className="fk-stat">
              <div className="fk-statNum">Modern</div>
              <div className="fk-statLabel">interactive navbar</div>
            </div>
            <div className="fk-stat">
              <div className="fk-statNum">Real</div>
              <div className="fk-statLabel">MongoDB Atlas data</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

