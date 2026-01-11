import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, TrendingUp, Mail, User, Briefcase, Loader2 } from 'lucide-react';

// ===== QUANTIX AI CORE v1.5 - HYBRID INTELLIGENCE =====
const API_URL = "https://quantix-ai-core.up.railway.app/api/chat"; // Update this with your Railway URL

const FAQ_DATABASE = {
    'technical_inquiry': {
        question: "⚙️ Technical Inquiry",
        answer: "Quantix Core v1.5 uses **Semantic Caching** to reduce LLM overhead by 70%. We process real-time market data through a hybrid routing system, ensuring high-speed delivery with minimal API costs.\n\nWould you like to see our Architecture Diagram?",
        followUp: "May I have your email to send the technical documentation?"
    },
    'be_a_partner': {
        question: "🤝 I want to be a Partner",
        answer: "We're looking for **Strategic Partners** to scale the Quantix ecosystem. We offer:\n\n• Revenue Sharing for KOLs\n• API Licensing for institutions\n• White-label solutions\n\nShould I send our Partnership Deck to your email?",
        followUp: "Please provide your email to receive the Partnership Package.",
        isVIP: true
    },
    'investment_case': {
        question: "📊 Investment Case",
        answer: "Our **Unit Economics** are built for scale:\n\n• 90% gross margin per premium user\n• $2.50 CAC with 12-month payback\n• Projected ARR: $5M by Q4 2026\n\nQuantix is designed for rapid ROI. May I provide our 24-month financial roadmap?",
        followUp: "To send the full Investment Memo, I'll need your email address."
    },
    'market_performance': {
        question: "📈 Market Performance",
        answer: "Version 1.5 has expanded from VN30 to the **full market**, maintaining an 85%+ Confidence Score on trend signals.\n\nWe focus on 'Micro-Personalization'—analyzing exactly what's in YOUR portfolio, not generic market noise.",
        followUp: "Want to see live performance metrics? Leave your email below."
    },
    'vision': {
        question: "👁️ Vision & Strategy",
        answer: "Our vision is to solve the **'Mass-Personalization'** challenge. While others offer generic signals, Quantix delivers institutional-grade insights tailored to millions of individual portfolios at a fraction of the cost."
    }
};

const QUICK_REPLIES = [
    { id: 'technical_inquiry', text: "⚙️ Technical Inquiry" },
    { id: 'be_a_partner', text: "🤝 I want to be a Partner" },
    { id: 'investment_case', text: "📊 Investment Case" },
    { id: 'market_performance', text: "📈 Market Performance" }
];

