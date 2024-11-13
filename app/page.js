'use client';

import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { markdownToHtml } from 'turndown'; // Using turndown to convert HTML back to Markdown
import { Highlight } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FaCheckCircle, FaHistory, FaTrashAlt, FaRegQuestionCircle, FaRegLightbulb, FaDownload, FaTelegram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import jsPDF from 'jspdf';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [store, setStore] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [history, setHistory] = useState([]);
  const [conversionType, setConversionType] = useState('markdown-to-html');
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('en');

  // Google Analytics script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=G-5QHHNQMCX2`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-5QHHNQMCX2');
    };
  }, []);

  // Load history on component mount
  useEffect(() => {
    const loadHistory = async () => {
      const res = await fetch('/api/convert?history=true');
      if (res.ok) {
        const historyData = await res.json();
        setHistory(historyData);
      }
    };
    loadHistory();
  }, []);

  const translations = {
    en: {
      convert: 'Convert',
      clear: 'Clear',
      download: 'Download HTML',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
    },
    fr: {
      convert: 'Convertir',
      clear: 'Effacer',
      download: 'Télécharger HTML',
      darkMode: 'Mode sombre',
      lightMode: 'Mode clair',
    },
  };

  // Function to convert Markdown to HTML using marked
  const handleConvertMarkdownToHtml = async () => {
    setLoading(true);
    setError('');
    try {
      const htmlResult = marked(markdown);

      if (css) {
        setHtml(`<style>${css}</style><div class="markdown-body">${htmlResult}</div>`);
      } else {
        setHtml(`<div class="markdown-body">${htmlResult}</div>`);
      }

      if (store) {
        const res = await fetch(`/api/convert?markdown=${encodeURIComponent(markdown)}&css=${encodeURIComponent(css)}&store=true&key=${customKey}`, {
          method: 'POST',
        });
        if (!res.ok) {
          throw new Error('Failed to store HTML');
        }
        const historyData = await res.json();
        setHistory(historyData);
      }

      window.gtag('event', 'conversion', {
        event_category: 'Markdown to HTML',
        event_label: 'HTML Conversion',
      });
    } catch (error) {
      setError('Error converting markdown');
    } finally {
      setLoading(false);
    }
  };

  // Function to convert HTML to Markdown using turndown
  const handleConvertHtmlToMarkdown = () => {
    setLoading(true);
    setError('');
    try {
      const turndownService = new markdownToHtml();
      const markdownResult = turndownService.turndown(html);
      setMarkdown(markdownResult);
    } catch (error) {
      setError('Error converting HTML');
    } finally {
      setLoading(false);
    }
  };

  // Handle conversion based on selected type
  const handleConvert = async () => {
    if (conversionType === 'markdown-to-html') {
      await handleConvertMarkdownToHtml();
    } else {
      handleConvertHtmlToMarkdown();
    }
  };

  // Clear all fields
  const handleClear = () => {
    setMarkdown('');
    setHtml('');
    setCss('');
    setStore(false);
    setCustomKey('');
    setError('');
  };

  // Clear history from the backend
  const handleClearHistory = async () => {
    try {
      const res = await fetch(`/api/convert?history=true`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to clear history');
      }
      setHistory([]);
    } catch (error) {
      setError('Error clearing history');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  // Function to download HTML as a file
  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'converted.html';
    link.click();
  };

  // Function to download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.html(html, {
      callback: function (doc) {
        doc.save('converted.pdf');
      },
      margin: [10, 10, 10, 10],
    });
  };

  // Share on social media
  const handleShare = () => {
    const shareData = {
      title: 'Markdown to HTML Converter',
      text: 'Check out this amazing tool to convert Markdown to HTML and vice versa!',
      url: window.location.href,
    };
    navigator.share(shareData);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <motion.div className="flex flex-col items-center p-6 space-y-4 max-w-5xl mx-auto">
        <motion.h1
          className="text-3xl font-semibold text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Markdown and HTML Converter
        </motion.h1>

        <section className="w-full max-w-4xl p-6 border bg-gray-100 rounded-md shadow-md">
          <motion.p
            className="text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            This app allows you to convert between Markdown and HTML formats, in real-time. You can also store your HTML for future reference.
          </motion.p>
        </section>

        {/* Dark Mode Toggle */}
        <motion.button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {darkMode ? translations[language].lightMode : translations[language].darkMode}
        </motion.button>

        {/* Conversion Type Selector */}
        <motion.div
          className="w-full max-w-xs mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <label className="block text-sm">Select Conversion Type:</label>
          <select
            value={conversionType}
            onChange={(e) => setConversionType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="markdown-to-html">Markdown to HTML</option>
            <option value="html-to-markdown">HTML to Markdown</option>
          </select>
        </motion.div>

        {/* Markdown Input */}
        {conversionType === 'markdown-to-html' && (
          <motion.textarea
            rows="8"
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter your Markdown here..."
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* HTML Input for HTML to Markdown conversion */}
        {conversionType === 'html-to-markdown' && (
          <motion.textarea
            rows="8"
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Enter your HTML here..."
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Conversion Buttons */}
        <motion.div className="space-x-4">
          <motion.button
            onClick={handleConvert}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            disabled={loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {loading ? 'Converting...' : translations[language].convert}
          </motion.button>
          <motion.button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {translations[language].clear}
          </motion.button>
        </motion.div>

        {/* Result Section */}
        {html && (
          <motion.div
            className="w-full mt-6 p-4 border border-gray-300 rounded-md shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-lg font-medium">Result</h3>
            <div dangerouslySetInnerHTML={{ __html: html }} className="markdown-body" />
          </motion.div>
        )}

        {/* Download and PDF Buttons */}
        <motion.div className="space-x-4 mt-6">
          <motion.button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <FaDownload className="inline mr-2" />
            {translations[language].download}
          </motion.button>
          <motion.button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <FaDownload className="inline mr-2" />
            Download PDF
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
