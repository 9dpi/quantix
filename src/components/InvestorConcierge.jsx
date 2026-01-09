import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, TrendingUp, Mail, User, Briefcase } from 'lucide-react';

const FAQ_DATABASE = {
    'what is quantix': {
        question: "What is Quantix AI Core?",
        answer: "Quantix AI Core v1.5 is an enterprise-grade quantitative engine designed to solve the 'Mass-Personalization' challenge in Fintech. We provide tailored insights for thousands of individual portfolios at the cost of a single user."
    },
    'api costs': {
        question: "How do you optimize API costs?",
        answer: "We utilize a proprietary Semantic Caching mechanism and Hybrid Model routing. This allows us to serve 90% of requests via local cache and high-efficiency SLMs, reducing operational costs by up to 70%."
    },
    'different': {
        question: "What makes you different from others?",
        answer: "Most bots offer a 'one-size-fits-all' signal. Quantix v1.5 focuses on the user's specific watchlist, delivering deep-dive analytics only for the assets they care about, ensuring 100% relevance."
    },
    'roadmap': {
        question: "What is the Roadmap for 2026?",
        answer: "We are scaling from VN30 to the full stock market, integrating automated payment gateways, and preparing for B2B API licensing in Q3/2026."
    },
    'financial': {
        question: "Can I see the Financial Projection?",
        answer: "I would be happy to share our 24-month growth plan and ROI projections. Please provide your email below, and our founder will send the Executive Summary to you immediately."
    },
    'pricing': {
        question: "What is your pricing model?",
        answer: "We offer tiered pricing: Free tier for individuals, $49/month for Pro traders, and custom enterprise pricing for institutional clients. Our cost-per-user is 70% lower than traditional platforms."
    },
    'technology': {
        question: "What technology stack do you use?",
        answer: "We leverage advanced LLM models with proprietary semantic caching, real-time market data integration via Yahoo Finance API, and a scalable Supabase backend infrastructure."
    }
};

const QUICK_REPLIES = [
    { id: 'what is quantix', text: "What is Quantix?" },
    { id: 'api costs', text: "How do you save costs?" },
    { id: 'different', text: "What makes you different?" },
    { id: 'roadmap', text: "2026 Roadmap" },
    { id: 'financial', text: "Financial Projections" }
];

