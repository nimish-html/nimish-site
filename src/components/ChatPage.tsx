import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, Loader2, ArrowLeft } from 'lucide-react';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const cleanDashes = (s: string) => s.replace(/\s*[\u2014\u2013]\s*/g, ', ');

const PRESETS = ['Who is Nimish?', 'How can you help me?', 'What kind of projects have you done for other businesses?'];

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

export function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [failedText, setFailedText] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const sessionPromiseRef = useRef<Promise<string | null> | null>(null);

    const getSessionId = () => {
        if (sessionPromiseRef.current) return sessionPromiseRef.current;
        sessionPromiseRef.current = addDoc(collection(db, 'conversations'), {
            createdAt: serverTimestamp(),
            messages: []
        }).then(ref => ref.id).catch(err => {
            console.error(err);
            sessionPromiseRef.current = null;
            return null;
        });
        return sessionPromiseRef.current;
    };

    const persist = (allMessages: Message[]) => {
        getSessionId().then(id => {
            if (id) return updateDoc(doc(db, 'conversations', id), { messages: allMessages });
        }).catch(console.error);
    };

    const scrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const setVvh = () => {
            document.documentElement.style.setProperty('--vvh', `${vv.height}px`);
        };

        const onResize = () => {
            setVvh();
            scrollToBottom();
        };

        setVvh();
        vv.addEventListener('resize', onResize);
        vv.addEventListener('scroll', setVvh);
        return () => {
            vv.removeEventListener('resize', onResize);
            vv.removeEventListener('scroll', setVvh);
            document.documentElement.style.removeProperty('--vvh');
        };
    }, []);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    useEffect(() => {
        getSessionId();
        setMessages([{
            role: 'assistant',
            content: "Hi, I'm Nimish's AI assistant. Pick a question below or ask me anything."
        }]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, error]);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }, [input]);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        const userMessage: Message = { role: 'user', content: trimmed };
        const history = [...messages, userMessage];
        setMessages(history);
        setInput('');
        setLoading(true);
        setError(null);
        setFailedText(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: history.map(({ role, content }) => ({ role, content }))
                })
            });

            if (!response.ok) throw new Error('API error');

            const data = await response.json();
            const message = data.choices[0].message;
            const assistantMessage: Message = { role: 'assistant', content: cleanDashes(message.content ?? '') };
            const allMessages = [...history, assistantMessage];
            setMessages(allMessages);
            persist(allMessages);
        } catch {
            setMessages(messages);
            setInput(trimmed);
            setFailedText(trimmed);
            setError("Couldn't send your message. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-x-0 top-0 bg-gray-50 flex flex-col font-mono text-gray-900" style={{ height: 'var(--vvh, 100dvh)' }}>
            {/* Header */}
            <header className="bg-white border-b px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between gap-2 shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <Link to="/" aria-label="Back to site" className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-gray-700 active:bg-gray-100 shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="relative shrink-0">
                        <img
                            src="/me-96.png"
                            alt="nimish"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-semibold truncate">Nimish's AI</h1>
                        <p className="text-xs text-gray-500 truncate">Always active</p>
                    </div>
                </div>
                <a
                    href="https://wa.me/917053595967?text=Hi%20Nimish.%20We%20met%20recently%20at%20an%20event."
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Talk on WhatsApp"
                    className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-full bg-[#25D366] text-white text-xs font-semibold whitespace-nowrap shadow-sm active:opacity-90"
                >
                    <WhatsAppIcon /> Talk on WA
                </a>
            </header>

            {/* Chat Area */}
            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${msg.role === 'user'
                                ? 'bg-gray-900 text-white rounded-tr-none'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                }`}
                        >
                            {/* Render links if text contains http/https */}
                            {msg.content.split(/(\s+)/).map((part, i) => {
                                const isLink = part.match(/^https?:\/\//);
                                if (isLink) {
                                    return (
                                        <a
                                            key={i}
                                            href={part}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-blue-500 break-all hover:text-blue-600"
                                        >
                                            {part}
                                        </a>
                                    );
                                }
                                return part;
                            })}
                        </div>
                    </div>
                ))}
                {!messages.some(m => m.role === 'user') && (
                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map((label) => (
                            <button
                                key={label}
                                type="button"
                                disabled={loading}
                                onClick={() => sendMessage(label)}
                                className="min-h-[44px] px-4 py-2 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 text-left shadow-sm active:bg-gray-100 disabled:opacity-50"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
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
                        <div className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full flex items-center gap-2">
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={() => sendMessage(failedText ?? '')}
                                className="min-h-[44px] text-xs underline"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
                <div className="relative flex items-end gap-2 max-w-2xl mx-auto">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                sendMessage(input);
                            }
                        }}
                        enterKeyHint="send"
                        autoCapitalize="sentences"
                        aria-label="Message"
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 border-0 rounded-2xl px-4 py-3 text-base focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400 resize-none overflow-y-auto"
                    />
                    <button
                        type="button"
                        aria-label="Send message"
                        onClick={() => sendMessage(input)}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={!input.trim() || loading}
                        className="bg-gray-900 text-white w-11 h-11 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
