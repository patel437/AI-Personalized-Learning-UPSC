/**
 * Footer Component
 * App footer with links and copyright
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>UPSC PathFinder</h4>
          <p>AI-Powered Personalized Learning System for UPSC Aspirants</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/recommendations">Recommendations</Link></li>
            <li><Link to="/analytics">Analytics</Link></li>
            <li><Link to="/mock-tests">Mock Tests</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Connect With Us</h4>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} UPSC PathFinder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;