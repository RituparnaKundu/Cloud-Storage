"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";

const UserProfile = () => {
  const router = useRouter();
  const [userData, setUserData] = React.useState(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data && data.result) {
      setUserData(data.result);
      setFirstName(data.result.firstName);
      setLastName(data.result.lastName);
      setEmail(data.result.email);
    }
  }, []);

  const handleUpdate = async () => {
    if (!firstName || !lastName || !email) {
      alert("Please fill in all fields");
      return;
    }

    const token = JSON.parse(localStorage.getItem("data")).token;
    const userId = userData._id;

    try {
      const response = await axios.patch(`http://localhost:3001/users/${userId}`, {
        firstName,
        lastName,
        email,
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert("Profile updated successfully");
        const updatedData = { ...userData, firstName, lastName, email };
        localStorage.setItem("data", JSON.stringify({ result: updatedData, token }));
        setUserData(updatedData);
        router.push("/dashboard");
       
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-10 flex flex-col items-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="px-7">
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleUpdate} className="bg-blue-500 text-white p-2 rounded">
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;