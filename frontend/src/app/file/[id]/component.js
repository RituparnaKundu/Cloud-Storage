"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Mail, Copy } from "lucide-react";
import { Input } from "@/components/ui/input"; // Assuming this is a custom Input component

const FileDetails = () => {
  const id = window.location.pathname.split("/").pop();
  const [fileDetails, setFileDetails] = React.useState(null);
  const [ownerDetails, setOwnerDetails] = React.useState(null);
  const [encryptionKey, setEncryptionKey] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [showMailInput, setShowMailInput] = React.useState(false);

  React.useEffect(() => {
    async function fetchFileDetails() {
      if (!id) return;

      const data = JSON.parse(localStorage.getItem("data"));
      const userId = data?.result?._id;

      try {
        const response = await fetch(`http://localhost:3001/users/${userId}/files/${id}`);
        const fileData = await response.json();
        setFileDetails(fileData);

        const ownerResponse = await fetch(`http://localhost:3001/users/${fileData.owner}`);
        const ownerData = await ownerResponse.json();
        setOwnerDetails(ownerData);
      } catch (error) {
        console.error("Error fetching file details:", error);
      }
    }

    fetchFileDetails();
  }, [id]);

  const handleDownload = async () => {
    if (!encryptionKey) {
      alert("Please enter an encryption key");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/files/download/${id}`, {
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
      a.download = fileDetails.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied to clipboard");
    });
  };

  const handleMail = async () => {
    if (!recipientEmail) {
      alert("Please enter a recipient email");
      return;
    }

    const downloadLink = window.location.href;

    try {
      const response = await fetch("http://localhost:3001/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail,
          downloadLink,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      alert("Email sent successfully");
      setRecipientEmail("");
      setShowMailInput(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email");
    }
  };

  if (!fileDetails || !ownerDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-10 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 p-4">
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">This file is created by {ownerDetails.firstName} {ownerDetails.lastName}</h1>
          <p className="text-gray-600">{ownerDetails.email}</p>
        </div>
        <div className="mt-10 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 p-4">
          <Card className="w-full">
            <CardHeader className="px-7">
              <CardTitle>{fileDetails.fileName}</CardTitle>
              <CardDescription>{fileDetails.description || "No description available"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <p><strong>File Type:</strong> {fileDetails.fileType}</p>
                <p><strong>File Size:</strong> {(fileDetails.fileSize / 1024).toFixed(2)} KB</p>
                <p><strong>Uploaded At:</strong> {new Date(fileDetails.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="px-7">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <Popover>
                  <PopoverTrigger>
                    <Button className="w-full">
                      <Download /> Download
                    </Button>
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
                      <Button onClick={handleDownload} className="bg-blue-500 text-white p-2 rounded">
                        Submit
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button onClick={handleCopyLink} className="w-full">
                  <Copy /> Copy Link
                </Button>
                <Button onClick={() => setShowMailInput(!showMailInput)} className="w-full">
                  <Mail /> Mail
                </Button>
                {showMailInput && (
                  <div className="flex flex-col space-y-2 p-4">
                    <label htmlFor="recipient-email" className="text-sm font-medium">
                      Recipient Email
                    </label>
                    <Input
                      id="recipient-email"
                      type="email"
                      placeholder="Enter recipient email"
                      className="p-2 border rounded"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                    <Button onClick={handleMail} className="bg-blue-500 text-white p-2 rounded">
                      Send Email
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileDetails;
