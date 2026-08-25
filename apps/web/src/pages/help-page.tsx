import React, { useState, useRef } from 'react';
import { Button } from '../components/common/Button';
import { Input, Textarea, Select } from '../components/common/FormControls';
import { Header } from '../components/common/Header';
import { useDebounce } from '../hooks/use-debounce';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@my-hockey-network/constants';
import { NavTabEnum } from '@my-hockey-network/contracts';

interface HelpPageProps {
  onNavigate?: (screen: string, extraData?: any) => void;
  onLogout?: () => void;
}

interface FaqItem {
  id: string;
  category: 'account' | 'network' | 'messaging' | 'notifications' | 'privacy' | 'technical';
  categoryLabel: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  // Account & Profile
  {
    id: 'faq-1',
    category: 'account',
    categoryLabel: 'Account & Profile',
    question: 'How do I create an account on My Hockey Network?',
    answer: 'Enter your email address on the sign-up screen to receive a 6-digit OTP verification code. Once verified, choose your role (Player, Parent, Coach, Fan, etc.) and complete your profile setup.',
  },
  {
    id: 'faq-2',
    category: 'account',
    categoryLabel: 'Account & Profile',
    question: 'How do I edit my profile information, avatar, or role?',
    answer: 'Navigate to the Profile tab from the header menu or profile icon. Click the "Edit Profile" button to update your display name, primary position, team affiliation, bio, and avatar.',
  },
  {
    id: 'faq-3',
    category: 'account',
    categoryLabel: 'Account & Profile',
    question: 'How does Parent/Guardian Supervision work?',
    answer: 'Parents can link minor athlete profiles under the Supervision tab. Parents receive full visibility over child activities, connection requests, messaging controls, and content permissions.',
  },
  {
    id: 'faq-4',
    category: 'account',
    categoryLabel: 'Account & Profile',
    question: 'How can I change my email address or password?',
    answer: 'Go to Settings & Privacy from your profile dropdown menu. Under General Settings, update your registered email address or security preferences.',
  },

  // Players, Teams & Network
  {
    id: 'faq-5',
    category: 'network',
    categoryLabel: 'Players, Teams & Network',
    question: 'How do I connect with players, parents, or coaches?',
    answer: 'Visit the My Network tab to browse suggested hockey profiles. Click "Connect" to send a connection request. Once accepted, you can interact and view their updates.',
  },
  {
    id: 'faq-6',
    category: 'network',
    categoryLabel: 'Players, Teams & Network',
    question: 'How do I join or create a Hockey Team or Group?',
    answer: 'In the My Network tab, switch to the "Groups" view to discover official teams and local hockey clubs. Click "Join Group" or request an invitation from the team administrator.',
  },
  {
    id: 'faq-7',
    category: 'network',
    categoryLabel: 'Players, Teams & Network',
    question: 'What is the difference between Following and Connecting?',
    answer: 'Connecting is a mutual relationship allowing private messaging and full feed access. Following lets you receive public updates from players and teams without requiring mutual connection approval.',
  },

  // Messaging
  {
    id: 'faq-8',
    category: 'messaging',
    categoryLabel: 'Messaging & Group Chat',
    question: 'How do I send direct messages or start group chats?',
    answer: 'Click the Messaging tab in the header navbar to open your chat inbox. Select a connection to start a direct message or click "Create Group" to invite teammates.',
  },
  {
    id: 'faq-9',
    category: 'messaging',
    categoryLabel: 'Messaging & Group Chat',
    question: 'Can minor athletes message other users directly?',
    answer: 'Messaging for minor accounts is governed by Guardian Supervision settings. Parents can require approval for new adult contacts or restrict direct messaging entirely.',
  },

  // Notifications
  {
    id: 'faq-10',
    category: 'notifications',
    categoryLabel: 'Notifications',
    question: 'How do I customize my notification preferences?',
    answer: 'Go to Settings & Privacy → Notifications tab. You can toggle push and email notifications for messages, connection requests, team invites, and activity mentions.',
  },

  // Privacy & Safety
  {
    id: 'faq-11',
    category: 'privacy',
    categoryLabel: 'Privacy & Safety',
    question: 'How do I control who sees my posts?',
    answer: 'When creating a post, click the audience selector pill to choose between "Everyone" (Public), "Connections", "Groups", or "Custom" (specify exact user emails to share or hide with).',
  },
  {
    id: 'faq-12',
    category: 'privacy',
    categoryLabel: 'Privacy & Safety',
    question: 'How do I block or report an inappropriate user?',
    answer: 'Visit the user profile or click options on any post/message to select "Block User" or "Report Inappropriate Content". You can manage blocked users under Settings & Privacy → Blocked Users.',
  },

