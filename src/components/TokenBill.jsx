import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const TOKEN_PRICE = 0.05;

const TokenBill = ({ tokenCount, setTokenCount }) => {

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setTokenCount(isNaN(value) ? 0 : value);
    };

    const totalPrice = (tokenCount * TOKEN_PRICE).toFixed(2);

    return (
        <Card className="max-w-md mx-auto p-6 space-y-4 w-full border-none shadow-none">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Token Bill</CardTitle>
                <CardDescription>Enter the amount of tokens you want to buy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Label>Token Amount</Label>
                <Input
                    id="tokenCount"
                    type="number"
                    placeholder="Enter the amount of tokens you want to buy"
                    className="mt-2"
                    value={tokenCount}
                    onChange={handleInputChange}
                    min={0}
                />
            <Separator />

            <div className="text-sm text-muted-foreground">
                Token Price:
                <span className="font-medium text-black ml-2">${TOKEN_PRICE.toFixed(2)}</span>
            </div>

            <div className="text-lg font-bold">
                Total Price:
                <span className="text-primary ml-2">${totalPrice}</span>
            </div>
        </CardContent>
    </Card >
  );
}
export default TokenBill;