import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = 'pkmn-yt-raw-videos';
const processedVideoBucketName = 'pkmn-yt-processed-videos';

const localRawVideoPath = './raw-videos';
const localProcessedVideoPath = './processed-videos';

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
  ensureDirectoryExistence(localRawVideoPath);
  ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * @param {string} inputFileName - The name of the file to delete from the
 * {@link localRawVideoPath} directory.
 * @param {string} outputFileName - The name of the file to delete from the
 * {@link localProcessedVideoPath} directory.
 * @return A promise that resolves when the files have been deleted.
 */
export async function cleanDirectories(
  inputFileName: string,
  outputFileName: string
) {
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);
}

/**
 * @param {string} rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param {string} processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @return {Promise<void>} A promise that resolves when the video has been converted.
 */
export function convertVideo(
  rawVideoName: string,
  processedVideoName: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions('-vf', 'scale=-1:480') // 480p
      .on('end', () => {
        console.log('Video processing finished.');
        resolve();
      })
      .on('error', (err) => {
        console.log(`An error occurred during processing: ${err.message}`);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

/**
 * @param {string} fileName - The name of the file to download from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @return A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
  await storage
    .bucket(rawVideoBucketName)
    .file(fileName)
    .download({
      destination: `${localRawVideoPath}/${fileName}`,
    });

  console.log(
    `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
  );
}

/**
 * @param {string} fileName - The name of the file to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @return A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
  const bucket = storage.bucket(processedVideoBucketName);

  // Upload video to the bucket
  await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
    destination: fileName,
  });
  console.log(
    `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
  );

  // Set the video to be publicly viewable
  await bucket.file(fileName).makePublic();
}

/**
 * @param {string} fileName - The name of the file to delete from the
 * {@link localRawVideoPath} directory.
 * @return {Promise<void>} A promise that resolves when the file has been deleted.
 */
export function deleteRawVideo(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param {string} fileName - The name of the file to delete from the
 * {@link localProcessedVideoPath} directory.
 * @return {Promise<void>} A promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @return {Promise<void>} A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) {
          console.log(`File deleted at ${filePath}`);
          resolve();
        } else {
          console.log(`Failed to delete file at ${filePath}`, err);
          reject(err);
        }
      });
    } else {
      console.log(`File not found at ${filePath}, skipping the delete.`);
      resolve();
    }
  });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
    console.log(`Directory created at ${dirPath}`);
  }
}
