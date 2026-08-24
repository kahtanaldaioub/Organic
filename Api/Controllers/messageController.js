import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    console.log("body:", req.body);

    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Missing receiver or content" });
    }

    const newMsg = new Message({ senderId, receiverId, content });
    await newMsg.save();

    res.status(201).json(newMsg);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};


// ✅ Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    if (!otherUserId || typeof otherUserId !== "string") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

// ✅ Get all conversation partners (unique)
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId receiverId", "name email")
      .sort({ createdAt: -1 });

    const partners = {};
    messages.forEach((msg) => {
      const partner =
        msg.senderId._id.toString() === userId
          ? msg.receiverId
          : msg.senderId;
      if (partner && !partners[partner._id]) {
        partners[partner._id] = partner;
      }
    });

    res.json(Object.values(partners));
  } catch (err) {
    console.error("Error getting conversations:", err);
    res.status(500).json({ message: "Failed to get conversations" });
  }
};
