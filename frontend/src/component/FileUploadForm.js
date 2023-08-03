import React, { useState } from "react";

const FileUploadForm = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [summary, setSummary] = useState("");

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if file is selected
    if (!file) {
      setUploadStatus("Please select a PDF file");
      return;
    }
    const formData = new FormData();
    formData.append("phoneNumber", phoneNumber);
    formData.append("file", file);
    try {
      const response = await fetch(
        "https://mern-openai.onrender.com/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setUploadStatus("File uploaded successfully");
      setSummary(data.summary);
    } catch (err) {
      console.log(err);
      setUploadStatus("Something went wrong");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="phoneNumber">Mobile Number:</label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
          />
        </div>
        <div>
          <label htmlFor="pdfFile">Upload PDF:</label>
          <input
            type="file"
            id="pdfFile"
            name="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <div>
        <h2>Upload Status:</h2>
        <p>{uploadStatus}</p>
        {summary && (
          <div>
            <h2>Summary:</h2>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadForm;
