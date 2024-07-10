require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
const PORT = 8080 || process.env.PORT;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadStorage = multer({ storage: storage });

let oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

async function uploadFile(filePath) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const file = await drive.files.create({
    fields: "id",
    requestBody: {
      name: filePath,
    },
  });
  return file.data.id;
}

app.get("/google", (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      scope: ["https://www.googleapis.com/auth/drive"],
    });
    res.redirect(url);
  } catch (error) {
    console.log(error);
  }
});

app.get("/google/redirect", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.send("Successfully authenticated with Google Drive API!");
  } catch (error) {
    console.log(error);
  }
});

app.post("/upload", uploadStorage.single("file"), async (req, res) => {
  const fileName = req.file.filename;
  try {
    const targetPath = path.join(__dirname, `/upload/${fileName}`);
    const data = await uploadFile(targetPath);
    res.status(200).json({
      message: "File uploaded successfully",
      fileId: data,
    });
  } catch (error) {
    const targetPath = path.join(__dirname, `/upload/${fileName}`);
    fs.unlinkSync(targetPath);
    return res
      .status(400)
      .json({ msg: "Unable to upload file", status: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
