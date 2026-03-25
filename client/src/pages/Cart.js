import React from 'react';
import './cart.css';

function formatMoney(n) {
  try {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
}

function Cart({ cart, incQty, decQty, removeFromCart }) {
  const itemCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  const total = cart.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.qty || 1), 0);
  return (
    <div className="fk-cartWrap">
      <div className="fk-cartGrid">
        <div className="fk-cartLeft">
          <div className="fk-cartHead">
            <h1>Your Cart</h1>
            <span className="fk-cartCount">{itemCount} items</span>
          </div>

          {cart.length === 0 ? (
            <div className="fk-cartEmpty">
              <div className="fk-cartEmptyTitle">Your cart is empty</div>
              <div className="fk-cartEmptyMsg">Add items from the home page to see them here.</div>
            </div>
          ) : (
            <div className="fk-cartItems">
              {cart.map((item) => (
                <div className="fk-cartItem" key={item._id}>
                  <div className="fk-cartThumb">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="fk-cartInfo">
                    <div className="fk-cartTitle">{item.title}</div>
                    <div className="fk-cartMeta">
                      <span className="fk-cartPrice">₹{formatMoney(item.price)}</span>
                      {item.mrp ? <span className="fk-cartMrp">₹{formatMoney(item.mrp)}</span> : null}
                      {item.discountPercent ? (
                        <span className="fk-cartOff">{item.discountPercent}% off</span>
                      ) : null}
                    </div>
                    <div className="fk-cartActions">
                      <div className="fk-qty">
                        <button className="fk-qtyBtn" onClick={() => decQty(item._id)} aria-label="Decrease quantity">
                          −
                        </button>
                        <div className="fk-qtyNum">{item.qty || 1}</div>
                        <button className="fk-qtyBtn" onClick={() => incQty(item._id)} aria-label="Increase quantity">
                          +
                        </button>
                      </div>
                      <button
                        className="fk-removeBtn"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="fk-cartRight" aria-label="Price details">
          <div className="fk-summary">
            <div className="fk-summaryTitle">Price Details</div>
            <div className="fk-row">
              <span>Price ({itemCount} items)</span>
              <strong>₹{formatMoney(total)}</strong>
            </div>
            <div className="fk-row">
              <span>Delivery</span>
              <strong className="fk-green">FREE</strong>
            </div>
            <div className="fk-divider" />
            <div className="fk-row total">
              <span>Total Amount</span>
              <strong>₹{formatMoney(total)}</strong>
            </div>
            <button className="fk-placeOrder" disabled={cart.length === 0}>
              Place Order
            </button>
            <div className="fk-note">This is a UI demo (no real checkout).</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Cart;