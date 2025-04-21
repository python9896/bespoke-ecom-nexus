
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { addToCart } from "@/utils/cartUtils";
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
  
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase.from("products").select("*");
        
        if (selectedCategory) {
          query = query.eq("category_id", selectedCategory);
        }
        
        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("id, name");
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  // --- UPDATE: Add toast and force cart update after addToCart ---
  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    // Optionally, force UI feedback / update after addToCart (if needed)
    // since addToCart already toasts, we don't need additional feedback here
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      let query = supabase.from("products").select("*");
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }
      const { data } = await query;
      setProducts(data || []);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from("products")
        .select("*")
        .ilike("name", `%${searchTerm}%`);

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Shop All Products</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow flex gap-2">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          <Select
            value={selectedCategory?.toString() || "all"}
            onValueChange={(value) => {
              setSelectedCategory(value === "all" ? null : parseInt(value));
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p>Loading products...</p>
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
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
                        onClick={() => handleAddToCart(product)} 
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
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
