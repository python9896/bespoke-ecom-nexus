
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Discover Amazing Products</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl">
          Shop the latest trends and find everything you need in one place. Quality products at competitive prices.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/shop">
            <Button size="lg" className="text-lg px-8">
              Shop Now
            </Button>
          </Link>
          <Link to="/categories">
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white hover:text-gray-900">
              Browse Categories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
