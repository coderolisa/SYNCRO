"use client";

import { Building2, User } from "lucide-react";

interface WelcomePageProps {
    onSelectMode: (mode: "individual" | "enterprise") => void;
    darkMode: boolean;
}

export default function WelcomePage({
    onSelectMode,
    darkMode,
}: WelcomePageProps) {
    const supportedTools = [
        {
            category: "AI Tools",
            tools: [
                {
                    name: "ChatGPT",
                    logo: "https://cdn.openai.com/assets/favicon-32x32-OHVz3qMC.png",
                },
                { name: "Claude", logo: "https://claude.ai/favicon.ico" },
                {
                    name: "Midjourney",
                    logo: "https://www.midjourney.com/favicon.ico",
                },
                {
                    name: "GitHub Copilot",
                    logo: "https://github.githubassets.com/favicons/favicon.svg",
                },
                {
                    name: "Perplexity",
                    logo: "https://www.perplexity.ai/favicon.svg",
                },
                { name: "Jasper", logo: "https://www.jasper.ai/favicon.ico" },
            ],
        },
        {
            category: "Streaming",
            tools: [
                {
                    name: "Netflix",
                    logo: "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2023.ico",
                },
                {
                    name: "Spotify",
                    logo: "https://www.spotify.com/favicon.ico",
                },
                {
                    name: "Disney+",
                    logo: "https://www.disneyplus.com/favicon.ico",
                },
                { name: "Hulu", logo: "https://www.hulu.com/favicon.ico" },
                {
                    name: "Apple Music",
                    logo: "https://www.apple.com/favicon.ico",
                },
                {
                    name: "YouTube Premium",
                    logo: "https://www.youtube.com/favicon.ico",
                },
            ],
        },
        {
            category: "Productivity",
            tools: [
                {
                    name: "Notion",
                    logo: "https://www.notion.so/images/favicon.ico",
                },
                {
                    name: "Microsoft 365",
                    logo: "https://www.microsoft.com/favicon.ico",
                },
                {
                    name: "Google Workspace",
                    logo: "https://www.google.com/favicon.ico",
                },
                { name: "Slack", logo: "https://slack.com/favicon.ico" },
                { name: "Zoom", logo: "https://zoom.us/favicon.ico" },
                {
                    name: "Dropbox",
                    logo: "https://www.dropbox.com/static/images/favicon.ico",
                },
            ],
        },
        {
            category: "Design",
            tools: [
                {
                    name: "Adobe Creative Cloud",
                    logo: "https://www.adobe.com/favicon.ico",
                },
                {
                    name: "Figma",
                    logo: "https://static.figma.com/app/icon/1/favicon.ico",
                },
                { name: "Canva", logo: "https://www.canva.com/favicon.ico" },
                { name: "Sketch", logo: "https://www.sketch.com/favicon.ico" },
            ],
        },
        {
            category: "Development",
            tools: [
                {
                    name: "GitHub",
                    logo: "https://github.githubassets.com/favicons/favicon.svg",
                },
                { name: "Vercel", logo: "https://vercel.com/favicon.ico" },
                { name: "AWS", logo: "https://aws.amazon.com/favicon.ico" },
                { name: "Heroku", logo: "https://www.heroku.com/favicon.ico" },
            ],
        },
        {
            category: "Finance",
            tools: [
                {
                    name: "QuickBooks",
                    logo: "https://quickbooks.intuit.com/favicon.ico",
                },
                {
                    name: "FreshBooks",
                    logo: "https://www.freshbooks.com/favicon.ico",
                },
            ],
        },
        {
            category: "Health & Fitness",
            tools: [
                {
                    name: "Peloton",
                    logo: "https://www.onepeloton.com/favicon.ico",
                },
                {
                    name: "Headspace",
                    logo: "https://www.headspace.com/favicon.ico",
                },
                { name: "Calm", logo: "https://www.calm.com/favicon.ico" },
            ],
        },
        {
            category: "Gaming",
            tools: [
                {
                    name: "PlayStation Plus",
                    logo: "https://www.playstation.com/favicon.ico",
                },
                {
                    name: "Xbox Game Pass",
                    logo: "https://www.xbox.com/favicon.ico",
                },
                {
                    name: "Nintendo Switch Online",
                    logo: "https://www.nintendo.com/favicon.ico",
                },
            ],
        },
    ];

    return (
        <div
            className={`min-h-screen flex items-center justify-center p-8 ${
                darkMode ? "bg-[#1E2A35]" : "bg-[#F9F6F2]"
            }`}
        >
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1
                        className={`text-4xl font-bold mb-4 ${
                            darkMode ? "text-[#F9F6F2]" : "text-[#1E2A35]"
                        }`}
                    >
                        All your subscriptions, one dashboard.
                    </h1>
                    <p
                        className={`text-lg ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                        Track, optimize, and save on every subscription — from
                        AI tools to streaming services.
                    </p>
                </div>

                {/* Mode Selection Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {/* Individual Card */}
                    <button
                        onClick={() => onSelectMode("individual")}
                        className={`p-8 rounded-xl border-2 transition-all hover:scale-105 ${
                            darkMode
                                ? "bg-[#2D3748] border-[#374151] hover:border-[#FFD166]"
                                : "bg-white border-gray-200 hover:border-[#FFD166]"
                        }`}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                    darkMode ? "bg-[#FFD166]" : "bg-[#1E2A35]"
                                }`}
                            >
                                <User
                                    className={`w-8 h-8 ${
                                        darkMode
                                            ? "text-[#1E2A35]"
                                            : "text-white"
                                    }`}
                                />
                            </div>
                            <h3
                                className={`text-xl font-bold mb-2 ${
                                    darkMode
                                        ? "text-[#F9F6F2]"
                                        : "text-[#1E2A35]"
                                }`}
                            >
                                Continue as Individual
                            </h3>
                            <p
                                className={`text-sm ${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                            >
                                Manage your personal subscriptions
                            </p>
                            <div className="mt-4 px-4 py-2 bg-[#FFD166] text-[#1E2A35] rounded-lg font-medium">
                                Free - Up to 5 subscriptions
                            </div>
                        </div>
                    </button>

                    {/* Enterprise Card */}
                    <button
                        disabled
                        className={`p-8 rounded-xl border-2 transition-all opacity-60 cursor-not-allowed relative ${
                            darkMode
                                ? "bg-[#2D3748] border-[#374151]"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                    darkMode ? "bg-[#E86A33]" : "bg-[#1E2A35]"
                                }`}
                            >
                                <Building2
                                    className={`w-8 h-8 ${
                                        darkMode ? "text-white" : "text-white"
                                    }`}
                                />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3
                                    className={`text-xl font-bold ${
                                        darkMode
                                            ? "text-[#F9F6F2]"
                                            : "text-[#1E2A35]"
                                    }`}
                                >
                                    Continue as Enterprise
                                </h3>
                                <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        darkMode
                                            ? "bg-[#FFD166] text-[#1E2A35]"
                                            : "bg-[#FFD166] text-[#1E2A35]"
                                    }`}
                                >
                                    Coming Soon
                                </span>
                            </div>
                            <p
                                className={`text-sm ${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                            >
                                Manage team subscriptions and permissions
                            </p>
                            <div className="mt-4 px-4 py-2 bg-[#E86A33] text-white rounded-lg font-medium">
                                $60/month - Unlimited subscriptions
                            </div>
                        </div>
                    </button>
                </div>

                {/* Supported Tools & Services */}
                <div className="mt-16">
                    <h2
                        className={`text-2xl font-bold text-center mb-8 ${
                            darkMode ? "text-[#F9F6F2]" : "text-[#1E2A35]"
                        }`}
                    >
                        Supported Tools & Services
                    </h2>
                    <div className="space-y-8">
                        {supportedTools.map((category) => (
                            <div key={category.category}>
                                <h3
                                    className={`text-sm font-semibold mb-4 ${
                                        darkMode
                                            ? "text-[#FFD166]"
                                            : "text-[#1E2A35]"
                                    }`}
                                >
                                    {category.category}
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {category.tools.map((tool) => (
                                        <div
                                            key={tool.name}
                                            className={`flex flex-col items-center p-4 rounded-lg transition-all hover:scale-105 ${
                                                darkMode
                                                    ? "bg-[#2D3748] hover:bg-[#374151]"
                                                    : "bg-white hover:bg-gray-50"
                                            }`}
                                        >
                                            <img
                                                src={
                                                    tool.logo ||
                                                    "/placeholder.svg"
                                                }
                                                alt={tool.name}
                                                className="w-10 h-10 mb-2 object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        "/placeholder.svg?height=40&width=40";
                                                }}
                                            />
                                            <span
                                                className={`text-xs text-center leading-tight ${
                                                    darkMode
                                                        ? "text-gray-300"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {tool.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p
                        className={`text-center mt-8 text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                        And many more... Can't find your subscription? Add it
                        manually!
                    </p>
                </div>
            </div>
        </div>
    );
}
