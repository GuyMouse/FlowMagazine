import React, { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import "./TextField.scss";

// Define the extended props that work for both input and select
interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  options?: { value: string; label: string }[]; // Options for dropdown
  onEnter?: () => void; // Callback when Enter is pressed
  icon?: string; // SVG or icon
  name?: string; // Name for input - important for accessibility
  disabled?:boolean;
}

// If options are provided, props should match select attributes
type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange">;

const TextField: React.FC<TextFieldProps & SelectProps> = ({
  label,
  options,
  onEnter, // Destructure the onEnter prop
  icon,
  name,
  ...props
}) => {
  // Handle key down to detect Enter press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) {
      onEnter(); // Trigger the onEnter callback when Enter is pressed
    }
  };

  return (
    <div className="text-field">
      {label && <label className="text-field__label" htmlFor={name}>{label}</label>}
      {icon && <div className="text-field__icon"><img src={icon} alt="Input Icon" /></div>}
      {options ? (
        // Render dropdown if options are provided, apply select-specific props
        <select className="text-field__input" {...(props as SelectProps)}
       
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} >
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        // Otherwise, render the input and apply input-specific props
        < input
          className="text-field__input"
          id={name}
          name={name}
          type="text"
         
          onKeyDown={handleKeyDown} // Attach keydown handler
          {...props}
        />
      )}
    </div>
  );
};

export default TextField;
