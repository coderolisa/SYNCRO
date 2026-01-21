export interface BudgetAlert {
    level: "critical" | "warning";
    message: string;
    percentage: string;
}

export function checkBudgetAlerts(
    totalSpend: number,
    budgetLimit: number
): BudgetAlert | null {
    const percentage = (totalSpend / budgetLimit) * 100;

    if (percentage >= 100) {
        return {
            level: "critical",
            message: `You've exceeded your $${budgetLimit} budget by $${(
                totalSpend - budgetLimit
            ).toFixed(2)}`,
            percentage: percentage.toFixed(0),
        };
    } else if (percentage >= 80) {
        return {
            level: "warning",
            message: `You've used ${percentage.toFixed(
                0
            )}% of your $${budgetLimit} budget`,
            percentage: percentage.toFixed(0),
        };
    }

    return null;
}
