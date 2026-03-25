import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api';
import './product.css';

function formatMoney(n) {
  try {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
}

function Stars({ value }) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="fk-stars" aria-label={`${v.toFixed(1)} out of 5`}>
      {'★'.repeat(full)}
      {half ? '⯨' : ''}
      {'☆'.repeat(empty)}
    </span>
  );
}

export default function ProductDetails({ onAddToCart }) {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, error: '', product: null });
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: '', product: null });
    getProduct(id)
      .then((p) => {
        if (!active) return;
        setState({ loading: false, error: '', product: p });
        setActiveImg(0);
      })
      .catch((e) => {
        if (!active) return;
        setState({ loading: false, error: e.message || 'Failed to load', product: null });
      });
    return () => {
      active = false;
    };
  }, [id]);

  const p = state.product;
  const gallery = useMemo(() => {
    if (!p) return [];
    const arr = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    const all = [p.image, ...arr].filter(Boolean);
    return Array.from(new Set(all));
  }, [p]);

  if (state.loading) {
    return (
      <div className="fk-pWrap">
        <div className="fk-pSkeleton" />
      </div>
    );
  }

  if (state.error || !p) {
    return (
      <div className="fk-pWrap">
        <div className="fk-pError">
          <div className="fk-pErrorTitle">Product not available</div>
          <div className="fk-pErrorMsg">{state.error || 'Not found'}</div>
          <Link to="/" className="fk-backBtn">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fk-pWrap">
      <div className="fk-breadcrumbs">
        <Link to="/">Home</Link>
        <span>›</span>
        <span>{p.category || 'Products'}</span>
      </div>

      <div className="fk-pGrid">
        <div className="fk-gallery">
          <div className="fk-mainImg">
            <img src={gallery[Math.min(activeImg, gallery.length - 1)]} alt={p.title} />
            <div className="fk-mainOverlay">
              <div className="fk-stock">{p.inStock ? 'In stock' : 'Out of stock'}</div>
            </div>
          </div>
          <div className="fk-thumbs">
            {gallery.map((src, i) => (
              <button
                key={src}
                className={`fk-thumbBtn ${i === activeImg ? 'active' : ''}`}
                onClick={() => setActiveImg(i)}
                aria-label={`Image ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="fk-pInfo">
          <div className="fk-pBrand">{p.brand || 'Brand'}</div>
          <h1 className="fk-pTitle">{p.title}</h1>

          <div className="fk-pRatingRow">
            <span className="fk-pill">{Number(p.rating || 0).toFixed(1)} ★</span>
            <Stars value={p.rating} />
            <span className="fk-muted">
              {formatMoney(p.ratingCount || 0)} ratings
            </span>
          </div>

          <div className="fk-priceRow">
            <div className="fk-price">₹{formatMoney(p.price)}</div>
            {p.mrp ? <div className="fk-mrp">₹{formatMoney(p.mrp)}</div> : null}
            {p.discountPercent ? <div className="fk-off">{p.discountPercent}% off</div> : null}
          </div>

          <div className="fk-actions">
            <button
              className="fk-buy"
              onClick={() => onAddToCart(p)}
              disabled={!p.inStock}
            >
              Add to cart
            </button>
            <a className="fk-goCart" href="/cart">
              Go to cart
            </a>
          </div>

          {p.highlights?.length ? (
            <div className="fk-box">
              <div className="fk-boxTitle">Highlights</div>
              <ul className="fk-list">
                {p.highlights.slice(0, 7).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {p.description ? (
            <div className="fk-box">
              <div className="fk-boxTitle">Description</div>
              <div className="fk-desc">{p.description}</div>
            </div>
          ) : null}
        </div>
      </div>

      <section className="fk-reviews" aria-label="Product reviews">
        <div className="fk-revHead">
          <h2>Ratings & Reviews</h2>
          <div className="fk-revBgText">REVIEWS</div>
        </div>

        <div className="fk-revGrid">
          {(p.reviews || []).length ? (
            p.reviews.slice(0, 8).map((r, idx) => (
              <div className="fk-revCard" key={`${r.name}-${idx}`}>
                <div className="fk-revTop">
                  <div className="fk-avatar">{(r.name || '?').slice(0, 1).toUpperCase()}</div>
                  <div className="fk-revMeta">
                    <div className="fk-revName">{r.name}</div>
                    <div className="fk-revRating">
                      <span className="fk-pill small">{r.rating} ★</span>
                      <span className="fk-muted">{r.title}</span>
                    </div>
                  </div>
                </div>
                <div className="fk-revText">{r.comment}</div>
              </div>
            ))
          ) : (
            <div className="fk-revEmpty">
              No reviews yet. Seed data will add a few demo reviews.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

