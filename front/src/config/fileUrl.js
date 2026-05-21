import { baseUrl } from "./index";

/**
 * Converts a coverImageUrl like "/api/v1/files/{uuid}" into a working img src.
 * Uses /api/v1/file/getFile/{id} endpoint (matches the backend file controller).
 */
export function fileUrl(url) {
  if (!url) return null;
  const id = url.split("/").pop();
  if (!id) return null;
  return `${baseUrl}/api/v1/file/getFile/${id}`;
}
