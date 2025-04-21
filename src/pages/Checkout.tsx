
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCart, clearCart } from "@/utils/cartUtils";

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");

  // Customer details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("ca"); // Default to California
  const [zipCode, setZipCode] = useState("");

  // Get cart items from localStorage
  const cartItems = getCart();

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax rate for demo
  };

  const calculateShipping = () => {
    return 5.99; // Flat shipping rate for demo
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }
    setLoading(true);

    try {
      // For debugging: log all details so we can investigate errors
      console.log("Checkout: submitting...", {
        cartItems,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode
      });

      // First try to find if customer exists by email
      let customerId = null;
      const { data: existingCustomers, error: customerLookupError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .limit(1);
      
      if (customerLookupError) {
        console.error("Error looking up customer:", customerLookupError);
      } else if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        console.log("Found existing customer:", customerId);
      } else {
        // Create customer if not exists
        const customerData = {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          address: `${address}, ${city}, ${state.toUpperCase()} ${zipCode}`
        };
        
        const { data: newCustomer, error: customerCreateError } = await supabase
          .from('customers')
          .insert([customerData])
          .select();
        
        if (customerCreateError) {
          console.error("Error creating customer:", customerCreateError);
        } else if (newCustomer && newCustomer.length > 0) {
          customerId = newCustomer[0].id;
          console.log("Created new customer:", customerId);
        }
      }

      const total = calculateTotal();

      // Create order with customer_id if available
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          { 
            total: total, 
            status: 'pending',
            customer_id: customerId
          }
        ])
        .select();

      console.log("Order insert result:", { orderData, orderError });

      if (orderError) throw orderError;
      if (!orderData || orderData.length === 0) {
        throw new Error("Failed to create order (empty orderData)");
      }

      const orderId = orderData[0].id;

      // Fix: Create order items without setting subtotal field
      for (const item of cartItems) {
        const orderItem = {
          order_id: orderId,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          // Remove subtotal as it's likely a computed column in the database
        };
        
        // Insert each item individually for better error tracking
        const { error: itemError } = await supabase
          .from('order_items')
          .insert(orderItem);
          
        if (itemError) {
          console.error(`Error inserting order item for product ${item.id}:`, itemError);
          throw itemError;
        }
      }

      // Update inventory (deduct purchased quantities)
      for (const item of cartItems) {
        const { error: stockUpdateError } = await supabase
          .from('products')
          .update({ stock: supabase.rpc('decrement', { x: item.quantity }) })
          .eq('id', item.id)
          .gt('stock', 0);
          
        if (stockUpdateError) {
          console.warn(`Failed to update stock for product ${item.id}:`, stockUpdateError);
          // Don't throw error here, continue with order
        }
      }

      clearCart();

      toast.success("Order placed successfully!");
      navigate("/order-confirmation");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(`Failed to place order. ${error?.message || ""}`);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
            <CardDescription>Add items to your cart to proceed to checkout</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/shop" className="w-full">
              <Button className="w-full">Browse Products</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Shipping Information */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John" 
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe" 
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john.doe@example.com" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      placeholder="(123) 456-7890" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="address">Street Address</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Main St" 
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        placeholder="New York" 
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select 
                        required
                        value={state}
                        onValueChange={setState}
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ca">California</SelectItem>
                          <SelectItem value="ny">New York</SelectItem>
                          <SelectItem value="tx">Texas</SelectItem>
                          <SelectItem value="fl">Florida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input 
                      id="zipCode" 
                      placeholder="10001" 
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit">Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit" && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="4242 4242 4242 4242" required />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="expiry">Expiration Date</Label>
                          <Input id="expiry" placeholder="MM/YY" required />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="nameOnCard">Name on Card</Label>
                        <Input id="nameOnCard" placeholder="John Doe" required />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Link to="/cart">
                  <Button variant="outline">Back to Cart</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary of cart items */}
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.name} <span className="text-gray-400">× {item.quantity}</span>
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping</span>
                      <span>${calculateShipping().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
