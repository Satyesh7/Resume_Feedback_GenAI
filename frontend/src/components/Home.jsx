import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { res } from '../constants/Image';

function Home() {
  const [welcomeText, setWelcomeText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    animateText("Welcome to your career toolkit", setWelcomeText);
    animateText("Get expert feedback on your resume, instantly", setFeedbackText);
  }, []);

  const animateText = (text, setText) => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index <= text.length) {
        setText(text.slice(0, index));
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 100);
  };

  return (
    <div className="bg-violet-950 min-h-screen flex items-center justify-center">
      <div className="bg-stone-300 w-1/2 h-1/2 flex flex-col items-center justify-center space-y-4">
        <h1 className="pt-4 text-bold text-4xl">{welcomeText}</h1>
        <h1 className='text-xl'>{feedbackText}</h1>
        <Link to="/resume">
          <div className="flex items-center justify-center">
            <img className="w-3/12 h-3/12 cursor-pointer hover:scale-110 transition duration-300 ease-in-out" src={res} alt="Career Toolkit" />
          </div>
        </Link>
        <h1 className="text-2xl">Score my resume</h1>
      </div>
    </div>
  );
}

export default Home;