export default function InvestorConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [userProfile, setUserProfile] = useState({ name: '', email: '', role: '' });
    const [stage, setStage] = useState('greeting'); // greeting, profiling, consulting, capture
    const [hasGreeted, setHasGreeted] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-greeting after 5 seconds
    useEffect(() => {
        if (!hasGreeted) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                addBotMessage(
                    "👋 Welcome to Quantix AI Core v1.5! I'm your Institutional Concierge.\n\nHow can I assist your interest today?",
                    ['💎 I want to Invest', '🤝 I want to be a Partner', '⚙️ Technical Inquiry']
                );
                setHasGreeted(true);
                setStage('profiling');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [hasGreeted]);

    const addBotMessage = (text, quickReplies = null) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'bot',
            text,
            quickReplies,
            timestamp: new Date()
        }]);
    };

    const addUserMessage = (text) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'user',
            text,
            timestamp: new Date()
        }]);
    };

    const handleQuickReply = (reply) => {
        addUserMessage(reply);

        if (stage === 'profiling') {
            setUserProfile(prev => ({ ...prev, role: reply }));
            setTimeout(() => {
                let followUp = "";
                if (reply.includes('Invest')) followUp = "Fantastic. We are currently opening our Strategic Seed Round. Would you like to see our Financial Projections?";
                else if (reply.includes('Partner')) followUp = "We love scaling through collaboration. Are you interested in our API Licensing or Local Distribution?";
                else followUp = "Our v1.5 Core utilizes Semantic Caching and Hybrid Model routing. What technical aspects can I clarify?";

                addBotMessage(
                    followUp,
                    reply.includes('Invest') ? ["Yes, show projections", "Tell me more"] : QUICK_REPLIES.map(q => q.text)
                );
                setStage('consulting');
            }, 800);
        } else if (stage === 'consulting') {
            handleFAQ(reply);
        }
    };

    const handleFAQ = (query) => {
        const lowerQuery = query.toLowerCase();
        let response = null;

        // Find matching FAQ
        for (const [key, faq] of Object.entries(FAQ_DATABASE)) {
            if (lowerQuery.includes(key) || lowerQuery.includes(faq.question.toLowerCase())) {
                response = faq;
                break;
            }
        }

        setTimeout(() => {
            if (response) {
                addBotMessage(response.answer);

                // If financial projection requested, move to capture stage
                if (lowerQuery.includes('financial') || lowerQuery.includes('projection')) {
                    setTimeout(() => {
                        addBotMessage(
                            "To send you our Executive Summary, I'll need a few details:",
                            null
                        );
                        setStage('capture');
                    }, 1500);
                } else {
                    setTimeout(() => {
                        addBotMessage(
                            "Would you like to know more about something else?",
                            QUICK_REPLIES.map(q => q.text)
                        );
                    }, 1000);
                }
            } else {
                addBotMessage(
                    "That's a great question! Let me connect you with our founder for a detailed answer.\n\nMay I have your email to arrange a follow-up?",
                    null
                );
                setStage('capture');
            }
        }, 800);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const message = inputValue.trim();
        addUserMessage(message);
        setInputValue('');

        if (stage === 'capture') {
            // Capture user details
            if (!userProfile.name) {
                setUserProfile(prev => ({ ...prev, name: message }));
                setTimeout(() => {
                    addBotMessage("Great! And what's your email address?");
                }, 500);
            } else if (!userProfile.email) {
                setUserProfile(prev => ({ ...prev, email: message }));

                // Send notification email
                await sendLeadNotification({
                    ...userProfile,
                    email: message,
                    conversationSummary: messages.map(m => `${m.type}: ${m.text}`).join('\n')
                });

                setTimeout(() => {
                    addBotMessage(
                        `Perfect! I've sent the Executive Summary to **${message}**.\n\nOur founder will personally reach out within 4 hours.\n\nIn the meantime, feel free to explore our [Investment Thesis](#/investment) page! 🚀`,
                        null
                    );
                    setStage('completed');
                }, 1000);
            }
        } else {
            handleFAQ(message);
        }
    };

    const sendLeadNotification = async (leadData) => {
        try {
            await fetch("https://formsubmit.co/ajax/vuquangcuong@gmail.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: "🚀 [HOT LEAD] - Quantix Investor Inquiry",
                    name: leadData.name,
                    email: leadData.email,
                    role: leadData.role,
                    conversation: leadData.conversationSummary,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error("Failed to send lead notification:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9998,
                        transition: 'transform 0.3s ease',
                        animation: 'pulse 2s infinite'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MessageCircle size={28} color="#000" />
                    <style>{`
            @keyframes pulse {
              0%, 100% { box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4); }
              50% { box-shadow: 0 4px 30px rgba(255, 215, 0, 0.8); }
            }
          `}</style>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '400px',
                    maxWidth: 'calc(100vw - 2rem)',
                    height: '600px',
                    maxHeight: 'calc(100vh - 4rem)',
                    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 9999,
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Sparkles size={24} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Quantix AI Concierge</h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Investment Advisory Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'rgba(0,0,0,0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} color="#000" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {messages.map((msg) => (
                            <div key={msg.id}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: '0.5rem'
                                }}>
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        background: msg.type === 'user'
                                            ? 'linear-gradient(135deg, #00F0FF 0%, #00BA88 100%)'
                                            : 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.5,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>

                                {/* Quick Replies */}
                                {msg.quickReplies && (
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        marginTop: '0.5rem'
                                    }}>
                                        {msg.quickReplies.map((reply, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleQuickReply(reply)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid #FFD700',
                                                    background: 'rgba(255, 215, 0, 0.1)',
                                                    color: '#FFD700',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    fontWeight: '500'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#FFD700';
                                                    e.currentTarget.style.color = '#000';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                                                    e.currentTarget.style.color = '#FFD700';
                                                }}
                                            >
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    {stage !== 'completed' && (
                        <div style={{
                            padding: '1rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={
                                    stage === 'capture' && !userProfile.name ? "Your name..." :
                                        stage === 'capture' && !userProfile.email ? "Your email..." :
                                            "Type your message..."
                                }
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                    color: '#000',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
