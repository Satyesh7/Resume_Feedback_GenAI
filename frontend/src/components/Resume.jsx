import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <h1 className="text-3xl font-bold text-white mb-4">Upload Your Resume</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4 bg-white p-6 rounded-lg shadow-md">
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
      {result ? (
        <div className="bg-gray-200 p-4 mt-4 rounded" style={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
          <h2 className="text-xl font-semibold mb-2">JD Match: {result['JD Match']}</h2>
          {result['MissingKeywords'] && result['MissingKeywords'].length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Missing Keywords:</h2>
              <ul>
                {result['MissingKeywords'].map((keyword, index) => (
                  <li key={index}>{keyword}</li>
                ))}
              </ul>
            </>
          )}
          <h2 className="text-xl font-semibold mb-2">Profile Summary:</h2>
          <p>{result['Profile Summary']}</p>
        </div>
      ) : (
        <div className="bg-white p-6 mt-4 rounded-lg shadow-md flex flex-row items-center space-x-6">
          <div className="flex items-center space-x-2">
            <i className="fas fa-key text-blue-500 text-3xl"></i>
            <div className="flex flex-col items-start">
              <h2 className="text-xl font-semibold">Missing Keywords</h2>
              <p className="text-gray-500">No data available yet</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-check-circle text-green-500 text-3xl"></i>
            <div className="flex flex-col items-start">
              <h2 className="text-xl font-semibold">JD Match</h2>
              <p className="text-gray-500">No data available yet</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-user text-purple-500 text-3xl"></i>
            <div className="flex flex-col items-start">
              <h2 className="text-xl font-semibold">Profile Summary</h2>
              <p className="text-gray-500">No data available yet</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resume;
