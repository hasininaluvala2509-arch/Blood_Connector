import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderRole: {
      type: String,
      enum: ["donor", "hospital"],
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request"
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    donorName: String,
    hospitalName: String,
    title: String,
    messages: [messageSchema],
    unreadFor: {
      donor: {
        type: Boolean,
        default: false
      },
      hospital: {
        type: Boolean,
        default: false
      }
    }
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
