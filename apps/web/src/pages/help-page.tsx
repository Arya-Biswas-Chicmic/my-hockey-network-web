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
    <div className="mhn-help-page-root" style={{ width: '100%', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Top Header Navbar */}
      <Header activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />

      <main className="mhn-help-main-container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 16px 64px' }}>
        
        {/* ==================== HERO SEARCH SECTION ==================== */}
        <section className="mhn-help-hero-card" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: '#EFF6FF',
            color: '#0B66C2',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Help & Support Center
          </h1>
          <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            How can we help you today? Search our knowledge base or browse help categories below.
          </p>

          {/* Search Box */}
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              type="text"
              placeholder="Search help topics, FAQs, technical issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '12px',
                border: '1.5px solid #CBD5E1',
                paddingLeft: '50px',
                paddingRight: '20px',
                fontSize: '15px',
                backgroundColor: '#F8FAFC',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
              }}
            />
          </div>
        </section>

        {/* ==================== CATEGORY NAVIGATION PILLS ==================== */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                style={{
                  padding: '10px 18px',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: activeCategory === cat.id ? '1.5px solid #0B66C2' : '1px solid #CBD5E1',
                  backgroundColor: activeCategory === cat.id ? '#0B66C2' : '#FFFFFF',
                  color: activeCategory === cat.id ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(11, 102, 194, 0.25)' : 'none',
                }}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </section>

        {/* ==================== FREQUENTLY ASKED QUESTIONS ==================== */}
        <section style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '32px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
          marginBottom: '32px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
              ❓ Frequently Asked Questions
            </h2>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
              Showing {filteredFaqs.length} help articles
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>No matching help topics found</h3>
              <p style={{ fontSize: '14px' }}>Try searching with different keywords or submit a problem report below.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    style={{
                      borderRadius: '12px',
                      border: isExpanded ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
                      backgroundColor: isExpanded ? '#F0F9FF' : '#FFFFFF',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Button
                      type="button"
                      onClick={() => handleToggleFaq(faq.id)}
                      style={{
                        width: '100%',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        gap: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#E0F2FE',
                          color: '#0369A1',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {faq.categoryLabel}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
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
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s ease',
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </Button>

                    {isExpanded && (
                      <div style={{
                        padding: '0 20px 18px 20px',
                        fontSize: '14px',
                        color: '#334155',
                        lineHeight: 1.65,
                        borderTop: '1px solid #E0F2FE',
                        paddingTop: '14px',
                      }}>
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
        <section style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '32px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
          marginBottom: '32px',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              📝 Report a Problem / Submit Ticket
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B' }}>
              Encountered a bug, technical glitch, or login issue? Describe it below and our support team will investigate.
            </p>
          </div>

          <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Category Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Issue Category
              </label>
              <Select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                style={{ width: '100%', height: '44px', borderRadius: '8px' }}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Subject
              </label>
              <Input
                type="text"
                placeholder="Brief summary of the issue (e.g. OTP code not arriving)"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                style={{ width: '100%', height: '44px', borderRadius: '8px' }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Detailed Description
              </label>
              <Textarea
                placeholder="Please describe what happened, expected behavior, and steps to reproduce..."
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                rows={4}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </div>

            {/* File Upload Mockup */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Attach Screenshot / Log (Optional)
              </label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,.log,.pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: '10px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#F8FAFC',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {attachedFile ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 600, fontSize: '14px' }}>
                    <span>📄 {attachedFile.name}</span>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div style={{ color: '#64748B', fontSize: '14px' }}>
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
                style={{
                  backgroundColor: '#0B66C2',
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSubmittingTicket ? 'not-allowed' : 'pointer',
                  opacity: isSubmittingTicket ? 0.7 : 1,
                }}
              >
                {isSubmittingTicket ? 'Submitting Ticket...' : 'Submit Support Ticket'}
              </Button>
            </div>
          </form>
        </section>

        {/* ==================== CONTACT SUPPORT CARDS ==================== */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {/* Email Support Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📩</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Direct Email Support</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>Email our dedicated support specialists for complex account inquiries.</p>
            <a href="mailto:support@myhockeynetwork.com" style={{ fontSize: '14px', fontWeight: 600, color: '#0B66C2', textDecoration: 'none' }}>
              support@myhockeynetwork.com
            </a>
          </div>

          {/* Live Hours Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚡</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Support Operating Hours</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>Our technical support team actively responds during official hours.</p>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#166534' }}>
              Mon - Fri: 9:00 AM - 6:00 PM EST
            </span>
          </div>

          {/* Legal Links Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📄</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Legal & Guidelines</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>Review terms of service, safety policies, and community guidelines.</p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontWeight: 600 }}>
              <a href="#" style={{ color: '#0B66C2', textDecoration: 'none' }}>Terms & Conditions</a>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <a href="#" style={{ color: '#0B66C2', textDecoration: 'none' }}>Privacy Policy</a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
