import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaHeart
} from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

const socialLinks = [
  { href: 'https://facebook.com', icon: FaFacebook, hoverClass: 'hover:bg-blue-600 hover:shadow-blue-500/30', label: 'Facebook' },
  { href: 'https://twitter.com', icon: FaTwitter, hoverClass: 'hover:bg-sky-500 hover:shadow-sky-500/30', label: 'Twitter' },
  { href: 'https://instagram.com', icon: FaInstagram, hoverClass: 'hover:bg-pink-600 hover:shadow-pink-500/30', label: 'Instagram' },
  { href: 'https://linkedin.com', icon: FaLinkedin, hoverClass: 'hover:bg-blue-700 hover:shadow-blue-700/30', label: 'LinkedIn' },
  { href: 'https://youtube.com', icon: FaYoutube, hoverClass: 'hover:bg-red-600 hover:shadow-red-500/30', label: 'YouTube' },
];

const NavLink = ({ to, label }) => (
  <li>
    <Link
      to={to}
      className="text-gray-400 hover:text-blue-400 transition-all duration-200 text-sm flex items-center space-x-2 rtl:space-x-reverse group"
    >
      <span className="w-1.5 h-1.5 bg-transparent group-hover:bg-blue-400 rounded-full transition-all duration-200 flex-shrink-0"></span>
      <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-200">{label}</span>
    </Link>
  </li>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-white font-semibold text-lg mb-6 flex items-center space-x-2 rtl:space-x-reverse">
    <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full inline-block flex-shrink-0"></span>
    <span>{children}</span>
  </h3>
);

const Footer = () => {
  const { t, language } = useTranslation();
  const currentYear = new Date().getFullYear();
  const isArabic = language === 'ar';
  const footer = t.footer;
  const quickLinks = footer.quickLinks.map(link => ({ ...link }));
  const resourceLinks = footer.resourceLinks.map(link => ({ ...link }));
  const contactItems = [
    { icon: FaEnvelope, ...footer.contactItems.email, href: 'mailto:support@dermavision.ai' },
    { icon: FaPhone, ...footer.contactItems.phone, href: 'tel:+1234567890' },
    { icon: FaMapMarkerAlt, ...footer.contactItems.address, href: null },
  ];
  const bottomLinks = footer.bottomLinks.map(link => ({ ...link }));

  return (
    <footer className={`bg-gradient-to-br from-[#080b1f] via-[#0d1235] to-[#080b1f] text-gray-300 pt-16 pb-8 border-t border-slate-700/30 ${isArabic ? 'text-right' : ''}`}>
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* ===== Brand Section ===== */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                  <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">DERMAVISION</span>
            </div>

            {/* Description */}
            <p className="text-gray-400 leading-relaxed text-sm pr-4 rtl:pr-0 rtl:pl-4">
              {footer.description}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400">
                <FaShieldAlt className="w-3 h-3" />
                <span>{footer.badges.supported}</span>
              </span>
              <span className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400">
                <span>✓</span>
                <span>{footer.badges.preliminary}</span>
              </span>
            </div>

            {/* Social Media */}
            <div className="flex space-x-3 rtl:space-x-reverse">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-10 h-10 bg-slate-700/40 ${social.hoverClass} rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group`}
                  >
                    <Icon className="text-gray-400 group-hover:text-white transition-colors text-sm" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ===== Quick Links ===== */}
          <div>
            <SectionTitle>{footer.headings.quickLinks}</SectionTitle>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <NavLink key={link.to} to={link.to} label={link.label} />
              ))}
            </ul>
          </div>

          {/* ===== Resources ===== */}
          <div>
            <SectionTitle>{footer.headings.resources}</SectionTitle>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <NavLink key={link.to} to={link.to} label={link.label} />
              ))}
            </ul>
          </div>

          {/* ===== Contact Us ===== */}
          <div>
            <SectionTitle>{footer.headings.contact}</SectionTitle>
            <ul className="space-y-4">
              {contactItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-start space-x-3 rtl:space-x-reverse group">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{item.value}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* ===== Medical Disclaimer ===== */}
        <div className="border-t border-slate-700/30 pt-8 mb-8">
          <div className="bg-gradient-to-r from-red-900/15 via-red-800/25 to-red-900/15 border border-red-500/20 rounded-2xl p-6">
            <h4 className="text-red-400 font-semibold mb-3 flex items-center space-x-2 rtl:space-x-reverse text-sm">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{footer.medicalDisclaimer.title}</span>
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              <strong className="text-gray-300">DERMAVISION</strong> {footer.medicalDisclaimer.text}
            </p>
          </div>
        </div>

        {/* ===== Bottom Bar ===== */}
        <div className="border-t border-slate-700/30 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-500 text-sm flex items-center">
            <span>© {currentYear} DERMAVISION. {footer.copyright.beforeHeart}</span>
            <FaHeart className="text-red-500 mx-1.5 text-xs" />
            <span>{footer.copyright.afterHeart}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {bottomLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-500 hover:text-blue-400 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
