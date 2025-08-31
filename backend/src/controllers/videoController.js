import prisma from '../prisma.js';
import { generate100msToken } from '../services/videoService.js';

// POST /video/token
export const generateVideoToken = async (req, res) => {
  // For Prebuilt + room code, token is not needed from backend
  return res.status(400).json({ error: 'Not needed for Prebuilt with room code' });
};

// GET /video/info/:bookingId
export const getVideoInfo = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });
    if (!booking || !booking.videoRoomId) {
      return res.status(404).json({ error: 'No video room for this booking' });
    }
    res.json({
      roomCode: booking.videoRoomId, // send as roomCode for Prebuilt
      dateTime: booking.dateTime,
      type: booking.type
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get video info' });
  }
};
