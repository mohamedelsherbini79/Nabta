export interface VideoRoom {
  roomName: string;
  roomUrl: string;
}

export interface MeetingToken {
  token: string;
}

export interface VideoRoomProvider {
  createRoom(consultationId: string): Promise<VideoRoom>;
  createMeetingToken(roomName: string, userName: string, isOwner: boolean): Promise<MeetingToken>;
  roomUrlFromName(roomName: string): string;
}

export class VideoGatewayNotConfiguredError extends Error {
  constructor() {
    super("Video gateway is not configured (missing DAILY_API_KEY/DAILY_DOMAIN).");
    this.name = "VideoGatewayNotConfiguredError";
  }
}

const ROOM_LIFETIME_SECONDS = 2 * 60 * 60; // 2 hours — Daily auto-expires the room, no explicit delete needed.

function dailyCredentials(): { apiKey: string; domain: string } {
  const apiKey = process.env.DAILY_API_KEY;
  const domain = process.env.DAILY_DOMAIN;
  if (!apiKey || !domain) throw new VideoGatewayNotConfiguredError();
  return { apiKey, domain };
}

// Daily.co REST API: https://docs.daily.co/reference/rest-api
const dailyProvider: VideoRoomProvider = {
  async createRoom(consultationId) {
    const { apiKey } = dailyCredentials();

    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        name: `consult-${consultationId}`,
        privacy: "private",
        properties: { exp: Math.floor(Date.now() / 1000) + ROOM_LIFETIME_SECONDS },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url || !data?.name) {
      throw new Error(`Daily rooms create failed: ${data?.error ?? res.statusText}`);
    }

    return { roomName: data.name, roomUrl: data.url };
  },

  async createMeetingToken(roomName, userName, isOwner) {
    const { apiKey } = dailyCredentials();

    const res = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          is_owner: isOwner,
          exp: Math.floor(Date.now() / 1000) + ROOM_LIFETIME_SECONDS,
        },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.token) {
      throw new Error(`Daily meeting-tokens create failed: ${data?.error ?? res.statusText}`);
    }

    return { token: data.token };
  },

  roomUrlFromName(roomName) {
    const { domain } = dailyCredentials();
    return `https://${domain}.daily.co/${roomName}`;
  },
};

export const videoRoomProvider: VideoRoomProvider = dailyProvider;
