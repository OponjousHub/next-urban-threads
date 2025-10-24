import React from "react";

const CartItem = ({ item, onQuantityChange }) => {
  return (
    <div className="flex justify-between items-center py-4 border-b">
      <div>
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
      </div>
      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value))}
        className="w-16 p-2 border rounded"
      />
    </div>
  );
};

export default CartItem;
