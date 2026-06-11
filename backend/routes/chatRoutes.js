import express from "express";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const isParticipant = (chat, userId) => {
  return (
    chat.donorId?.toString() === userId || chat.hospitalId?.toString() === userId
  );
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

router.post("/thread", verifyToken, async (req, res) => {
  try {
    const {
      alertId,
      donorId,
      hospitalId,
      donorName,
      hospitalName,
      title
    } = req.body;

    if (!donorId || !hospitalId || !donorName || !hospitalName || !title) {
      return res.status(400).json("Missing chat data");
    }

    if (![donorId, hospitalId].includes(req.user.id)) {
      return res.status(403).json("Access denied");
    }

    let chat = await Chat.findOne({ alertId, donorId, hospitalId });
    if (!chat) {
      chat = new Chat({
        alertId,
        donorId,
        hospitalId,
        donorName,
        hospitalName,
        title,
        unreadFor: {
          donor: false,
          hospital: false
        }
      });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

router.get("/threads", verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [{ donorId: req.user.id }, { hospitalId: req.user.id }]
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(
      chats.map((chat) => ({
        id: chat._id,
        title: chat.title,
        donorId: chat.donorId,
        hospitalId: chat.hospitalId,
        donorName: chat.donorName,
        hospitalName: chat.hospitalName,
        lastMessage: chat.messages[chat.messages.length - 1]?.text || "No messages yet",
        unread: chat.unreadFor?.[req.user.role],
        updatedAt: chat.updatedAt,
        alertId: chat.alertId
      }))
    );
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json("Chat not found");
    }

    const chat = await Chat.findById(req.params.id).lean();
    if (!chat || !isParticipant(chat, req.user.id)) {
      return res.status(403).json("Access denied");
    }

    if (chat.unreadFor?.[req.user.role]) {
      await Chat.findByIdAndUpdate(req.params.id, {
        $set: { [`unreadFor.${req.user.role}`]: false }
      });
    }

    res.json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

router.post("/:id/message", verifyToken, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json("Chat not found");
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json("Message is required");
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat || !isParticipant(chat, req.user.id)) {
      return res.status(403).json("Access denied");
    }

    const senderRole = req.user.role;
    const otherRole = senderRole === "donor" ? "hospital" : "donor";

    chat.messages.push({
      senderId: req.user.id,
      senderRole,
      text: text.trim()
    });
    chat.unreadFor = {
      donor: otherRole === "donor",
      hospital: otherRole === "hospital"
    };

    await chat.save();

    res.json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

export default router;
