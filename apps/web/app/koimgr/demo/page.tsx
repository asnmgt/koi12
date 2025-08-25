"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DemoPage() {
  const [progress, setProgress] = useState(70);

  return (
    <main className="p-8 font-sans space-y-6">
      <h1 className="text-3xl font-bold">KOI12 Demo Dashboard</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">KOI12 knowledge infrastructure is running in demo mode.</p>
              <Badge variant="secondary">Demo Active</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">✔ All core components are functional.</p>
              <Progress value={progress} />
              <p className="text-sm mt-2">{progress}% operational</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
