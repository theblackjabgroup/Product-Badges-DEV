import React, { createContext, useContext, useState } from "react";

// Create a context with default value
const PlanContext = createContext({ isOnPaidPlan: false, setIsOnPaidPlan: () => {} });

export const PlanProvider = ({ children }) => {
  const [isOnPaidPlan, setIsOnPaidPlan] = useState(false);

  return (
    <PlanContext.Provider value={{ isOnPaidPlan, setIsOnPaidPlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => useContext(PlanContext);