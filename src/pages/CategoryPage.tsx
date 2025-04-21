import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch category info
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("id", parseInt(id || '0'))
          .single();

        if (categoryError) throw categoryError;
        setCategory(categoryData);

        // Fetch products in this category
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", parseInt(id || '0'));

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryAndProducts();
    }
  }, [id]);

  const addToCart = (product: Product) => {
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Category not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mb-8">{category.description}</p>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category</p>
            <Link to="/shop" className="text-primary hover:underline mt-4 inline-block">
              Browse all products
            </Link>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
