
import { useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const OrderConfirmation = () => {
  // Generate a random order number for demo purposes
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  
  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-500">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Order Number:</span>
              <span>{orderNumber}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-medium">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-medium">Payment Method:</span>
              <span>Credit Card</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Shipping Method:</span>
              <span>Standard Shipping</span>
            </div>
          </div>

          <div>
            <p className="text-center text-gray-500">
              A confirmation email has been sent to your email address with the order details.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link to="/" className="w-full">
            <Button className="w-full">Return to Home</Button>
          </Link>
          <Link to="/shop" className="w-full">
            <Button variant="outline" className="w-full">Continue Shopping</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
