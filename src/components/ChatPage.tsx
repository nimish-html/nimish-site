import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, Loader2 } from 'lucide-react';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize session and send first message
    useEffect(() => {
        const initSession = async () => {
            try {
                // Create a new session in Firestore
                const sessionRef = await addDoc(collection(db, 'conversations'), {
                    createdAt: serverTimestamp(),
                    messages: []
                });
                setSessionId(sessionRef.id);

                // Initial greeting
                const initialMessage: Message = {
                    role: 'assistant',
                    content: "Hey! 👋 I'm Nimish's AI assistant. He builds AI systems that eliminate manual work for businesses. Quick question - what does your company do?"
                };

                setMessages([initialMessage]);
                await updateDoc(doc(db, 'conversations', sessionRef.id), {
                    messages: [initialMessage]
                });

            } catch (error) {
                console.error("Error initializing session:", error);
                setError("Failed to start chat. Please check your connection.");
            }
        };

        initSession();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || loading || !sessionId) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            // Save user message to Firestore
            const sessionRef = doc(db, 'conversations', sessionId);
            await updateDoc(sessionRef, {
                messages: [...messages, userMessage]
            });

            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(({ role, content }) => ({ role, content }))
                })
            });

            if (!response.ok) throw new Error('API error');

            const data = await response.json();
            const assistantMessage: Message = data.choices[0].message;

            setMessages(prev => [...prev, assistantMessage]);

            // Save assistant message to Firestore
            await updateDoc(sessionRef, {
                messages: [...messages, userMessage, assistantMessage]
            });

        } catch (error) {
            console.error('Chat error:', error);
            setError("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 flex flex-col font-mono text-gray-900">
            {/* Header */}
            <header className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src="/me.png"
                            alt="nimish"
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold">Nimish's AI</h1>
                        <p className="text-xs text-gray-500">Always active</p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-gray-900 text-white rounded-tr-none'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                }`}
                        >
                            {/* Render links if text contains http/https */}
                            {msg.content.split(' ').map((word, i) => {
                                const isLink = word.match(/^https?:\/\//);
                                if (isLink) {
                                    return (
                                        <a
                                            key={i}
                                            href={word}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-blue-500 break-all hover:text-blue-600"
                                        >
                                            {word}{' '}
                                        </a>
                                    );
                                }
                                return word + ' ';
                            })}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            <span className="text-xs text-gray-400">typing...</span>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center">
                        <div className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full">
                            {error}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-4 pb-safe">
                <div className="relative flex items-center gap-2 max-w-2xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your answer..."
                        className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="bg-gray-900 text-white p-3 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
