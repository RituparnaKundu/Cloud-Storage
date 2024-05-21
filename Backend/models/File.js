import mongoose from "mongoose";
const FileSchema = new mongoose.Schema(
    {
        fileName: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        description: String,
        fileType: {
            type: String,
            required: true,
        },
        encryptionKey: {
            type: String,
            required: false,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        iv: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const File = mongoose.model("File", FileSchema);

export default File;
