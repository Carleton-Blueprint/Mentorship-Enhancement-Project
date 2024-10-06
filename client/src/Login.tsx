import React, { useState } from "react";

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
import useSignIn from "react-auth-kit/hooks/useSignIn";



const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export const Login = ({setLoggedIn}: any) => {
  const signIn = useSignIn();
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${serverUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      // Check if response has content before calling .json()
      if (response.ok) {
        const data = await response.json();

        if (data.token) {
          // Save the token and user data
          signIn({
            auth: {
              token: data.token,
              // expiresAt: 3600,
            },
            userState: { email: data.email },
          });
          alert("Signed in successfully");
          setLoggedIn(true);
        } else {
          alert("Invalid credentials");
        }
      } else {
        // Handle server error response
        const errorText = await response.text(); // Fetch the error message if any
        alert(`Login failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const handleSubmitRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${serverUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("error registering");
        return;
      }

      // Save the token in local storage and set authentication state
      signIn({
        auth: {
          token: data.token,
        },
        userState: { email: registerEmail },
      });

      alert("Registration successful!");
    } catch (err) {
      alert("Something went wrong, please try again");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="border-2 border-gray-200 rounded-lg p-6 m-10">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login using JWT</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitLogin}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Account</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="SSSC.cmail@carleton.ca"
                  />
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  ></Input>
                </div>
              </div>
              <Button className="mt-4" type="submit">
                Login
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {/* <Button variant="outline">Cancel</Button> */}
          </CardFooter>
        </Card>
      </div>
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>New User? Sign Up!</CardTitle>
            <CardDescription>Sign up using JWT</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRegister}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Account</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    placeholder="SSSC.cmail@carleton.ca"
                  />
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  ></Input>
                </div>
              </div>
              <Button className="mt-4" type="submit">
                Register
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between"></CardFooter>
        </Card>
      </div>
    </div>
  );
};
