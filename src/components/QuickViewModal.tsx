import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Feedback } from '../types';
import { formatINR } from '../utils/currency';
import {
  X,
  Star,
  ShoppingBag,
  CheckCircle2,
  Heart,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Send,
  BadgeCheck,
  Filter
} from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const {
    selectedProductForView,
    setSelectedProductForView,
    addToCart,
    setIsCheckoutOpen,
    setIsCartOpen,
    toggleWishlist,
    isInWishlist,
    currentUser,
    addToast,
    adminProfiles
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Reviews State
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);

  // New Review Form State
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newName, setNewName] = useState(currentUser?.name || '');
  const [submitting, setSubmitting] = useState(false);

  // Filter State
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    if (selectedProductForView) {
      fetchProductReviews(selectedProductForView.product_id);
    }
  }, [selectedProductForView]);

  useEffect(() => {
    if (currentUser?.name) {
      setNewName(currentUser.name);
    }
  }, [currentUser]);

  const fetchProductReviews = async (productId: string) => {
    setLoadingReviews(true);
    try {
      const data = await api.getFeedback(productId);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!selectedProductForView) return null;

  const product = selectedProductForView;
  const adminOwner = adminProfiles[product.admin_owner];
  const saved = isInWishlist(product.product_id);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setSelectedProductForView(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setSelectedProductForView(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      addToast('Review Required', 'Please write a few words about your experience with this product.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.submitFeedback({
        customer_name: newName.trim() || 'Sweets Enthusiast',
        customer_email: currentUser?.email || 'customer@example.com',
        rating: newRating,
        type: 'Review',
        title: newTitle.trim() || 'Delighted with Quality!',
        message: newMessage.trim(),
        product_id: product.product_id,
        product_name: product.product_name,
        verified_purchase: true
      });

      setReviews((prev) => [created, ...prev]);
      addToast('Review Published!', 'Thank you for sharing your feedback with the community.', 'success');
      setNewTitle('');
      setNewMessage('');
      setIsWritingReview(false);
      // Update local product reviews count display
      product.reviews_count = (product.reviews_count || 0) + 1;
    } catch (err) {
      addToast('Submission Failed', 'Could not post review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (reviewId: string) => {
    try {
      await api.upvoteHelpful(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.feedback_id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r))
      );
      addToast('Thanks for feedback', 'Marked review as helpful!', 'info');
    } catch {
      // ignore
    }
  };

  // Calculate rating stats
  const totalReviews = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  const filteredReviews = ratingFilter === 'all'
    ? reviews
    : reviews.filter((r) => Math.round(r.rating) === ratingFilter);

  return (
    <div id="quickview-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden relative my-6 animate-scale-up max-h-[90vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF8F5] border-b border-stone-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'details'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-200/60'
                }`}
            >
              <span>Product Details</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'reviews'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-200/60'
                }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Customer Reviews ({product.reviews_count || reviews.length})</span>
            </button>
          </div>

          <button
            onClick={() => setSelectedProductForView(null)}
            className="p-2 text-slate-800 hover:text-amber-600 rounded-full bg-amber-100 hover:bg-amber-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Column */}
              <div className="relative bg-stone-900 p-6 rounded-2xl flex items-center justify-center min-h-[320px]">
                <img
                  src={product.image}
                  alt={product.product_name}
                  className="max-h-[280px] w-auto object-contain rounded-2xl shadow-xl transition-transform hover:scale-105 duration-300"
                />
                {product.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {/* Details Column */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      {product.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Division: <span className="text-slate-900 font-bold">{adminOwner?.business_name}</span>
                    </span>
                  </div>

                  <h2 className="font-serif-display text-2xl font-extrabold text-slate-900 mb-2 leading-snug">
                    {product.product_name}
                  </h2>

                  {/* Rating Trigger to Reviews tab */}
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="flex items-center gap-2 mb-3 group text-left cursor-pointer hover:opacity-80"
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{product.rating}</span>
                    <span className="text-xs text-amber-700 font-bold underline group-hover:text-amber-800">
                      ({product.reviews_count} verified reviews)
                    </span>
                  </button>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-3xl font-black text-slate-900 font-serif-display">{formatINR(product?.price ?? 0)}</span>
                    {(product?.original_price ?? 0) > (product?.price ?? 0) && (
                      <span className="text-sm text-slate-400 line-through">{formatINR(product?.original_price ?? 0)}</span>
                    )}
                    <span className="text-xs text-amber-800 font-bold">
                      Includes 5% GST
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
                    {product.description}
                  </p>

                  {/* Specifications */}
                  {product.specifications && (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 mb-4 text-xs space-y-1">
                      <span className="font-bold text-amber-900 block mb-1">Key Product Details:</span>
                      {Object.entries(product.specifications).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-stone-700">
                          <span className="text-stone-500">{k}:</span>
                          <span className="font-semibold text-stone-900">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 mb-4">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                        Currently Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-3 border-t border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-amber-300 rounded-2xl bg-amber-50/50 p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-xl bg-amber-200 hover:bg-amber-300 text-slate-950 font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono font-black text-xs text-slate-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:bg-slate-300 text-slate-950 font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-950" /> Add To Bag
                    </button>

                    <button
                      onClick={() => toggleWishlist(product.product_id)}
                      className={`p-3 rounded-2xl border transition flex items-center justify-center ${saved
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'
                        }`}
                      title={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${saved ? 'fill-rose-600 text-rose-600' : ''}`} />
                    </button>
                  </div>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-300 text-amber-300 font-extrabold text-xs rounded-2xl shadow transition"
                  >
                    Instant Buy Now
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* CUSTOMER REVIEWS TAB */
            <div className="space-y-6">
              {/* Rating Summary Card */}
              <div className="p-6 bg-[#FAF7F2] rounded-3xl border border-amber-200/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Score Column */}
                <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-amber-200/80 pb-4 md:pb-0 pr-0 md:pr-6">
                  <div className="text-5xl font-black font-serif-display text-stone-900">
                    {product.rating}
                  </div>
                  <div className="flex justify-center text-amber-400 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-stone-600 font-medium">
                    Based on <span className="font-bold text-stone-900">{totalReviews} customer reviews</span>
                  </p>
                  <button
                    onClick={() => setIsWritingReview(!isWritingReview)}
                    className="mt-4 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isWritingReview ? 'Close Review Form' : 'Write a Review'}</span>
                  </button>
                </div>

                {/* Rating Distribution Breakdown */}
                <div className="md:col-span-8 space-y-2">
                  <span className="text-xs font-bold text-stone-800 block mb-1">Rating Distribution</span>
                  {ratingDistribution.map((dist) => (
                    <div key={dist.star} className="flex items-center gap-3 text-xs">
                      <span className="w-12 text-stone-600 font-medium font-mono">{dist.star} Stars</span>
                      <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${dist.percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-stone-500 text-[11px]">
                        {dist.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Submission Form */}
              {isWritingReview && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-5 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-4 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" /> Share Your Product Feedback
                    </h4>
                    <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                      <BadgeCheck className="w-3 h-3" /> Verified Buyer
                    </span>
                  </div>

                  {/* Star Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Overall Star Rating:</label>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-6 h-6 ${star <= (hoverRating || newRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                              }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-extrabold text-stone-900 font-mono">
                        {hoverRating || newRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Your Name:</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Ananya Roy"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Review Title / Headline:</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Super fresh & authentic taste!"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Your Honest Review:</label>
                    <textarea
                      required
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Describe the taste, freshness, packaging, and delivery experience..."
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsWritingReview(false)}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Publishing...' : 'Post Verified Review'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews Filter & List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-display font-extrabold text-stone-900 text-lg">
                    Customer Reviews
                  </h3>

                  {/* Rating Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto text-xs">
                    <span className="text-stone-500 font-medium mr-1 flex items-center gap-1">
                      <Filter className="w-3 h-3" /> Filter:
                    </span>
                    <button
                      onClick={() => setRatingFilter('all')}
                      className={`px-2.5 py-1 rounded-full font-bold transition ${ratingFilter === 'all'
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                    >
                      All ({reviews.length})
                    </button>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={star}
                          onClick={() => setRatingFilter(star)}
                          className={`px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1 ${ratingFilter === star
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                        >
                          <span>{star}★</span>
                          <span className="opacity-80">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                {loadingReviews ? (
                  <div className="text-center py-8 text-stone-500 text-xs font-medium">
                    Loading customer feedback...
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <MessageSquare className="w-8 h-8 text-stone-400 mx-auto" />
                    <p className="text-sm font-bold text-stone-800">No reviews yet for this filter</p>
                    <p className="text-xs text-stone-500">Be the first customer to share your review for {product.product_name}!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReviews.map((review) => (
                      <div
                        key={review.feedback_id}
                        className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-xs">{review.customer_name}</span>
                              {review.verified_purchase && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <BadgeCheck className="w-3 h-3 text-emerald-600" /> Verified Buyer
                                </span>
                              )}
                            </div>
                            <div className="flex text-amber-400 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < Math.floor(review.rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-stone-200'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>

                          <span className="text-[11px] text-stone-400 font-mono">
                            {new Date(review.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {review.title && (
                          <h5 className="font-extrabold text-stone-900 text-xs pt-0.5">
                            {review.title}
                          </h5>
                        )}

                        <p className="text-xs text-stone-600 leading-relaxed font-medium">
                          {review.message}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                          <button
                            onClick={() => handleUpvote(review.feedback_id)}
                            className="flex items-center gap-1 text-stone-500 hover:text-amber-700 transition"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Helpful ({review.helpful_count || 0})</span>
                          </button>

                          {review.admin_reply && (
                            <span className="text-amber-800 font-semibold italic text-[11px]">
                              Halwai Response: "{review.admin_reply}"
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
