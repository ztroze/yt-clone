import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json()); // Middleware for handling JSON request bodies

app.post("/process-video", (req, res) => {
  
  // Gets paths of the input and output video files from the request body
  const inputFilePath = req.body.inputFilePath;
  const outputFilePath = req.body.outputFilePath;

  // Checks if file paths are defined
  if (!inputFilePath) {
    res.status(400).send("Bad Request: Missing input file path.");
  }
  if (!outputFilePath) {
    res.status(400).send("Bad Request: Missing output file path.");
  }

  // Does the video processing
  ffmpeg(inputFilePath)
    .outputOptions("-vf", "scale=-1:480") // 480p
    .on("end", () => {
      res.status(200).send("Video processing finished successfully.");
    })
    .on("error", (err) => {
      console.log(`An error occurred: ${err.message}`);
      res.status(500).send(`Internal Server Error ${err.status}`);
    })
    .save(outputFilePath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Video processing service listening at http://localhost:${port}`);
});
