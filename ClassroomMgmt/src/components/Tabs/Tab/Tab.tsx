import React, { useState, useEffect } from "react";
import "./Tab.scss";

interface TabProps {
  title: string;
  customClass?: string;
  index: number;
  handleClick: (index: number) => void;
}

const Tab: React.FC<TabProps> = ({
  customClass,
  title,
  handleClick,
  index,
}) => {
  return (
    <button
      className={`tab-button ${customClass}`}
      onClick={() => handleClick(index)}
    >
      {title}
    </button>
  );
};

export default Tab;
