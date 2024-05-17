import React, { useState } from 'react';

const Resume = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        setFile(null);
      } else if (selectedFile.size > 2 * 1024 * 1024) { // 2 MB limit
        alert('Please upload a file less than 2 MB.');
        setError('File size must be less than or equal to 2 MB.');
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please upload a PDF file.');
      return;
    }

    if (!jobDescription) {
      setError('Please provide a job description.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('http://127.0.0.1:5000/evaluate_resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to upload. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Your Resume</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange}
          className="border border-gray-300 p-2"
        />
        <textarea
          placeholder="Enter job description"
          value={jobDescription}
          onChange={handleJobDescriptionChange}
          className="border border-gray-300 p-2"
        ></textarea>
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {result && (
        <div className="bg-gray-200 p-4 mt-4 rounded" style={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Resume;
