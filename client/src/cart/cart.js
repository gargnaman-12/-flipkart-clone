import React from 'react';

function Cart({ cart }) {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 Cart Page</h1>

      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        cart.map((item, index) => (
          <div key={index} style={{
            border: "1px solid #ccc",
            padding: "10px",
            margin: "10px 0"
          }}>
            <h3>{item.title}</h3>
            <p>₹{item.price}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Cart;