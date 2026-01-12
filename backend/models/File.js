import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    /* OWNER */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: String,
    url: String,
    publicId: String,
    mimeType: String,
    size: Number,

    /* 🔐 USERS WITH ACCESS */
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
      },
    ],

    /* 📨 ACCESS REQUESTS */
    accessRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
