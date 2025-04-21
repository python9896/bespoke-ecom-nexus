
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import FeaturedProducts from "@/components/FeaturedProducts";
import ProductCategories from "@/components/ProductCategories";
import Hero from "@/components/Hero";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .limit(4);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        toast.error("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="py-4 px-6 bg-white shadow-sm flex justify-between items-center">
        <div className="flex items-center space-x-10">
          <Link to="/" className="text-2xl font-bold text-primary">ShopNow</Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/shop" className="text-gray-600 hover:text-primary">Shop</Link>
            <Link to="/categories" className="text-gray-600 hover:text-primary">Categories</Link>
            <Link to="/about" className="text-gray-600 hover:text-primary">About</Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/cart">
            <Button variant="ghost" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-white">0</span>
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Hero />
        
        <section className="py-10 px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          {loading ? (
            <div className="flex justify-center">
              <p>Loading products...</p>
            </div>
          ) : (
            <FeaturedProducts products={featuredProducts} />
          )}
          <div className="mt-8 text-center">
            <Link to="/shop">
              <Button>View All Products</Button>
            </Link>
          </div>
        </section>

        <section className="py-10 px-6 max-w-7xl mx-auto bg-gray-50">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
          <ProductCategories />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ShopNow</h3>
            <p className="text-gray-300">Your one-stop shop for all your needs.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-gray-300 hover:text-white">Shop</Link></li>
              <li><Link to="/categories" className="text-gray-300 hover:text-white">Categories</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="text-gray-300">Email: info@shopnow.com</p>
            <p className="text-gray-300">Phone: (123) 456-7890</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ShopNow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
