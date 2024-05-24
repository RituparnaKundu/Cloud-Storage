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
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { baseUrl } from "@/lib/utils";


export function SignupForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const apicall = async (data) => {
    const base_url = baseUrl();
    try {
      const response = await axios.post(`${base_url}`+"/auth/register", data).then((res) => console.log(res));
      console.log(response);
      router.push('/auth/login');
    } catch (error) {
      console.log(error);
      if(error?.response?.data?.message === "User Already Exists" || response.status === 400) {
        alert("User Already Exists");
        return;
      }
      else if( error?.status === 201) {
        alert("User Registered Successfully");
        router.push('/login');
      }
      else {
        alert("Something went wrong");
      }
      console.error(error);
    }
  }

  const onSubmit = (data) => {
    apicall(data);
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                placeholder="Max"
                {...register("firstName", { required: "First name is required" })}
              />
              {errors.firstName && <span>{errors.firstName.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                placeholder="Robinson"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && <span>{errors.lastName.message}</span>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <span>{errors.email.message}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <span>{errors.password.message}</span>}
          </div>
          <Button type="submit" className="w-full">
            Create an account
          </Button>
          
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
