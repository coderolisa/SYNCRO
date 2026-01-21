"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  Zap,
  Plus,
  X,
} from "lucide-react";

interface OnboardingModalProps {
  onClose: () => void;
  onModeSelect: (mode: "individual" | "enterprise") => void;
  darkMode?: boolean;
}

export default function OnboardingModal({
  onClose,
  onModeSelect,
  darkMode = false,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [connectionMethod, setConnectionMethod] = useState<
    "gmail" | "manual" | null
  >(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({
    emails: 0,
    subscriptions: 0,
    time: 0,
  });
  const [foundSubscriptions, setFoundSubscriptions] = useState<any[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<
    Set<number>
  >(new Set());
  const [connectedEmails, setConnectedEmails] = useState<string[]>([]);
  const [showAddAnotherEmail, setShowAddAnotherEmail] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    recentStatus: "",
    monthlySpend: "",
    budgetLimit: "",
    budgetAlert: true,
    notifications: {
      billingReminders: true,
      weeklyReports: false,
      recommendations: true,
    },
  });

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev.time >= 45) {
            clearInterval(interval);
            setIsScanning(false);
            // Show found subscriptions
            const subs = [
              {
                id: 1,
                name: "Midjourney",
                cost: 20,
                icon: "🎨",
                email: connectedEmails[connectedEmails.length - 1],
              },
              {
                id: 2,
                name: "Midjourney",
                cost: 30,
                icon: "🎨",
                email: connectedEmails[connectedEmails.length - 1],
              },
              {
                id: 3,
                name: "Midjourney",
                cost: 10,
                icon: "🎨",
                email: connectedEmails[connectedEmails.length - 1],
              },
              {
                id: 4,
                name: "Midjourney",
                cost: 20,
                icon: "🎨",
                email: connectedEmails[connectedEmails.length - 1],
              },
              {
                id: 5,
                name: "ChatGPT Pro",
                cost: 20,
                icon: "🤖",
                email: connectedEmails[connectedEmails.length - 1],
              },
              {
                id: 6,
                name: "Claude Pro",
                cost: 20,
                icon: "✨",
                email: connectedEmails[connectedEmails.length - 1],
              },
              {
                id: 7,
                name: "Perplexity",
                cost: 20,
                icon: "🔍",
                email: connectedEmails[connectedEmails.length - 1],
              },
              {
                id: 8,
                name: "GitHub Copilot",
                cost: 10,
                icon: "💻",
                email: connectedEmails[connectedEmails.length - 1],
              },
            ];
            setFoundSubscriptions([...foundSubscriptions, ...subs]);
            const newSelected = new Set(selectedSubscriptions);
            subs.forEach((s) => newSelected.add(s.id));
            setSelectedSubscriptions(newSelected);
            return prev;
          }
          return {
            emails: Math.min(prev.emails + 50, 1247),
            subscriptions: Math.min(prev.subscriptions + 1, 10),
            time: prev.time + 1,
          };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isScanning, connectedEmails, foundSubscriptions, selectedSubscriptions]);

  const handleConnectGmail = () => {
    console.log("[v0] Connecting Gmail account...");
    // Simulate Gmail OAuth flow
    const mockEmail = `user${connectedEmails.length + 1}@gmail.com`;
    setConnectedEmails([...connectedEmails, mockEmail]);
    setIsScanning(true);
    setShowAddAnotherEmail(false);
  };

  const handleRemoveEmail = (email: string) => {
    setConnectedEmails(connectedEmails.filter((e) => e !== email));
    // Remove subscriptions from this email
    const subsToRemove = foundSubscriptions
      .filter((sub) => sub.email === email)
      .map((sub) => sub.id);
    setFoundSubscriptions(
      foundSubscriptions.filter((sub) => sub.email !== email)
    );
    const newSelected = new Set(selectedSubscriptions);
    subsToRemove.forEach((id) => newSelected.delete(id));
    setSelectedSubscriptions(newSelected);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 3) {
        setIsScanning(false);
        setScanProgress({ emails: 0, subscriptions: 0, time: 0 });
      }
    }
  };

  const handleNext = () => {
    if (step === 2 && connectionMethod === "gmail") {
      handleConnectGmail();
      setStep(3);
    } else if (step === 2 && connectionMethod === "manual") {
      setStep(4);
    } else if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleModeSelection = (mode: "individual" | "enterprise") => {
    // Mark onboarding as completed
    localStorage.setItem("onboarding_completed", "true");
    onModeSelect(mode);
    onClose();
  };

  const toggleSubscription = (id: number) => {
    const newSelected = new Set(selectedSubscriptions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSubscriptions(newSelected);
  };

  const totalCost = foundSubscriptions
    .filter((sub) => selectedSubscriptions.has(sub.id))
    .reduce((sum, sub) => sum + sub.cost, 0);

  const isStepValid = () => {
    if (step === 1)
      return (
        formData.name &&
        formData.role &&
        formData.recentStatus &&
        formData.monthlySpend
      );
    if (step === 2) return connectionMethod !== null;
    if (step === 3) return !isScanning && foundSubscriptions.length > 0;
    if (step === 4) return true;
    return false;
  };

  const progressDots = [1, 2, 3, 4];

  const getLeftContent = () => {
    if (step === 1) {
      return {
        title: "Welcome to\nSubsync",
        description:
          "Track all your subscriptions in one place. Optimize your spending and never miss a renewal again.",
      };
    } else if (step === 2) {
      return {
        title: "Connect Your\nAccounts",
        description:
          "We'll automatically discover your subscriptions and track your spending across all services.",
      };
    } else if (step === 3) {
      return {
        title: isScanning
          ? "Scanning\nYour Gmail"
          : "Setting up\nYour Dashboard",
        description:
          "We're securely analyzing your emails to find subscription receipts and billing information.",
        showStats: true,
      };
    } else if (step === 4) {
      return {
        title: "Setting up\nYour Dashboard",
        description:
          "We're creating your personalized subscription management dashboard with smart insights and recommendations.",
        showProgress: true,
      };
    } else {
      return {
        title: "Choose Your\nAccount Type",
        description: "Select the plan that works best for you",
      };
    }
  };

  const leftContent = getLeftContent();

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Left Side - Branding */}
      <div className="w-1/2 bg-[#1E2A35] text-white p-12 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Subsync</h1>
        </div>

        <div>
          <h2 className="text-4xl font-bold mb-6 leading-tight whitespace-pre-line">
            {leftContent.title}
          </h2>
          <p className="text-gray-300 text-base mb-8 leading-relaxed">
            {leftContent.description}
          </p>

          {leftContent.showStats && (
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Emails scanned:</span>
                <span className="text-white font-semibold">
                  {scanProgress.emails.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Subscriptions found:</span>
                <span className="text-[#007A5C] font-semibold">
                  {scanProgress.subscriptions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Processing time:</span>
                <span className="text-white font-semibold">
                  00:{scanProgress.time.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          )}

          {leftContent.showProgress && (
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#007A5C]" />
                <span>Analysing subscription patterns</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#007A5C]" />
                <span>Setting up cost tracking</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#007A5C]" />
                <span>Creating smart recommendation</span>
              </div>
            </div>
          )}

          {step <= 2 && (
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm border border-white/20">
                Smart analysis
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm border border-white/20">
                Cost optimization
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm border border-white/20">
                Bank level security
              </span>
            </div>
          )}
        </div>

        <div className="text-gray-400 text-sm">
          © 2025 Subsync. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-1/2 bg-[#F9F6F2] p-12 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            {step <= 4 && (
              <span className="text-sm text-gray-500">
                Step {step} out of 4
              </span>
            )}
          </div>

          {step <= 4 && (
            <div className="flex gap-2 mb-8">
              {progressDots.map((dot) => (
                <div
                  key={dot}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    dot <= step ? "bg-gray-900" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}

          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            {step === 1 && "Let's get you started"}
            {step === 2 && "How would you like to connect?"}
            {step === 3 && "Found Your Subscriptions"}
            {step === 4 && "Customise Your Experience"}
            {step === 5 && "Choose Your Account Type"}
          </h3>
          <p className="text-gray-600 text-base">
            {step === 1 &&
              "First tell us a bit about yourself to personalise your experience"}
            {step === 2 &&
              "Choose the method that works best for you. You can always add more later."}
            {step === 3 &&
              `Great! We discovered ${
                foundSubscriptions.length
              } subscriptions across ${connectedEmails.length} email${
                connectedEmails.length !== 1 ? "s" : ""
              }. Review and confirm below.`}
            {step === 4 &&
              "Let's personalise your dashboard with smart settings and preferences."}
            {step === 5 && "Select the plan that works best for you"}
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto mb-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your name?
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your Role?
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="e.g., Product Manager, Developer"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your recent subscription status?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Just getting started",
                    "Managing a few",
                    "Have many subscriptions",
                    "Looking to optimize",
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() =>
                        setFormData({ ...formData, recentStatus: option })
                      }
                      className={`p-4 rounded-lg border-2 font-medium transition-all ${
                        formData.recentStatus === option
                          ? "border-gray-900 bg-gray-50 text-gray-900"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approximate monthly spend on all subscriptions
                </label>
                <input
                  type="text"
                  value={formData.monthlySpend}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlySpend: e.target.value })
                  }
                  placeholder="e.g., $200"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This helps us provide better insights
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <button
                onClick={() => setConnectionMethod("gmail")}
                className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                  connectionMethod === "gmail"
                    ? "border-gray-900 bg-white"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Connect Gmail
                  </h4>
                  <Mail className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  We'll scan your receipts and billing emails to automatically
                  detect all your subscriptions.
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>Automatic detection</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>2min Setup</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setConnectionMethod("manual")}
                className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                  connectionMethod === "manual"
                    ? "border-gray-900 bg-white"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Add Manually
                  </h4>
                  <span className="text-2xl">✏️</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Prefer to add your subscriptions one by one? No problem, we'll
                  guide you through it.
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>✓</span>
                    <span>Full control</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>5 min setup</span>
                  </div>
                </div>
              </button>

              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  Your privacy is our priority
                </p>
                <p className="text-xs text-gray-600">
                  We only read billing emails from verified service providers.
                  Your personal emails and sensitive data remain completely
                  private and encrypted.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {connectedEmails.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Connected Email Accounts
                  </h4>
                  <div className="space-y-2">
                    {connectedEmails.map((email, index) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900">{email}</span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-[#FFD166] text-[#1E2A35] text-xs font-medium rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        {index > 0 && (
                          <button
                            onClick={() => handleRemoveEmail(email)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isScanning && !showAddAnotherEmail && (
                <button
                  onClick={() => setShowAddAnotherEmail(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Email Account
                </button>
              )}

              {showAddAnotherEmail && !isScanning && (
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 mb-3">
                    Connect another Gmail account to find more subscriptions
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConnectGmail}
                      className="flex-1 px-4 py-2 bg-[#007A5C] text-white rounded-lg text-sm font-medium hover:bg-[#007A5C]/90"
                    >
                      Connect Gmail
                    </button>
                    <button
                      onClick={() => setShowAddAnotherEmail(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {foundSubscriptions.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubscription(sub.id)}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg"></div>
                    <div>
                      <p className="font-medium text-gray-900">{sub.name}</p>
                      <p className="text-sm text-gray-600">
                        ${sub.cost}.00/month
                      </p>
                      {sub.email && (
                        <p className="text-xs text-gray-500">{sub.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#007A5C]/10 text-[#007A5C] text-xs font-medium rounded-full">
                      Active
                    </span>
                    {selectedSubscriptions.has(sub.id) && (
                      <CheckCircle2 className="w-5 h-5 text-[#007A5C]" />
                    )}
                  </div>
                </div>
              ))}

              {foundSubscriptions.length > 4 && (
                <button className="w-full py-3 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
                  <span className="text-xl">+</span>
                  Show {foundSubscriptions.length - 4} more subscriptions
                </button>
              )}

              <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Monthly Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      ${totalCost}
                    </p>
                    <p className="text-sm text-gray-600">Total montly cost</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {selectedSubscriptions.size}
                    </p>
                    <p className="text-sm text-gray-600">
                      Active subscriptions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
                    <span className="text-white text-xs">🔔</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    Notification Preference
                  </h4>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.billingReminders}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            billingReminders: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      Billing reminders
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.weeklyReports}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            weeklyReports: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      Weekly reports
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.recommendations}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            recommendations: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      Cost-saving recommendations
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
                    <span className="text-white text-xs">💰</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    Budget settings
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Monthly budget limit
                    </label>
                    <input
                      type="text"
                      value={formData.budgetLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetLimit: e.target.value,
                        })
                      }
                      placeholder="e.g., $200"
                      className="w-full px-4 py-2 bg-[#F9F6F2] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.budgetAlert}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetAlert: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      Alert me when I reach 80% of my budget
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Setup summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email Accounts:</span>
                    <span className="font-medium text-gray-900">
                      {connectedEmails.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Subscriptions Imported:
                    </span>
                    <span className="font-medium text-gray-900">
                      {foundSubscriptions.length} services
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly total:</span>
                    <span className="font-medium text-[#007A5C]">
                      ${totalCost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget Limit:</span>
                    <span className="font-medium text-gray-900">
                      ${formData.budgetLimit || "200"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <button
                onClick={() => handleModeSelection("individual")}
                className="w-full p-6 border-2 border-gray-300 rounded-xl hover:border-[#FFD166] hover:bg-[#FFD166]/10 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FFD166] rounded-lg flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">
                      Individual
                    </h5>
                    <p className="text-sm text-gray-600">
                      Perfect for freelancers and individuals tracking their
                      personal subscriptions
                    </p>
                    <p className="text-xs text-[#007A5C] mt-2 font-medium">
                      $5/month - Pro Plan
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleModeSelection("enterprise")}
                disabled
                className="w-full p-6 border-2 border-gray-300 rounded-xl opacity-60 cursor-not-allowed text-left relative"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#1E2A35] rounded-lg flex items-center justify-center text-2xl">
                    🏢
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-gray-900">
                        Enterprise
                      </h5>
                      <span className="px-2 py-0.5 bg-[#FFD166] text-[#1E2A35] text-xs font-medium rounded">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      For teams and organizations managing multiple
                      subscriptions across team members
                    </p>
                    <p className="text-xs text-[#007A5C] mt-2 font-medium">
                      $60/month - Enterprise Plan
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="space-y-3">
          {step === 3 && !isScanning && (
            <>
              <button
                onClick={handleNext}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Continue with selected Subscriptions
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors border border-gray-300">
                Add More Subscriptions Manually
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <button
                onClick={handleNext}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-full py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Skip setup for now
              </button>
            </>
          )}

          {step !== 3 && step !== 4 && step !== 5 && (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
