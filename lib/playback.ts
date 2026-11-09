export type Playback =
  | { kind: "instagram"; src: string }
  | { kind: "youtube"; src: string }
  | { kind: "file"; src: string };

export function playbackFrom(value: string | undefined): Playback | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "instagram.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      const code = parts[1];
      if (!code || code === "embed") return null;
      const type = parts[0] === "reel" || parts[0] === "reels" ? "reel" : "p";
      return { kind: "instagram", src: `https://www.instagram.com/${type}/${code}/embed/?autoplay=1` };
    }
    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? { kind: "youtube", src: youtube(id) } : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
      return id ? { kind: "youtube", src: youtube(id) } : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? { kind: "file", src: `https://player.vimeo.com/video/${id}?autoplay=1` } : null;
    }
    return { kind: "file", src: value };
  } catch {
    return null;
  }
}

function youtube(id: string) {
  return `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&playsinline=1&rel=0`;
}
