import React from 'react';
import './LandingPage.css';
import { FaFacebook, FaInstagram, FaLink, FaLinkedin } from 'react-icons/fa';

export const LandingPage: React.FC = () => {
  return (
    <div className='right-left' style={{ height: '100%' }}>
      <div className='band-background'>
        <div className='band left-right'>
          <h1>Lucernae Turici</h1>
        </div>
      </div>
      <div className='band-background'>
        <p className='band right-left'>Welcome to the first iteration of the Lamp Configurator</p>
        <p className='band left-right'>from Zürich, with love</p>
      </div>
      <div className='band-background'>
        <div className='band right-left'>
          <a style={{ padding: '0 20px' }} href='https://www.linkedin.com/in/wardjonas/'>
            <FaLinkedin size={20} color='#c9c' />
          </a>
          <a style={{ padding: '0 20px' }} href='https://www.instagram.com/hybridrationality/'>
            <FaInstagram size={20} color='#c9c' />
          </a>
          <a style={{ padding: '0 20px' }} href='https://www.facebook.com/jonasward.vandenbulcke/'>
            <FaFacebook size={20} color='#c9c' />
          </a>
          <a style={{ padding: '0 20px' }} href='https://jonasward.eu/'>
            <FaLink size={20} color='#c9c' />
          </a>
        </div>
      </div>
      <div className='band-background'>
        <div className='band left-right'>
          <a href='#configurator' className='cta-button'>
            Configurator
          </a>
          <a href='#dataParserTest' className='cta-button'>
            Test Page
          </a>
        </div>
      </div>
      <div className='footer-position'>
        <div className='footer right-left'>&copy; 2024 Jonas Ward, All rights reserved.</div>
      </div>
    </div>
  );
};
