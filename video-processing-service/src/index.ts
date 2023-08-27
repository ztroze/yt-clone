import express from 'express';
import {
  cleanDirectories,
  convertVideo,
  downloadRawVideo,
  setupDirectories,
  uploadProcessedVideo,
} from './storage';

// Create local directories for raw and processed videos
setupDirectories();

const app = express();
app.use(express.json()); // Middleware for handling JSON request bodies

// Process a video file from Cloud Storage to 480p
app.post('/process-video', async (req, res) => {
  // Get the bucket and filename from the Cloud Pub/Sub message
  let data;
  try {
    const messageData = Buffer.from(req.body.message.data, 'base64').toString(
      'utf8'
    );
    data = JSON.parse(messageData);
    if (!data.name) {
      // Check if input filename exists
      throw new Error('Invalid message payload received.');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send('Bad Request: Missing filename.');
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;

  // Download raw video from Cloud Storage
  await downloadRawVideo(inputFileName);

  // Process the video to 480p
  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (err) {
    await cleanDirectories(inputFileName, outputFileName);
    console.error(err);
    return res
      .status(500)
      .send('Internal Server Error: Video Processing Failed.');
  }

  // Upload the processed video to Cloud Storage
  await uploadProcessedVideo(outputFileName);

  // Clean up local directories
  await cleanDirectories(inputFileName, outputFileName);

  return res.status(200).send('Video processing finished successfully.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Video processing service listening at http://localhost:${port}`);
});
