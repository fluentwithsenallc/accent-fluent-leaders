type ZoomMeetingBody = {
  action: "create" | "update" | "delete" | "recordings";
  meetingId?: string;
  topic?: string;
  startTime?: string;
  duration?: number;
  timezone?: string;
};

type ZoomMeetingResponse = {
  uuid?: string;
  id?: number | string;
  host_id?: string;
  host_email?: string;
  topic?: string;
  type?: number;
  status?: string;
  start_time?: string;
  duration?: number;
  timezone?: string;
  created_at?: string;
  start_url?: string;
  join_url?: string;
  chat_join_url?: string;
  password?: string;
  h323_password?: string;
  pstn_password?: string;
  encrypted_password?: string;
};

type ZoomRecordingFile = {
  id?: string;
  meeting_id?: string;
  recording_start?: string;
  recording_end?: string;
  file_type?: string;
  file_size?: number;
  play_url?: string;
  download_url?: string;
  status?: string;
  recording_type?: string;
};

type ZoomRecordingsResponse = {
  uuid?: string;
  id?: number | string;
  topic?: string;
  start_time?: string;
  share_url?: string;
  recording_files?: ZoomRecordingFile[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  return value.trim();
}

function requiredDuration(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error("duration must be a positive number.");
  }
  return Math.round(value);
}

async function parseZoomError(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { message?: string; code?: number };
    return json.message ?? `Zoom API error ${response.status}`;
  } catch {
    return text || `Zoom API error ${response.status}`;
  }
}

async function getZoomAccessToken() {
  const clientId = Deno.env.get("ZOOM_CLIENT_ID");
  const clientSecret = Deno.env.get("ZOOM_CLIENT_SECRET");
  const accountId = Deno.env.get("ZOOM_ACCOUNT_ID");
  if (clientId && clientSecret && accountId) {
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
    });

    if (!response.ok) throw new Error(await parseZoomError(response));
    const token = (await response.json()) as { access_token?: string };
    if (!token.access_token) throw new Error("Zoom did not return an access token.");
    return token.access_token;
  }

  const bearerToken = Deno.env.get("ZOOM_BEARER_TOKEN");
  if (bearerToken) return bearerToken;

  throw new Error("Missing Zoom connection. Add Zoom OAuth secrets or a Zoom bearer token.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const zoomToken = await getZoomAccessToken();

    const body = (await req.json()) as ZoomMeetingBody;

    if (body.action === "create") {
      const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${zoomToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: requiredString(body.topic, "topic"),
          type: 2,
          start_time: requiredString(body.startTime, "startTime"),
          duration: requiredDuration(body.duration),
          timezone: body.timezone || "America/New_York",
          settings: {
            auto_recording: "cloud",
          },
        }),
      });

      if (!response.ok) throw new Error(await parseZoomError(response));
      const meeting = (await response.json()) as ZoomMeetingResponse;

      return jsonResponse({
        meetingId: meeting.id ? String(meeting.id) : null,
        uuid: meeting.uuid ?? null,
        joinUrl: meeting.join_url ?? null,
        startUrl: meeting.start_url ?? null,
        chatJoinUrl: meeting.chat_join_url ?? null,
        password: meeting.password ?? null,
        raw: meeting,
      });
    }

    if (body.action === "update") {
      const meetingId = requiredString(body.meetingId, "meetingId");
      const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${zoomToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: requiredString(body.topic, "topic"),
          start_time: requiredString(body.startTime, "startTime"),
          duration: requiredDuration(body.duration),
          timezone: body.timezone || "America/New_York",
        }),
      });

      if (!response.ok) throw new Error(await parseZoomError(response));
      return jsonResponse({ ok: true });
    }

    if (body.action === "delete") {
      const meetingId = requiredString(body.meetingId, "meetingId");
      const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${zoomToken}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(await parseZoomError(response));
      }

      return jsonResponse({ ok: true });
    }

    if (body.action === "recordings") {
      const meetingId = requiredString(body.meetingId, "meetingId");
      const response = await fetch(
        `https://api.zoom.us/v2/meetings/${encodeURIComponent(meetingId)}/recordings`,
        {
          headers: {
            Authorization: `Bearer ${zoomToken}`,
          },
        },
      );

      if (!response.ok) throw new Error(await parseZoomError(response));
      const recording = (await response.json()) as ZoomRecordingsResponse;
      const files = recording.recording_files ?? [];
      const preferredFile =
        files.find(
          (file) =>
            file.file_type === "MP4" &&
            ["shared_screen_with_speaker_view", "active_speaker", "gallery_view"].includes(
              file.recording_type ?? "",
            ),
        ) ??
        files.find((file) => file.file_type === "MP4") ??
        files.find((file) => file.play_url || file.download_url) ??
        null;

      return jsonResponse({
        ok: true,
        meetingId: recording.id ? String(recording.id) : meetingId,
        uuid: recording.uuid ?? null,
        shareUrl: recording.share_url ?? null,
        playUrl: preferredFile?.play_url ?? null,
        downloadUrl: preferredFile?.download_url ?? null,
        recordingType: preferredFile?.recording_type ?? null,
        fileType: preferredFile?.file_type ?? null,
        files,
        raw: recording,
      });
    }

    return jsonResponse({ error: "Invalid action." }, 400);
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Zoom function failed." },
      400,
    );
  }
});
