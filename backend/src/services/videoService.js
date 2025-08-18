import pkg from '@100mslive/server-sdk';
const { SDK } = pkg;
import axios from 'axios';

const accessKey = process.env.HMS_ACCESS_KEY;
const secret = process.env.HMS_SECRET;
const templateId = process.env.HMS_TEMPLATE_ID;
const managementToken = process.env.HMS_MANAGEMENT_TOKEN;

const sdk = new SDK(accessKey, secret);

// Create a 100ms room for a booking
export async function create100msRoom(bookingId) {
  const room = await sdk.rooms.create({
    name: `booking_${bookingId}_${Date.now()}`,
    description: `Room for booking ${bookingId}`,
    template_id: templateId // Use template from env
  });
  return room.id;
}

// Create a 100ms room code for a roomId using REST API
export async function create100msRoomCode(roomId) {
  try {
    const response = await axios.post(
      `https://api.100ms.live/v2/room-codes/room/${roomId}`,
      {
        role: 'guest',
        enabled: true
      },
      {
        headers: {
          Authorization: `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Room code API response:', response.data);
    // Extract the guest code from the response
    if (response.data && Array.isArray(response.data.data)) {
      const guestCode = response.data.data.find(c => c.role === 'guest')?.code;
      return guestCode;
    }
    return undefined;
  } catch (err) {
    console.error('Error from 100ms room code API:', err.response ? err.response.data : err);
    return undefined;
  }
}

// Generate a 100ms join token for a user
export async function generate100msToken(roomId, userName, role = 'guest') {
  const { token } = await sdk.auth.getAuthToken({
    roomId,
    role,
    userId: userName
  });
  return token;
}