export default function InvestorConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [userProfile, setUserProfile] = useState({ name: '', email: '', role: '' });
    const [stage, setStage] = useState('greeting');
    const [hasGreeted, setHasGreeted] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleDocRequest = (event) => {
            const { docType } = event.detail;
            setIsOpen(true);
            let message = "";
            let newStage = 'capture_doc';

            if (docType === 'BusinessCase') {
                message = "📄 I see you're interested in our **Business Case**. I'd be happy to share that secure document with you.\n\nMay I have your email address to send the download link?";
            } else if (docType === 'FreeTrial') {
                message = "🚀 Excellent choice! To start your **14-day Free Trial** of Quantix AI Core, I just need your email to set up your secure workspace.";
            } else if (docType === 'ViewDemo') {
                message = "👀 Want to see Quantix in action? Please provide your email to receive a recorded walkthrough or schedule a live demo.";
            } else {
                message = "👋 How can I help you today? Please provide your email for more information.";
            }

            setTimeout(() => {
                addBotMessage(message, null);
                setStage(newStage);
                setUserProfile(prev => ({ ...prev, role: docType || 'interested_party' }));
            }, isOpen ? 500 : 1000);
        };

        window.addEventListener('open-quantix-doc', handleDocRequest);
        return () => window.removeEventListener('open-quantix-doc', handleDocRequest);
    }, [isOpen]);

    useEffect(() => {
        if (!hasGreeted) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                addBotMessage(
                    "👋 Welcome to Quantix AI Core v1.5! I'm your AI Concierge.\n\nHow can I help you today?",
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

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        const message = inputValue.trim();
        addUserMessage(message);
        setInputValue('');

        if (stage === 'capture_doc' || (stage === 'capture' && userProfile.name)) {
            // Email/Lead Capture Logic
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(message)) {
                setIsTyping(true);
                setUserProfile(prev => ({ ...prev, email: message }));
                await sendLeadNotification({ ...userProfile, email: message });
                setTimeout(() => {
                    setIsTyping(false);
                    addBotMessage(`Perfect! I've sent the information to **${message}**. What else would you like to know?`, QUICK_REPLIES.map(q => q.text));
                    setStage('consulting');
                }, 1000);
                return;
            }
        }

        // Try Hybrid AI
        setIsTyping(true);

        // 1. Try FAQ first
        const faqItem = findFAQ(message);
        if (faqItem) {
            setTimeout(() => {
                setIsTyping(false);
                addBotMessage(faqItem.answer, faqItem.followUp ? null : QUICK_REPLIES.map(q => q.text));
                if (faqItem.followUp) {
                    setTimeout(() => addBotMessage(faqItem.followUp), 1000);
                    setStage('capture');
                }
            }, 800);
            return;
        }

        // 2. Fallback to Gemini AI via Railway
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            setIsTyping(false);
            addBotMessage(data.response || "I'm having a bit of trouble connecting to my brain. How about another question?");
        } catch (e) {
            console.error("AI Error:", e);
            setIsTyping(false);
            addBotMessage("I am currently focused on market analysis. Would you like to know about our Partnership or Technical setup?", QUICK_REPLIES.map(q => q.text));
        }
    };

    const findFAQ = (query) => {
        const lowerQuery = query.toLowerCase();
        for (const [key, faq] of Object.entries(FAQ_DATABASE)) {
            if (lowerQuery.includes(key) || lowerQuery.includes(faq.question.toLowerCase())) return faq;
        }
        return null;
    };

    const sendLeadNotification = async (leadData) => {
        try {
            await fetch("https://formsubmit.co/ajax/vuquangcuong@gmail.com", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _subject: `🚀 [HOT LEAD] - Quantix Web Inquiry`,
                    ...leadData,
                    conversation: messages.map(m => `${m.type}: ${m.text}`).join('\n')
                })
            });
        } catch (e) { console.error(e); }
    };

    const handleQuickReply = (replyText) => {
        setInputValue(replyText);
        setTimeout(() => handleSendMessage(), 100);
    };

    return (
        <>
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="chat-trigger-btn">
                    <MessageCircle size={28} color="#000" />
                </button>
            )}

            {isOpen && (
                <div className="chat-window glass-panel">
                    <div className="chat-header">
                        <div className="header-info">
                            <Sparkles size={24} />
                            <div>
                                <h3 className="title">Quantix AI Core</h3>
                                <p className="subtitle">Master Hybrid Intelligence</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="close-btn"><X size={18} color="#000" /></button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-wrapper ${msg.type}`}>
                                <div className="message-bubble">{msg.text}</div>
                                {msg.quickReplies && (
                                    <div className="quick-replies">
                                        {msg.quickReplies.map((reply, idx) => (
                                            <button key={idx} onClick={() => handleQuickReply(reply)} className="reply-btn">{reply}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-wrapper bot">
                                <div className="message-bubble typing">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Quantix is thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask me anything (Vietnamese/English)..."
                        />
                        <button onClick={handleSendMessage} className="send-btn"><Send size={18} /></button>
                    </div>
                </div>
            )}

            <style>{`
                .chat-trigger-btn { 
                    position: fixed; bottom: 2rem; right: 2rem; width: 60px; height: 60px; 
                    border-radius: 50%; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); 
                    border: none; box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4); 
                    cursor: pointer; display: flex; align-items: center; justify-content: center; 
                    z-index: 9998; transition: transform 0.3s ease; animation: pulse 2s infinite; 
                }
                .chat-window { 
                    position: fixed; bottom: 2rem; right: 2rem; width: 400px; max-width: calc(100vw - 2rem); 
                    height: 600px; max-height: calc(100vh - 4rem); 
                    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%); 
                    border-radius: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); 
                    border: 1px solid rgba(255, 215, 0, 0.3); display: flex; flex-direction: column; 
                    z-index: 9999; overflow: hidden; font-family: 'Outfit', sans-serif;
                }
                .chat-header { 
                    padding: 1.25rem; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); 
                    color: #000; display: flex; align-items: center; justify-content: space-between; 
                }
                .header-info { display: flex; align-items: center; gap: 0.75rem; }
                .chat-header .title { margin: 0; font-size: 1.1rem; font-weight: bold; color: #000; }
                .chat-header .subtitle { margin: 0; font-size: 0.75rem; opacity: 0.8; color: #000; }
                .close-btn { background: rgba(0,0,0,0.1); border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .chat-messages { 
                    flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; 
                    gap: 1rem; scrollbar-width: thin; scrollbar-color: rgba(255,215,0,0.2) transparent; 
                }
                .message-wrapper { display: flex; flex-direction: column; margin-bottom: 0.5rem; }
                .message-wrapper.user { align-items: flex-end; }
                .message-wrapper.bot { align-items: flex-start; }
                .message-bubble { 
                    max-width: 85%; padding: 0.75rem 1rem; border-radius: 15px; 
                    font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap; 
                }
                .user .message-bubble { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; border-bottom-right-radius: 2px; }
                .bot .message-bubble { background: rgba(255, 255, 255, 0.08); color: #fff; border-bottom-left-radius: 2px; border: 1px solid rgba(255,255,255,0.05); }
                .typing { display: flex; align-items: center; gap: 8px; opacity: 0.7; }
                .quick-replies { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
                .reply-btn { 
                    padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid rgba(255, 215, 0, 0.4); 
                    background: rgba(255, 215, 0, 0.05); color: #FFD700; font-size: 0.8rem; 
                    cursor: pointer; transition: all 0.2s; font-weight: 500;
                }
                .reply-btn:hover { background: #FFD700; color: #000; }
                .chat-input-area { 
                    padding: 1rem; background: rgba(0,0,0,0.2); 
                    border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; gap: 0.5rem; 
                }
                .chat-input-area input { 
                    flex: 1; padding: 0.75rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); 
                    background: rgba(255, 255, 255, 0.05); color: white; outline: none; font-size: 0.9rem; 
                }
                .send-btn { 
                    width: 45px; height: 45px; border-radius: 12px; border: none; 
                    background: #FFD700; color: #000; cursor: pointer; display: flex; 
                    align-items: center; justify-content: center; transition: transform 0.2s; 
                }
                .send-btn:hover { transform: scale(1.05); }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); } }
            `}</style>
        </>
    );
}
