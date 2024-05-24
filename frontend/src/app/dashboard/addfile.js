"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Copy, Download } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";

export function Addfile() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [responseKey, setResponseKey] = useState("");
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);


  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !description) {
      alert("Please provide both file and description");
      return;
    }

    const data = JSON.parse(localStorage.getItem("data"));
    const token = data?.token;

    if (!token) {
      alert("No authentication token found");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:3001/files/upload", formData, {
        headers: {
          "description": description,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const responseKey = response.headers["x-key-b64"];
      setResponseKey(responseKey);
      setKeyDialogOpen(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    } finally {
      setOpen(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(responseKey);
    alert("Encryption key copied to clipboard");
  };

  const handleDownloadKey = () => {
    const element = document.createElement("a");
    const file = new Blob([responseKey], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "encryption_key.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>
            <FileUp />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Drop your file here or click to upload.
          </DialogDescription>
          <input type="file" onChange={handleFileChange} />
          <Input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
        <DialogContent>
          <DialogTitle>Encryption Key</DialogTitle>
          <DialogDescription>
            This key is available for only one time. Please copy or download it.
          </DialogDescription>
          <div className="flex items-center space-x-2 mt-4">
            <Input
              type="text"
              readOnly
              value={responseKey}
              className="flex-1"
            />
            <Button onClick={handleCopyKey}>
              <Copy className="mr-2" /> Copy
            </Button>
            <Button onClick={handleDownloadKey}>
              <Download className="mr-2" /> Download
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setKeyDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
