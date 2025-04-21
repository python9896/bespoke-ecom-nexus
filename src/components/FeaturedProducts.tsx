
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  stock: number;
}

interface FeaturedProductsProps {
  products: Product[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  const addToCart = (product: Product) => {
    // This is a placeholder - we'll implement actual cart functionality later
    toast.success(`${product.name} added to cart`);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No featured products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden flex flex-col">
          <div className="h-48 overflow-hidden bg-gray-100">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
          <CardContent className="pt-4 flex-grow">
            <Link to={`/product/${product.id}`}>
              <h3 className="font-semibold text-lg hover:text-primary truncate">{product.name}</h3>
            </Link>
            <p className="text-primary font-bold mt-2">${product.price}</p>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              onClick={() => addToCart(product)} 
              className="w-full"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default FeaturedProducts;
