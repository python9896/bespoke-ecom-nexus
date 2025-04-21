
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  description: string;
}

const ProductCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*");

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading categories...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No categories available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.id} to={`/category/${category.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
              <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
              {category.description && (
                <p className="text-gray-500 text-sm line-clamp-2">{category.description}</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ProductCategories;
