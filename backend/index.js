const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const { Configuration, OpenAIApi } = require("openai");
const pdfParse = require("pdf-parse");
const rateLimit = require("express-rate-limit");

app.use(express.json());
app.use("/", express.static("public"));
app.use(fileUpload());

const port = process.env.PORT || 5000;
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
});

const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);
const mongoURI =
  "mongodb+srv://anojadubey:G7Rd2D12M1X5rBJD@cluster0.gibvwdn.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.log(err));

app.use(cors());

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

app.post("/api/upload", apiLimiter, async (req, res) => {
  if (req.files === null || req.body.phoneNumber === null) {
    return res.status(400).json({ msg: "No file uploaded." });
  }
  const file = req.files.file;
  const phoneNumber = req.body.phoneNumber;
  const extractedText = await pdfParse(file).then((data) => {
    return data.text;
  });
  await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: `make short summary in 900 words of following resume ${extractedText}`,
      max_tokens: 1000,
    })
    .then((data) => {
      const user = new User({
        phoneNumber: phoneNumber,
        summary: data.data.choices[0].text,
      });
      user
        .save()
        .then(() => {
          res.status(200).json({ summary: data.data.choices[0].text });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err?.message);
    });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
