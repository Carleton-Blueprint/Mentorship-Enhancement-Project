import * as React from "react";

import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";

export const Login = () => {
  return (
    <div className="flex items-center justify-center h-screen">
    <div className="border-2 border-gray-200 rounded-lg p-6">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Login using Microsoft Authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Account</Label>
                <Input id="name" placeholder="SSSC.cmail@carleton.ca" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Login</Button>
        </CardFooter>
      </Card>
    </div>
    </div>
  );
};
