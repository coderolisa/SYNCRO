"use client"

import { useState } from "react"
import { ArrowLeft, Plus, X } from "lucide-react"

interface EnterpriseSetupProps {
  onComplete: (workspace: any) => void
  onBack: () => void
  darkMode: boolean
}

export default function EnterpriseSetup({ onComplete, onBack, darkMode }: EnterpriseSetupProps) {
  const [step, setStep] = useState(1)
  const [workspace, setWorkspace] = useState({
    companyName: "",
    domain: "",
    industry: "",
    teamSize: "",
  })
  const [members, setMembers] = useState<Array<{ name: string; email: string; role: string }>>([])
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "Member" })

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      setMembers([...members, newMember])
      setNewMember({ name: "", email: "", role: "Member" })
    }
  }

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onComplete({ ...workspace, members })
    }
  }

  return (
    <div className={`min-h-screen p-8 ${darkMode ? "bg-[#1E2A35]" : "bg-[#F9F6F2]"}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-8 ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Step {step} of 3</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-[#FFD166] h-2 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Company Setup */}
        {step === 1 && (
          <div className={`p-8 rounded-xl ${darkMode ? "bg-[#2D3748]" : "bg-white"}`}>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>
              Let's create your workspace
            </h2>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              We'll use your domain to detect existing subscriptions.
            </p>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={workspace.companyName}
                  onChange={(e) => setWorkspace({ ...workspace, companyName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Domain
                </label>
                <input
                  type="text"
                  value={workspace.domain}
                  onChange={(e) => setWorkspace({ ...workspace, domain: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="@company.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Industry
                </label>
                <select
                  value={workspace.industry}
                  onChange={(e) => setWorkspace({ ...workspace, industry: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Select industry</option>
                  <option value="tech">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Team Size
                </label>
                <input
                  type="number"
                  value={workspace.teamSize}
                  onChange={(e) => setWorkspace({ ...workspace, teamSize: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Add Team Members */}
        {step === 2 && (
          <div className={`p-8 rounded-xl ${darkMode ? "bg-[#2D3748]" : "bg-white"}`}>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>
              Add team members
            </h2>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              We'll send them invites to join and connect their tools.
            </p>

            {/* Add Member Form */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Name"
              />
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Email"
              />
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
                <option value="Billing Manager">Billing Manager</option>
              </select>
            </div>

            <button
              onClick={handleAddMember}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFD166] text-[#1E2A35] rounded-lg font-medium mb-6"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>

            {/* Members List */}
            <div className="space-y-2">
              {members.map((member, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    darkMode ? "bg-[#374151]" : "bg-gray-50"
                  }`}
                >
                  <div>
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{member.name}</div>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {member.email} • {member.role}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(index)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className={`p-8 rounded-xl ${darkMode ? "bg-[#2D3748]" : "bg-white"}`}>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>
              Review & Confirm
            </h2>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Review your workspace setup before proceeding.
            </p>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? "bg-[#374151]" : "bg-gray-50"}`}>
                <div className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Company
                </div>
                <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {workspace.companyName}
                </div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {workspace.domain} • {workspace.industry} • {workspace.teamSize} employees
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? "bg-[#374151]" : "bg-gray-50"}`}>
                <div className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Team Members ({members.length})
                </div>
                {members.map((member, index) => (
                  <div key={index} className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {member.name} ({member.role})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className={`px-6 py-2 rounded-lg ${
                darkMode ? "bg-[#374151] text-white hover:bg-[#4B5563]" : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && (!workspace.companyName || !workspace.domain)) || (step === 2 && members.length === 0)
            }
            className="ml-auto px-6 py-2 bg-[#FFD166] text-[#1E2A35] rounded-lg font-medium hover:bg-[#E8BD4E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? "Complete Setup" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}
