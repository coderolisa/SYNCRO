"use client";

interface BudgetAlertProps {
    alert: {
        level: "critical" | "warning";
        message: string;
        percentage: string;
    };
    darkMode: boolean;
}

export function BudgetAlert({ alert, darkMode }: BudgetAlertProps) {
    return (
        <div
            className={`mb-6 p-4 ${
                alert.level === "critical"
                    ? darkMode
                        ? "bg-[#E86A33]/20 border-[#E86A33]"
                        : "bg-red-50 border-red-200"
                    : darkMode
                      ? "bg-[#FFD166]/20 border-[#FFD166]"
                      : "bg-yellow-50 border-yellow-200"
            } border rounded-lg`}
        >
            <p
                className={`text-sm font-medium ${
                    alert.level === "critical"
                        ? darkMode
                            ? "text-[#E86A33]"
                            : "text-red-800"
                        : darkMode
                          ? "text-[#FFD166]"
                          : "text-yellow-800"
                }`}
            >
                {alert.level === "critical" ? "🚨 " : "⚠️ "}
                {alert.message}
            </p>
            <div
                className={`mt-2 w-full ${
                    alert.level === "critical"
                        ? darkMode
                            ? "bg-[#E86A33]/30"
                            : "bg-red-200"
                        : darkMode
                          ? "bg-[#FFD166]/30"
                          : "bg-yellow-200"
                } rounded-full h-2`}
            >
                <div
                    className={alert.level === "critical" ? "bg-[#E86A33]" : "bg-[#FFD166]"}
                    style={{
                        width: `${Math.min(Number.parseFloat(alert.percentage), 100)}%`,
                        height: "100%",
                        borderRadius: "9999px",
                    }}
                ></div>
            </div>
        </div>
    );
}

