import React, { useState } from "react";
import "./BaseGrid.scss";
import Button from "../Button/Button";
import { ReactComponent as TwoArrowsIcon } from "../../assets/icons/twoarrows.svg";
import { ReactComponent as AddCircleIcon } from "../../assets/icons/Add_Circle.svg";

// --- Types ---
type Column<T> = {
  head: string;
  key?: keyof T | "actions";
  render?: (row: T) => React.ReactNode;
  options?: { label: string; value: string }[];
  editable?: boolean;
};

interface BaseGridProps<T> {
  columns: Column<T>[];
  data: T[];
  isClickable?: boolean;
  onRowClick?: (row: T) => void;
  showSortIcon?: boolean;
  hasAddableRow?: boolean;
  handleOnChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSaveAdd?: () => void;
  onClear?: () => void;
}

const BaseGrid = <T,>({
  data,
  columns,
  isClickable = false,
  onRowClick,
  showSortIcon,
  hasAddableRow,
  handleOnChange,
  onSaveAdd = () => {},
  onClear,
}: BaseGridProps<T>) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  return (
    <ul
      className="base-grid"
      style={{ "--cols": columns.length } as React.CSSProperties}
    >
      {/* 1. Header Row - Aligned grid */}
      <li className="base-grid--head">
        {columns.map((col, index) => (
          <div className="head-item" key={`header-${index}`}>
            <span className="head-text">{col.head}</span>
            {showSortIcon && <TwoArrowsIcon />}
          </div>
        ))}
      </li>

      {/* 2. Addable Row - For creating new entries */}
      {hasAddableRow && (
        <li className="base-row add-row">
          {columns.map((col, index) => (
            <div className="base-row--item" key={`add-col-${index}`}>
              {col.key === "actions" ? (
                <div className="buttons-wrapper">
                  <Button variant="primary" onClick={onSaveAdd}>
                    <AddCircleIcon />
                    <span>הוסף</span>
                  </Button>
                  <button type="button" className="clear-btn" onClick={onClear}>
                    נקה
                  </button>
                </div>
              ) : col.editable === false ? (
                <span className="input-item disabled">N/A</span>
              ) : col.options ? (
                /* Select input for dropdown columns */
                <select
                  name={String(col.key)}
                  className="input-item"
                  onChange={handleOnChange}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select {col.head}
                  </option>
                  {col.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                /* Standard text input */
                <input
                  type="text"
                  name={String(col.key)}
                  className="input-item"
                  placeholder={col.head}
                  onChange={handleOnChange}
                />
              )}
            </div>
          ))}
        </li>
      )}

      {/* 3. Data Rows - Main content list */}
      {data.map((row, rowIndex) => (
        <li
          key={`row-${rowIndex}`}
          className={`base-row${isClickable ? " base-row--clickable" : ""} ${
            selectedRow === rowIndex ? "selected" : ""
          }`}
          {...(isClickable && {
            role: "button",
            tabIndex: 0,
            onClick: () => {
              onRowClick?.(row);
              setSelectedRow(rowIndex);
            },
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRowClick?.(row);
                setSelectedRow(rowIndex);
              }
            },
          })}
        >
          {columns.map((col, colIndex) => (
            <div
              className="base-row--item"
              key={`cell-${rowIndex}-${colIndex}`}
            >
              {col.render ? (
                col.render(row)
              ) : (
                <span className="item-text">
                  {String(row[col.key as keyof T] || "")}
                </span>
              )}
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
};

export default BaseGrid;
