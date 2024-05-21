import multer from "multer";
import crypto from "crypto";
import AWS from "aws-sdk";
import { promisify } from "util";
import { pipeline } from "stream";
import { createCipheriv, createDecipheriv } from "crypto";
import File from "../models/File.js";
import redisClient from '../redisClient.js';
import { getId } from "../utils/id.js";
import dotenv from "dotenv";

const pipelineAsync = promisify(pipeline);
dotenv.config();
// Configure AWS SDK
AWS.config.update({ 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("file"); 
  
// Upload and encrypt the file, store metadata and keys in MongoDB and Redis
export const uploadFile = async (req, res) => { 
  console.log(`S3 Bucket Name: ${BUCKET_NAME}`);
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "File upload failed" });
    }
    const {
      buffer: fileBuffer,
      originalname: fileName,
      mimetype: fileType,
      size: fileSize,
    } = req.file;
    const encryptionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // Encrypt the file data
    const cipher = createCipheriv("aes-256-cbc", encryptionKey, iv);
    const encryptedData = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final(),
    ]);

    const id = getId(req.headers?.authorization?.split(" ")[1]);
    const filePath = `${id}/${Date.now()}-${fileName}.enc`;

    // Upload the encrypted file to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: encryptedData,
      ContentType: fileType
    };

    s3.upload(uploadParams, async (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error uploading file to S3" });
      }

      // Save the file metadata to MongoDB
      const file = new File({
        fileName,
        owner: id,
        filePath: filePath,
        fileType,
        fileSize,
        iv: iv.toString("hex"),
        description: req.headers["description"]
      });

      try {
        await file.save();
        const keyFileData = encryptionKey.toString("base64");
        const fileId = file._id.toString();

        // Cache the file metadata and key in Redis
        const metadata = {
          fileName,
          filePath,
          fileType,
          fileSize,
          iv: iv.toString("hex"),
          owner: id,
          description: req.headers["description"]
        };

        redisClient.setex(fileId, 3600, JSON.stringify({ metadata, encryptionKey: keyFileData }));

        // Invalidate the cache for the user's files
        const userFilesCacheKey = `user_files_${id}`;
        redisClient.del(userFilesCacheKey);

        // Send the key file as an attachment in the response
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${fileName}.key`
        );
        res.setHeader("x-key-b64", keyFileData);
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("fileId", fileId);
        res.status(200).json({ message: "File uploaded and saved successfully", file });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "File upload failed" });
      }
    });
  });
};

// Download the file and decrypt it using the key stored in metadata or Redis
export const downloadFile = async (req, res) => {
  const { id } = req.params;
  console.log(`id: ${req.headers["x-encryption-key"].length} ${req.headers["x-encryption-key"]}`);
  if (!req.headers["x-encryption-key"]) {
    return res.status(400).json({ message: "Encryption key is required" });
  }
  // check if key is of proper format or not
  if (req.headers["x-encryption-key"].length !== 44) {
    return res.status(400).json({ message: "Invalid encryption key" });
  }

  redisClient.get(id, async (err, cachedData) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to retrieve file metadata from cache" });
    }

    let file, encryptionKey;

    if (cachedData) {
      const { metadata, encryptionKey: cachedKey } = JSON.parse(cachedData);
      file = metadata;
      encryptionKey = Buffer.from(cachedKey, "base64");
    } else {
      try {
        file = await File.findById(id);  
        if (!file) {
          return res.status(404).json({ message: "File not found" });
        }
        encryptionKey = Buffer.from(req.headers["x-encryption-key"], "base64");

        // Cache the file metadata and key in Redis
        redisClient.setex(id, 3600, JSON.stringify({ metadata: file, encryptionKey: encryptionKey.toString("base64") }));
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to retrieve file metadata from database" });
      }
    }

    const filePath = file.filePath;
    const iv = Buffer.from(file.iv, "hex");
    const fileName = file.fileName;
    const fileType = file.fileType;
    const fileSize = file.fileSize;

    // Download the encrypted file from S3
    const getParams = {
      Bucket: BUCKET_NAME,
      Key: filePath
    };

    s3.getObject(getParams, async (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error retrieving file from S3" });
      }

      const decipher = createDecipheriv("aes-256-cbc", encryptionKey, iv);
      const decryptedData = Buffer.concat([
        decipher.update(data.Body),
        decipher.final(),
      ]);

      // Send the decrypted file as response
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.setHeader("Content-Type", fileType);
      res.setHeader("Content-Length", fileSize);
      res.status(200).send(decryptedData);
    });
  });
};

export const deleteFile = async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete the file from S3
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: file.filePath
    };

    s3.deleteObject(deleteParams, async (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error deleting file from S3" });
      }

      await File.findByIdAndRemove(id);

      // Clear cache for the deleted file
      redisClient.del(id);

      // Invalidate user files cache to ensure it reflects the deleted file
      const userFilesCacheKey = `user_files_${file.owner}`;
      redisClient.del(userFilesCacheKey);

      res.json({ message: "File deleted successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File deletion failed" });
  }
};

// Get all files of a user
// Get all files of a user
// Get all files of a user
export const getUserFiles = async (req, res) => {
  const { id } = req.params;
  const userFilesCacheKey = `user_files_${id}`;

  redisClient.get(userFilesCacheKey, async (err, cachedData) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to retrieve files from cache" });
    }

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      try {
        const files = await File.find({ owner: id });
        if (!files.length) {
          return res.status(404).json({ message: "No files found" });
        }

        // Cache user files in Redis
        redisClient.setex(userFilesCacheKey, 3600, JSON.stringify(files));
        res.status(200).json(files);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "File retrieval failed" });
      }
    }
  });
};



// Get user file by ID

export const getUserFile = async (req, res) => {
  const { id } = req.params;

  redisClient.get(id, async (err, cachedData) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to retrieve file metadata from cache" });
    }

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      try {
        const file = await File.findById(id);
        if (!file) {
          return res.status(404).json({ message: "File not found" });
        }

        // Cache the file metadata in Redis
        redisClient.setex(id, 3600, JSON.stringify(file));
        res.status(200).json(file);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "File retrieval failed" });
      }
    }
  });
};


// Update file metadata
// Update file metadata
export const updateFile = async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    const { fileName, description } = req.body;
    file.fileName = fileName;
    file.description = description;
    await file.save();

    // Update cache
    const updatedMetadata = {
      fileName,
      filePath: file.filePath,
      fileType: file.fileType,
      fileSize: file.fileSize,
      iv: file.iv,
      owner: file.owner,
      description: file.description
    };
    redisClient.setex(id, 3600, JSON.stringify(updatedMetadata));

    // Invalidate user files cache to ensure it reflects the updated file
    const userFilesCacheKey = `user_files_${file.owner}`;
    redisClient.del(userFilesCacheKey);

    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File update failed" });
  }
};


//get file by just id

export const getFile = async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findById(id);
    if
    (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.status(200).json(file);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "File retrieval failed" });
  }
}