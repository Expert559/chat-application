import { Message } from "postcss";

export default interface Media {
  _id: string;
  url: string; // URL of the media file
  mediaType: string; // Type of the media (e.g., 'image', 'video', etc.)
  size?: number; // Size of the media file in bytes (optional)
  duration?: number; // Duration of the media in seconds (optional, for videos)
  thumbnail?: string; // URL for a thumbnail image (optional)
  createdAt?: Date; // Timestamp when the document was created
  updatedAt?: Date; // Timestamp when the document was last updated
}
