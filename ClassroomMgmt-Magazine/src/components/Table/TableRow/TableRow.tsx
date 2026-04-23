import React, { useState } from "react";
import { parseValue } from "helpers/data.helpers";
import Button from "../../Button/Button";
import TextField from "../../TextField/TextField";
// import EditPencilSvg from "assets/icons/EditPencil.svg";
// import CheckInCircleSvg from "assets/icons/CheckInCircle.svg";
// import TrashSvg from "assets/icons/Trash.svg";

// import RefreshIcon from "assets/icons/RefreshIcon.svg";
import { ReactComponent as CheckInCircleSvg } from "assets/icons/CheckInCircle.svg";
import { ReactComponent as EditPencilSvg } from "assets/icons/EditPencil.svg";
import { ReactComponent as TrashSvg } from "assets/icons/Trash.svg";
import { ReactComponent as RefreshIcon } from "assets/icons/RefreshIcon.svg";


import "../Table.scss";

interface TableRowProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  headers: (keyof T)[];
  rowData: T;
  onEdit?: (editRow: T, i: number) => void;
  onDelete?: (i: number) => void;
  onRerunTraining?: () => void;
}
const STATION_NUMBER = 12;
const stationOptions = Array.from({ length: STATION_NUMBER }, (v, i) => ({
  label: i.toString(),
  value: i.toString(),
}));

const TableRow = <T,>({
  index,
  headers,
  rowData,
  onEdit,
  onDelete,
  onRerunTraining,
}: TableRowProps<T>) => {
  const [editRowIndex, setEditRowIndex] = React.useState<number | null>(null);
  const [editRow, setEditRow] = React.useState<T | null>(null);

  const onEditRowChange = (key: keyof T, value: string) => {
    let tempCurrentEditRow = JSON.parse(JSON.stringify(editRow));
    tempCurrentEditRow[key] = value;
    setEditRow(tempCurrentEditRow);
  };
  const clearEdit = () => {
    setEditRowIndex(null);
    setEditRow(null);
  };

  const DeleteActionButton = () =>
    onDelete ? (
      <Button customClass="action-button refresh" startIcon={<TrashSvg />} onClick={() => onDelete(index)} />

      // <img
      //   alt=""
      //   src={TrashSvg}
      //   onClick={() => onDelete(index)}
      //   className={"action-button"}
      // />
    ) : null;

  const EditActionButton = () =>
    onEdit ? (
      <Button customClass="action-button refresh" startIcon={<TrashSvg />} onClick={() => { setEditRowIndex(index); setEditRow(rowData); }
      } />

      // <img
      //   alt=""
      //   className={"action-button"}
      //   src={EditPencilSvg}
      //   onClick={() => {
      //     setEditRowIndex(index);
      //     setEditRow(rowData);
      //   }}
      // />
    ) : null;

  const RerunActionButton = () =>
    onRerunTraining ? (
      <Button customClass="action-button refresh" startIcon={<RefreshIcon />} onClick={() => onRerunTraining()} />
      // <img
      //   alt=""
      //   src={RefreshIcon}
      //   onClick={() => onRerunTraining()}
      //   className={"action-button refresh"}
      // />
    ) : null;

  const SaveActionButton = () =>
    onEdit ? (
      <CheckInCircleSvg className="action-button" onClick={() => {
        if (editRow && editRowIndex !== null) {
          onEdit(editRow, editRowIndex);
          clearEdit();
        }
      }} />
      // <img
      //   alt=""
      //   className={"action-button"}
      //   src={<CheckInCircleSvg />}
      //   onClick={() => {
      //     if (editRow && editRowIndex !== null) {
      //       onEdit(editRow, editRowIndex);
      //       clearEdit();
      //     }
      //   }}
      // />
    ) : null;

  if (index === editRowIndex) {
    return (
      <>
        {headers.map((header) =>
          header === "station" ? (
            <td key={String(header)} className={"station"}>
              <TextField options={stationOptions} />
            </td>
          ) : (
            <td key={String(header)} className={"cell"}>
              <TextField
                value={parseValue((editRow as T)[header])}
                onChange={(e) => onEditRowChange(header, e.target.value)}
                style={{ width: 100 }}
              />
            </td>
          )
        )}
        {onEdit ? (
          <td className={"buttons"}>
            <DeleteActionButton />
            <SaveActionButton />
          </td>
        ) : null}
      </>
    );
  }
  return (
    <>
      {headers.map((header) =>
        header === "station" ? (
          <td key={String(header)} className={"station"}>
            <TextField options={stationOptions} style={{ width: "70%" }} />
          </td>
        ) : (
          <td key={String(header)} className={"cell"}>
            {parseValue(rowData[header])}
          </td>
        )
      )}
      <td className={"cell buttons"}>
        <DeleteActionButton />
        <EditActionButton />
        <RerunActionButton />
      </td>
    </>
  );
};

export default TableRow;