  // Technical Support
  {
    id: 'faq-13',
    category: 'technical',
    categoryLabel: 'Technical Support',
    question: 'What should I do if the backend or server is unavailable?',
    answer: 'If the server experiences downtime, our global application wrapper displays a server-down screen with a Retry Connection button. Active health checks automatically restore your application state once online.',
  },
  {
    id: 'faq-14',
    category: 'technical',
    categoryLabel: 'Technical Support',
    question: 'What if I do not receive my OTP verification code?',
    answer: 'Ensure your email address is spelled correctly. Check your spam folder. A 59-second cooldown timer will allow you to click "Resend OTP" if the code does not arrive.',
  },
];

export const HelpPage: React.FC<HelpPageProps> = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<NavTabEnum | string>(NavTabEnum.HELP);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  // Report a problem ticket state
  const [ticketCategory, setTicketCategory] = useState('technical');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (tab: string, extraData?: any) => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(tab, extraData);
    }
  };

  const handleToggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      showErrorToast(null, 'Please fill out subject and description before submitting.');
      return;
    }

    setIsSubmittingTicket(true);
    try {
      // Simulate API ticket submission
      await new Promise((resolve) => setTimeout(resolve, 800));
      showSuccessToast(SUCCESS_MESSAGES.ACTION_COMPLETED || 'Support ticket submitted successfully! Our team will respond shortly.');
      setTicketSubject('');
      setTicketDescription('');
      setAttachedFile(null);
    } catch (err: any) {
      showErrorToast(err, ERROR_MESSAGES.DEFAULT_UNEXPECTED);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Filter FAQs based on category pill & debounced search query
  const filteredFaqs = FAQ_ITEMS.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      !debouncedSearchQuery.trim() ||
      faq.question.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      faq.categoryLabel.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mhn-help-page-container">
      {/* Top Header Navbar */}
      <Header activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />

      <main className="mhn-help-main-layout">
        
        {/* ==================== HERO SEARCH SECTION ==================== */}
        <section className="mhn-help-hero-banner">
          <div className="mhn-help-hero-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 className="mhn-help-hero-title">
            Help & Support Center
          </h1>
          <p className="mhn-help-hero-sub">
            How can we help you today? Search our knowledge base or browse help categories below.
          </p>

          {/* Search Box */}
          <div className="mhn-help-search-wrapper">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mhn-help-search-icon"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              type="text"
              placeholder="Search help topics, FAQs, technical issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mhn-help-search-input"
            />
          </div>
        </section>

        {/* ==================== CATEGORY NAVIGATION PILLS ==================== */}
        <section className="mhn-mb-32">
          <div className="mhn-help-pills-row">
            {[
              { id: 'all', label: '🔍 All Topics' },
              { id: 'account', label: '👤 Account & Profile' },
              { id: 'network', label: '🏒 Players & Teams' },
              { id: 'messaging', label: '💬 Messaging' },
              { id: 'notifications', label: '🔔 Notifications' },
              { id: 'privacy', label: '🔒 Privacy & Safety' },
              { id: 'technical', label: '🛠️ Technical Support' },
            ].map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`mhn-help-cat-pill ${activeCategory === cat.id ? 'active' : 'inactive'}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </section>

        {/* ==================== FREQUENTLY ASKED QUESTIONS ==================== */}
        <section className="mhn-help-section-card">
          <div className="mhn-toggle-row-between mhn-mb-24">
            <h2 className="mhn-parent-card-title-lg">
              ❓ Frequently Asked Questions
            </h2>
            <span className="mhn-comment-time">
              Showing {filteredFaqs.length} help articles
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="mhn-text-center mhn-empty-state-card">
              <div className="mhn-support-card-icon">🔍</div>
              <h3 className="mhn-parent-card-title mhn-mb-4">No matching help topics found</h3>
              <p className="mhn-parent-card-sub">Try searching with different keywords or submit a problem report below.</p>
            </div>
          ) : (
            <div className="mhn-col-flex-gap-12">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`mhn-faq-card-item ${isExpanded ? 'expanded' : 'collapsed'}`}
                  >
                    <Button
                      type="button"
                      onClick={() => handleToggleFaq(faq.id)}
                      className="mhn-faq-trigger-btn"
                    >
                      <div className="mhn-btn-loading-flex">
                        <span className="mhn-faq-cat-badge">
                          {faq.categoryLabel}
                        </span>
                        <span className="mhn-faq-question-text">
                          {faq.question}
                        </span>
                      </div>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748B"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`mhn-arrow-rotate ${isExpanded ? 'rotated' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </Button>

                    {isExpanded && (
                      <div className="mhn-faq-answer-body">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================== REPORT A PROBLEM FORM ==================== */}
        <section className="mhn-help-section-card">
          <div className="mhn-mb-24">
            <h2 className="mhn-parent-card-title-lg mhn-mb-6">
              📝 Report a Problem / Submit Ticket
            </h2>
            <p className="mhn-parent-card-sub">
              Encountered a bug, technical glitch, or login issue? Describe it below and our support team will investigate.
            </p>
          </div>

          <form onSubmit={handleSubmitTicket} className="mhn-col-flex-gap-20">
            {/* Category Selection */}
            <div>
              <label className="mhn-form-label-block">
                Issue Category
              </label>
              <Select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="mhn-ticket-select-input"
              >
                <option value="technical">🛠️ Technical / App Loading Issue</option>
                <option value="login">🔑 Login / OTP Verification Issue</option>
                <option value="account">👤 Account & Supervision Control</option>
                <option value="content">🚨 Report Inappropriate Content or Abuse</option>
                <option value="other">💬 General Inquiry / Feedback</option>
              </Select>
            </div>

            {/* Subject Line */}
            <div>
              <label className="mhn-form-label-block">
                Subject
              </label>
              <Input
                type="text"
                placeholder="Brief summary of the issue (e.g. OTP code not arriving)"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="mhn-ticket-select-input"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mhn-form-label-block">
                Detailed Description
              </label>
              <Textarea
                placeholder="Please describe what happened, expected behavior, and steps to reproduce..."
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                rows={4}
                className="mhn-about-input-box"
              />
            </div>

            {/* File Upload Mockup */}
            <div>
              <label className="mhn-form-label-block">
                Attach Screenshot / Log (Optional)
              </label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,.log,.pdf"
                onChange={handleFileSelect}
                className="mhn-display-none"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mhn-ticket-file-dropzone"
              >
                {attachedFile ? (
                  <div className="mhn-btn-loading-flex mhn-text-center">
                    <span>📄 {attachedFile.name}</span>
                    <span className="mhn-comment-time">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div className="mhn-parent-card-sub">
                    <span>📎 Click to upload a screenshot or error log</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={isSubmittingTicket}
                className="mhn-btn-ticket-submit"
              >
                {isSubmittingTicket ? 'Submitting Ticket...' : 'Submit Support Ticket'}
              </Button>
            </div>
          </form>
        </section>

        {/* ==================== CONTACT SUPPORT CARDS ==================== */}
        <section className="mhn-support-cards-grid">
          {/* Email Support Card */}
          <div className="mhn-support-contact-card">
            <div className="mhn-support-card-icon">📩</div>
            <h3 className="mhn-support-card-title">Direct Email Support</h3>
            <p className="mhn-support-card-desc">Email our dedicated support specialists for complex account inquiries.</p>
            <a href="mailto:support@myhockeynetwork.com" className="mhn-support-card-link">
              support@myhockeynetwork.com
            </a>
          </div>

          {/* Live Hours Card */}
          <div className="mhn-support-contact-card">
            <div className="mhn-support-card-icon">⚡</div>
            <h3 className="mhn-support-card-title">Support Operating Hours</h3>
            <p className="mhn-support-card-desc">Our technical support team actively responds during official hours.</p>
            <span className="mhn-support-card-green-text">
              Mon - Fri: 9:00 AM - 6:00 PM EST
            </span>
          </div>

          {/* Legal Links Card */}
          <div className="mhn-support-contact-card">
            <div className="mhn-support-card-icon">📄</div>
            <h3 className="mhn-support-card-title">Legal & Guidelines</h3>
            <p className="mhn-support-card-desc">Review terms of service, safety policies, and community guidelines.</p>
            <div className="mhn-legal-links-flex">
              <a href="#" className="mhn-support-card-link">Terms & Conditions</a>
              <span className="mhn-parent-card-sub">•</span>
              <a href="#" className="mhn-support-card-link">Privacy Policy</a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
