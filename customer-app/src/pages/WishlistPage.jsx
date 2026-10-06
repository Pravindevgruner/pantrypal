import React from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useCart();

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-4 py-4 space-y-4">
        <h1 className="font-extrabold text-base text-gray-900 flex items-center">
          <Heart className="w-5 h-5 text-red-500 fill-red-500 mr-2" />
          My Wishlist ({wishlist.length})
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-4">
            <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">Wishlist is Empty</h3>
            <p className="text-xs text-gray-500 mt-1">Tap the heart icon on any product to save it here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {wishlist.map((prod) => (
              <ProductCard key={prod._id || prod} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
