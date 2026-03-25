import { Link } from 'react-router-dom';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import logo from '../assets/flipkartx-logo.svg';
import './navbar.css';

function Navbar({ cartCount, cartPulseTick, search, setSearch }) {
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  const links = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/#about', label: 'About' },
      { to: '/cart', label: `Cart (${cartCount})` }
    ],
    [cartCount]
  );

  useEffect(() => {
    function onResize() {
      setMenuOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!cartPulseTick) return;
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 420);
    return () => window.clearTimeout(t);
  }, [cartPulseTick]);

  function setCursorFromEl(el) {
    const wrap = navRef.current;
    if (!wrap || !el) return;
    const w = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    wrap.style.setProperty('--cursor-x', `${r.left - w.left}px`);
    wrap.style.setProperty('--cursor-w', `${r.width}px`);
  }

  function onMove(e) {
    const el = e.target?.closest?.('[data-navlink="1"]');
    if (!el) return;
    setCursorFromEl(el);
  }

  return (
    <header className="fk-header">
      <div className="fk-headerInner">
        <Link to="/" className="fk-brand" aria-label="FlipkartX Home">
          <img src={logo} alt="FlipkartX" className="fk-logo" />
        </Link>

        <div className="fk-search">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search"
          />
          <button className="fk-searchBtn" type="button" aria-label="Search">
            ⌕
          </button>
        </div>

        <button
          className="fk-menuBtn"
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        <nav
          className={`fk-nav ${menuOpen ? 'open' : ''}`}
          ref={navRef}
          onMouseMove={onMove}
          onMouseLeave={(e) => {
            const active = e.currentTarget.querySelector('.activeLink');
            if (active) setCursorFromEl(active);
          }}
        >
          <span className="fk-cursor" aria-hidden="true" />
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-navlink="1"
              className={`fk-navLink ${l.to === '/cart' ? 'cart' : ''}`}
              onMouseEnter={(e) => setCursorFromEl(e.currentTarget)}
              onFocus={(e) => setCursorFromEl(e.currentTarget)}
            >
              {l.to === '/cart' ? (
                <>
                  Cart
                  <span className={`fk-cartBadge ${pulse ? 'pulse' : ''}`}>{cartCount}</span>
                </>
              ) : (
                l.label
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="fk-subHeader">
        <div className="fk-subInner">
          <span className="fk-chip">Plus</span>
          <span className="fk-subText">Free delivery on first order*</span>
          <Link to="/cart" className="fk-miniCart">
            🛒 <strong>{cartCount}</strong>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;