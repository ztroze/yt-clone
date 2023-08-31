import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

initializeApp({ credential: credential.applicationDefault() });

const firestore = new Firestore();

// Note: This requires setting an env variable in Cloud Run
/** if (process.env.NODE_ENV !== 'production') {
  firestore.settings({
      host: "localhost:8080", // Default port for Firestore emulator
      ssl: false
  });
} */

const videoCollectionId = "videos";

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}

/**
 * Fetches a video's metadata from Firestore.
 * @param videoId Identifies a video.
 */
export async function getVideo(videoId: string) {
  const snapshot = await firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .get();
  return (snapshot.data() as Video) ?? {};
}

/**
 * Sets a video's fields after uploading, overwriting if necessary.
 * @param videoId Identifies a video.
 * @param video The video whose fields are intended to be set.
 * @returns A promise that resolves when the videos fields have been written to
 * Firestore.
 */
export async function setVideo(videoId: string, video: Video) {
  return firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .set(video, { merge: true });
}

/**
 * Checks if a video is newly addressed by the processing service.
 * @param videoId Identifies a video.
 * @returns A promise that resolves when a video's status is undefined.
 */
export async function isVideoNew(videoId: string) {
  const video = await getVideo(videoId);
  return video?.status === undefined;
}
