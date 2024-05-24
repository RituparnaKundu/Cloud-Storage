"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock, User } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
      setUser(data.result);
    }
  }, []);
  const userIn = localStorage?.getItem("data") ? user?.firstName[0] + user?.lastName[0] : "U"

  return (
    <nav className="bg-white w-full border-b shadow-md">
      <div className="flex items-center justify-between px-4 max-w-screen-xl mx-auto">
        <div className="py-3 md:py-5">
          <Link href="/">
            <h1 className="text-3xl font-bold flex flex-row "> <Lock color="#1104c3" className="mt-1 mr-2" /> Encrypted File storage</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={<User />} />
                <AvatarFallback>
                  {userIn}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user && (
                <>
                  <DropdownMenuItem>
                    Name: {user.firstName} {user.lastName}
                  </DropdownMenuItem>
                  <DropdownMenuItem>Email: {user.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <Link href="/update-profile">Update Profile</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
