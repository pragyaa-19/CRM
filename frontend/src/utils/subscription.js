
export const isProPlan = (subscription) => {
    if (!subscription) return false;

    const plan = subscription.plan?.toUpperCase();
    const status = subscription.status?.toUpperCase();

    return (
        ["PRO_MONTHLY", "PRO_YEARLY"].includes(plan) &&
        status === "ACTIVE"
    );
};
