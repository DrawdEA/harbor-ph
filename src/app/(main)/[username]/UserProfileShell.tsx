"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfileHeader from "./UserProfileHeader";
import { UserProfile } from "@/types";

interface UserProfileShellProps {
  profile: UserProfile;
  homeContent: React.ReactNode;
  historyContent: React.ReactNode;
  bookingsContent: React.ReactNode;
}

export default function UserProfileShell({ profile, homeContent, historyContent, bookingsContent }: UserProfileShellProps) {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="bg-muted/40 text-foreground min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-0">
          <UserProfileHeader 
            profile={profile} 
          />

          <main className="px-2 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
            <div className="mt-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="home">Home</TabsTrigger>
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="portfolio">History</TabsTrigger>
                </TabsList>

                <TabsContent value="home" className="space-y-6">
                  {homeContent}
                </TabsContent>

                <TabsContent value="bookings" className="space-y-6">
                  {bookingsContent}
                </TabsContent>

                <TabsContent value="portfolio" className="space-y-6">
                  {historyContent}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </CardContent>
      </Card>
    </div>
  );
}