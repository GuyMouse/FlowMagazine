import React from "react";
import "./Button.scss";
import classnames from "classnames";

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "danger" | "action";
  onClick: () => unknown;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  bold?: boolean;
  disabled?: boolean;
  iconClassname?: string;
  customClass?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  onClick,
  startIcon,
  endIcon,
  iconClassname,
  bold,
  customClass = "button",
  disabled,
}) => {
  return (
    <button
      className={classnames(customClass, variant, { bold, disabled })}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {startIcon && (
        startIcon
        
      )}
      {children}
      {endIcon && (
        endIcon
        
      )}
    </button>
  );
};

export default Button;
