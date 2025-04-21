
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  stock: number;
  category_id: number;
  rating: number;
  category: {
    name: string;
  };
}

interface Review {
  id: number;
  product_id: number;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            category:category_id (
              name
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        setProduct(data);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", id);

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Product Image */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-auto object-contain max-h-[400px]"
              />
            ) : (
              <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {Array(5).fill(0).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < Math.round(product.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">({reviews.length} reviews)</span>
            </div>
            
            <p className="text-2xl font-bold text-primary mt-4">${product.price}</p>
            
            {product.category && (
              <div className="mt-4">
                <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                  {product.category.name}
                </span>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium">Description</h3>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium">Availability</h3>
              <p className={`mt-2 ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
              </p>
            </div>
            
            {product.stock > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="mx-4 w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <Button
                size="lg"
                className="w-full"
                onClick={addToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-2">
                      {Array(5).fill(0).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
