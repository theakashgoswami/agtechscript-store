import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  useEffect(() => {
    // Dynamic year update
    const yearSpan = document.getElementById("footer-year");
    if (yearSpan) yearSpan.textContent = year;
  }, [year]);

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-main">
          
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img 
                src="https://cdn.agtechscript.in/AGTechScript.webp" 
                alt="AG TechScript Logo" 
                className="footer-logo-img" 
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/60x60/0047ff/white?text=AG";
                }}
              />
              <h3 className="footer-brand-name">AG TechScript™</h3>
            </div>
            <p className="footer-tagline">Scripted for Trend, Tuned for Tech</p>
            
            <div className="footer-founder">
              <svg width="22" height="22" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 12l3-2 2-7H7l2 7z"></path>
                <path d="M10 12L5 22h14l-5-10"></path>
              </svg>
              <span>Founded by Akash Kumar S/o Shri Rustam Nath</span>
            </div>
            
            <div className="footer-gst">
              <svg width="22" height="22" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                <circle cx="9" cy="12" r="3"></circle>
                <path d="M15 8h4M15 12h4M15 16h4"></path>
              </svg>
              <span>GSTIN: 09JYTPK4090Q1Z3</span>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="footer-links-section">
            <h4 className="footer-heading">
              <svg width="20" height="20" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 0 1 7 7l-3 3a5 5 0 0 1-7-7l1-1"></path>
                <path d="M14 11a5 5 0 0 1-7-7l3-3a5 5 0 0 1 7 7l-1 1"></path>
              </svg>
              <span>Quick Links</span>
            </h4>
            
            <div className="footer-links-grid">
              <Link to="/privacy-policy">
                <svg width="18" height="18" stroke="#60a5fa" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s7-4 7-12V5l-7-3-7 3v5c0 8 7 12 7 12z"></path>
                </svg>
                Privacy Policy
              </Link>
              <Link to="https://agtechscript.in/tnc">
                <svg width="18" height="18" stroke="#60a5fa" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6v20h12V8z"></path>
                  <path d="M14 2v6h6"></path>
                </svg>
                Terms & Conditions
              </Link>
              <Link to="https://agtechscript.in/dmca-policy">
                <svg width="18" height="18" stroke="#60a5fa" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M15 9a4 4 0 1 0 0 6"></path>
                </svg>
                DMCA Policy
              </Link>
              <Link to="https://agtechscript.in/disclaimer">
                <svg width="18" height="18" stroke="#60a5fa" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2 2 22h20L12 2z"></path>
                  <path d="M12 16v.01"></path>
                  <path d="M12 10v4"></path>
                </svg>
                Disclaimer
              </Link>
              <Link to="https://agtechscript.in/return-policy">
                <svg width="18" height="18" stroke="#60a5fa" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 7v6h6"></path>
                  <path d="M3 13a9 9 0 1 0 2.6-6.4L3 7"></path>
                </svg>
                Return & Refund
              </Link>
              <Link to="https://agtechscript.in/about">
                <svg width="18" height="18" stroke="#60a5fa" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                About Us
              </Link>
              <Link to="https://agtechscript.in/contact">
                <svg width="18" height="18" stroke="#60a5fa" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                  <polyline points="3,6 12,13 21,6"></polyline>
                </svg>
                Contact
              </Link>
              <Link to="https://agtechscript.in/faq">
                <svg width="18" height="18" stroke="#60a5fa" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 17v.01"></path>
                  <path d="M9 9a3 3 0 1 1 6 0c0 2-3 3-3 5"></path>
                </svg>
                FAQ
              </Link>
            </div>
          </div>

          {/* Contact Section */}
          <div className="footer-contact-section">
            <h4 className="footer-heading">
              <svg width="20" height="20" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 2v20M6 2h9v20H6z"></path>
                <path d="M6 7H2M6 11H2M6 15H2M6 19H2"></path>
              </svg>
              <span>Get in Touch</span>
            </h4>
            
            <div className="footer-contact-info">
              <div className="footer-contact-item">
                <svg width="18" height="18" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"></path>
                  <circle cx="12" cy="11" r="3"></circle>
                </svg>
                <a href="https://maps.app.goo.gl/Rufvrm4A65NmAzK67" target="_blank" rel="noopener noreferrer">
                  Baba Jahrveer Mandir, Kisrauli, Kasganj, UP 207124
                </a>
              </div>
              
              <div className="footer-contact-item">
                <svg width="18" height="18" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2c-7.88-1-15-8.12-16-16A2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72c.16 1.13.43 2.24.8 3.28a2 2 0 0 1-.45 2.11L9.91 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c1.04.37 2.15.64 3.28.8z"></path>
                </svg>
                <a href="tel:+916397563847">+91 63975 63847</a>
              </div>
              
              <div className="footer-contact-item">
                <svg width="18" height="18" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                  <polyline points="3,6 12,13 21,6"></polyline>
                </svg>
                <a href="mailto:shop@agtechscript.in">shop@agtechscript.in</a>
              </div>
              
              <div className="footer-contact-item">
                <svg width="18" height="18" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                <span>Mon - Sat: 08:00 AM - 07:00 PM</span>
              </div>
            </div>
            
            <h4 className="footer-heading footer-social-heading">
              <svg width="20" height="20" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <path d="M8.59 13.51L15.42 17.49"></path>
                <path d="M15.41 6.51L8.59 10.49"></path>
              </svg>
              <span>Follow Us</span>
            </h4>
            
            <div className="footer-social">
              <a href="https://twitter.com/agtechscript" target="_blank" rel="noopener noreferrer" className="social-icon twitter" aria-label="Twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="https://github.com/agtechscript" target="_blank" rel="noopener noreferrer" className="social-icon github" aria-label="GitHub">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1.1.1-.8.4-1.4.8-1.7-2.8-.3-5.7-1.4-5.7-6.2 0-1.4.5-2.5 1.3-3.4-.1-.3-.6-1.6.1-3.3 0 0 1.1-.4 3.5 1.3 1-.3 2.1-.5 3.2-.5s2.2.2 3.2.5c2.4-1.7 3.5-1.3 3.5-1.3.7 1.7.2 3 .1 3.3.8.9 1.3 2 1.3 3.4 0 4.8-2.9 5.9-5.7 6.2.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4 0-6.6-5.4-12-12-12z"></path>
                </svg>
              </a>
              <a href="https://linkedin.com/company/agtechscript" target="_blank" rel="noopener noreferrer" className="social-icon linkedin" aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5C4.98 4.9 3.9 6 2.5 6S.02 4.9.02 3.5 1.1 1 2.5 1s2.48 1.1 2.48 2.5zM5 8H0v16h5V8zm7.9 0H8.1v16h5v-7.9c0-4.7 6-5.1 6 0V24h5v-9.2c0-7.9-8.9-7.7-11-3.8V8z"></path>
                </svg>
              </a>
              <a href="https://youtube.com/@agtechscript" target="_blank" rel="noopener noreferrer" className="social-icon youtube" aria-label="YouTube">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2c-.3-1.1-1.1-2-2.2-2.3C19.8 3.5 12 3.5 12 3.5s-7.8 0-9.3.4c-1.1.3-1.9 1.2-2.2 2.3C0 7.7 0 12 0 12s0 4.3.5 5.8c.3 1.1 1.1 2 2.2 2.3 1.5.4 9.3.4 9.3.4s7.8 0 9.3-.4c1.1-.3 1.9-1.2 2.2-2.3.5-1.5.5-5.8.5-5.8s0-4.3-.5-5.8zM9.6 15.5V8.5l6.2 3.5-6.2 3.5z"></path>
                </svg>
              </a>
              <a href="https://instagram.com/agtechscript" target="_blank" rel="noopener noreferrer" className="social-icon instagram" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2.2.4 3 .9.8.5 1.5 1.2 1.9 2 .5.8.8 1.8.9 3 .1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.4 2.2-.9 3-.5.8-1.2 1.5-2 1.9-.8.5-1.8.8-3 .9-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2.2-.4-3-.9-.8-.5-1.5-1.2-1.9-2-.5-.8-.8-1.8-.9-3-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.4-2.2.9-3 .5-.8 1.2-1.5 2-1.9.8-.5 1.8-.8 3-.9 1.3-.1 1.7-.1 4.9-.1zM12 0C8.7 0 8.3 0 7 .1 5.6.2 4.4.5 3.4 1.1 2.3 1.7 1.4 2.6.8 3.7.2 4.8-.1 6-.1 7.4c0 1.3-.1 1.7-.1 5 0 3.2 0 3.6.1 4.9.1 1.4.4 2.6 1 3.7.6 1.1 1.5 2 2.6 2.6 1.1.6 2.3.9 3.7.9 1.3.1 1.7.1 5 .1 3.2 0 3.6 0 4.9-.1 1.4-.1 2.6-.4 3.7-1 1.1-.6 2-1.5 2.6-2.6.6-1.1.9-2.3.9-3.7.1-1.3.1-1.7.1-4.9s0-3.6-.1-4.9c-.1-1.4-.4-2.6-1-3.7-.6-1.1-1.5-2-2.6-2.6-1.1-.6-2.3-.9-3.7-.9C15.6 0 15.2 0 12 0z"></path>
                  <circle cx="12" cy="12" r="2.9"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2020 - <span id="footer-year">{year}</span> AG TechScript™ | All Rights Reserved
            </p>
            <p className="footer-designed">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4d4d">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
              Made with love in India
            </p>
          </div>
        </div>
      </div>

      {/* Add keyframes animation if not already in global CSS */}
      <style>{`
        @keyframes footerShine {
          0% { transform: translateX(-30%); }
          100% { transform: translateX(30%); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </footer>
  );
}