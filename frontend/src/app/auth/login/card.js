"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, useForm } from "react-hook-form";
import { useRouter } from 'next/navigation'
import axios from "axios";

export function LoginForm() {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  const form = useForm();
  const router = useRouter();
 async function onSubmit(data) {
    console.log(data);
    try {
      const response = await axios.post(`http://localhost:3001/auth/login`, data);
      
      console.log(JSON.stringify(response.data));
      localStorage.setItem("data", JSON.stringify(response.data));
      router.push('/dashboard');
      
      
    } catch (error) {
      if (error?.response?.data?.message === "Invalid credentials" || response.status === 400) {
        alert("Invalid credentials");
        return;
        
      }
      else {
        alert("Something went wrong");
      }
      console.error(error);
    }
  }
  

 

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email", { required: true })}
              />
              {errors.email && <span>This field is required</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: true })}
              />
              {errors.password && <span>This field is required</span>}
            </div>
            <Button onClick={
              handleSubmit(onSubmit)
            } className="w-full">
              Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </div>
        </form>
    
      </CardContent>
    </Card>
  );
}
