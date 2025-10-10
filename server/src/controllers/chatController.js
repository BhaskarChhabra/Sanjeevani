import Chat from '../models/ChatHistory.js';

// Save chat
export const saveChat = async (req, res) => {
  try {
    const { userId, messages } = req.body;

    if (!userId || !messages) {
      return res.status(400).json({ success: false, message: 'Missing userId or messages' });
    }

    const chat = new Chat({ userId, messages });
    await chat.save();

    res.status(200).json({ success: true, message: 'Chat saved successfully' });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ success: false, message: 'Failed to save chat', error: error.message });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat', error: error.message });
  }
};


export const getChatByIdController = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.status(200).json({ success: true, messages: chat.messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch chat', error: err.message });
  }
};
