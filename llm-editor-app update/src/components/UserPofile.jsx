import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function UserProfile({ userInfo }) {
    // if userInfo is null or undefined, show loading state
    if (!userInfo) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>Loading user information...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <span className="text-muted-foreground block text-sm">Username</span>
                    <p className="text-base font-medium">{userInfo.username || 'N/A'}</p>
                </div>

                <div>
                    <span className="text-muted-foreground block text-sm">Email</span>
                    <p className="text-base font-medium">{userInfo.email || 'N/A'}</p>
                </div>

                <div>
                    <span className="text-muted-foreground block text-sm">Role</span>
                    <p className="text-base font-medium capitalize">{userInfo.role || 'N/A'}</p>
                </div>
            </CardContent>
        </Card>
    );
}


