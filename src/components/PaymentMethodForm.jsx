import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FaPaypal,FaApple,FaCreditCard } from "react-icons/fa";
import { useBuyTokens } from "@/costumeQuerys/tokenQuery";

export default function PaymentMethodForm({ tokenCount, setTokenCount }) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { buyTokens, isPending, isError, error } = useBuyTokens();
  
  const handleCheckout = () => {
    buyTokens(tokenCount);
    setTokenCount(0);
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Payment Method</CardTitle>
        <CardDescription>Choose a payment method to check out.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-4">
          <Button
            variant={paymentMethod === "card" ? "outline" : "ghost"}
            className={`flex-1 flex flex-col items-center justify-center h-24 ${
              paymentMethod === "card" ? "border-2 border-primary" : ""
            }`}
            onClick={() => setPaymentMethod("card")}
          >
            <div className="mb-2">
              <FaCreditCard/>

            </div>
            <span>Card</span>
          </Button>

          <Button
            variant={paymentMethod === "paypal" ? "outline" : "ghost"}
            className={`flex-1 flex flex-col items-center justify-center h-24 ${
              paymentMethod === "paypal" ? "border-2 border-primary" : ""
            }`}
            onClick={() => setPaymentMethod("paypal")}
          >
            <div className="mb-2">
              <FaPaypal/>
            </div>
            <span>Paypal</span>
          </Button>

          <Button
            variant={paymentMethod === "apple" ? "outline" : "ghost"}
            className={`flex-1 flex flex-col items-center justify-center h-24 ${
              paymentMethod === "apple" ? "border-2 border-primary" : ""
            }`}
            onClick={() => setPaymentMethod("apple")}
          >
            <div className="mb-2">
              <FaApple/>
            </div>
            <span>Apple</span>
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="First Last" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card number</Label>
          <Input id="cardNumber" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expMonth">Expires</Label>
            <Select>
              <SelectTrigger id="expMonth">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expYear">Year</Label>
            <Select>
              <SelectTrigger id="expYear">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 10}, (_, i) => i + new Date().getFullYear()).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvc">CVC</Label>
            <Input id="cvc" placeholder="CVC" />
          </div>
        </div>

        <Button 
          className="w-full bg-black font-semibold text-white rounded-md h-12"
          onClick={handleCheckout}
          disabled={tokenCount <= 0 || isPending}
        >
          {isPending ? "Processing..." : `Checkout`}
        </Button>
      </CardContent>
    </Card>
  );
}