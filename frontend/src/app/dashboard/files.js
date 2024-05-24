"use client";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, Edit, Share2, Trash } from "lucide-react";
import { Addfile } from "./addfile";

export default function Component() {
  const [orders, setOrders] = React.useState([]);
  const [filteredOrders, setFilteredOrders] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("asc");
  const [encryptionKey, setEncryptionKey] = React.useState("");
  const [selectedFileId, setSelectedFileId] = React.useState(null);
  const [editFileName, setEditFileName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");

  React.useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("http://localhost:3001/users/6631766f9b0d8509ee14bd1d/files");
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchOrders();
  }, []);

  const handleDownload = async () => {
    if (!encryptionKey) {
      alert("Please enter an encryption key");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/files/download/${selectedFileId}`, {
        method: "GET",
        headers: {
          "x-encryption-key": encryptionKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredOrders(
      orders.filter((order) =>
        order.fileName.toLowerCase().includes(term)
      )
    );
  };

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setFilteredOrders((prevOrders) =>
      [...prevOrders].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return newSortOrder === "asc" ? dateA - dateB : dateB - dateA;
      })
    );
  };

  const handleEdit = (order) => {
    setSelectedFileId(order._id);
    setEditFileName(order.fileName);
    setEditDescription(order.description);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:3001/files/update/${selectedFileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: editFileName,
          description: editDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update file");
      }

      alert("File updated successfully");
      setSelectedFileId(null);
    } catch (error) {
      console.error("Error updating file:", error);
      alert("Failed to update file");
    }
  };

  const handleDelete = async (fileId) => {
    console.log("fileId", fileId);
    try {
      const response = await fetch(`http://localhost:3001/files/delete/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setOrders(orders.filter((order) => order._id !== fileId));
      setFilteredOrders(filteredOrders.filter((order) => order._id !== fileId));
      alert("File deleted successfully");
      //reload
        window.location.reload();
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file");
    }
  };

  return (
    <Card className="w-full mx-10">
      <CardHeader className="px-7">
        <div className="flex justify-between">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Recent orders from your store.</CardDescription>
          </div>
          <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search by file name"
            value={searchTerm}
            onChange={handleSearch}
            className="p-2 border rounded"
          />
          
        </div>
          <div className="flex flex-col">
            <Addfile /> Upload File
          </div>
        </div>
        
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead 
                className="hidden md:table-cell"
                title="Change order"
              >
                <p className="flex flex-row hover:text-blue-500 cursor-pointer" onClick={toggleSortOrder}>
                  Date {sortOrder === "asc" ? "↑" : "↓"}
                </p>
              </TableHead>
              <TableHead className="text-right">Description</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {order.fileName.slice(0, 30)}...
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {order.fileType}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="secondary">
                    {order.iv ? "Encrypted" : "Unencrypted"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {order.description || <p className="text-muted-foreground">No description</p>}
                </TableCell>
                <TableCell className="text-right">
                  {(order.fileSize / 1024).toFixed(2)} KB
                </TableCell>
                <TableCell className=" flex justify-end space-x-2">
                  <Popover>
                    <PopoverTrigger onClick={() => setSelectedFileId(order._id)}>
                      <button className="text-sm text-muted-foreground">
                        <Download />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="flex flex-col space-y-2 p-4">
                        <label htmlFor="encryption-key" className="text-sm font-medium">
                          Encryption Key
                        </label>
                        <input
                          id="encryption-key"
                          type="password"
                          className="p-2 border rounded"
                          value={encryptionKey}
                          onChange={(e) => setEncryptionKey(e.target.value)}
                        />
                        <button
                          onClick={handleDownload}
                          className="bg-blue-500 text-white p-2 rounded"
                        >
                          Submit
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger onClick={() => handleEdit(order)}>
                      <button className="text-sm text-muted-foreground">
                        <Edit />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="flex flex-col space-y-2 p-4">
                        <label htmlFor="edit-file-name" className="text-sm font-medium">
                          File Name
                        </label>
                        <input
                          id="edit-file-name"
                          type="text"
                          className="p-2 border rounded"
                          value={editFileName}
                          onChange={(e) => setEditFileName(e.target.value)}
                        />
                        <label htmlFor="edit-description" className="text-sm font-medium">
                          Description
                        </label>
                        <input
                          id="edit-description"
                          type="text"
                          className="p-2 border rounded"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <button
                          onClick={handleEditSubmit}
                          className="bg-blue-500 text-white p-2 rounded"
                        >
                          Submit
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger onClick={() => setSelectedFileId(order._id)}>
                      <button className="text-sm text-muted-foreground">
                        <Trash />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="flex flex-col space-y-2 p-4">
                        <p>Are you sure you want to delete this file?</p>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="bg-red-500 text-white p-2 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
        
                  <Share2 onClick={() => window.location.href = `/file/${order._id}`} className="hover:text-blue-500 cursor-pointer" />
                  
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
