import React, { ReactElement } from "react";
import "./Table.scss";
import { useTranslation } from "react-i18next";
import TableRow from "./TableRow/TableRow";
import { Checkbox } from "@mui/material";

const CheckboxStyling = {
    padding: 0,
    'svg': { width: '2rem', height: '2rem' }
};

interface SimpleTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
    data?: T[];
    headers: (keyof T)[];
    customRow?: ReactElement;
    actionsCol?: boolean;
    isBorder?: boolean;
    maxHeight?: string;
    showCheckboxes?: boolean;

    onEdit?: (editRow: T, i: number) => void;
    onDelete?: (i: number) => void;
    onRerunTraining?: () => void;
}

const Table = <T,>({
    data,
    headers,
    customRow,
    actionsCol,
    isBorder = true,
    showCheckboxes = false,
    onEdit,
    onDelete,
    onRerunTraining,
}: SimpleTableProps<T>) => {
    const { t } = useTranslation();

    const [checkedRows, setCheckedRows] = React.useState<boolean[]>([]);

    React.useEffect(() => {
        if (showCheckboxes && data) {
            setCheckedRows(Array(data.length).fill(false));
        }
    }, [data, showCheckboxes]);

    const allChecked = checkedRows.length > 0 && checkedRows.every(Boolean);
    const someChecked = checkedRows.some(Boolean) && !allChecked;

    const selectAll = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setCheckedRows(Array(checkedRows.length).fill(checked));
    };

    const selectRow = (index: number, checked: boolean) => {
        setCheckedRows((prev) => {
            const updated = [...prev];
            updated[index] = checked;
            return updated;
        });
    };

    return (
        <div className="table-wrapper">
            <table className="table">
                <thead className="sticky-header">
                    <tr>
                        {showCheckboxes && (
                            <th>
                                <Checkbox
                                    indeterminate={someChecked}
                                    checked={allChecked}
                                    onChange={selectAll}
                                    sx={CheckboxStyling}
                                />
                            </th>
                        )}
                        {headers.map((header) => (
                            <th key={String(header)}>
                                {t(`course.students.${String(header).toLowerCase()}`)}
                            </th>
                        ))}
                        {actionsCol && <th>פעולות</th>}
                    </tr>
                </thead>

                <tbody>
                    {customRow || null}
                    {data?.map((rowData, index) => (
                        <tr key={index}>
                            {showCheckboxes && (
                                <td>
                                    <Checkbox
                                        checked={checkedRows[index] || false}
                                        onChange={(e, checked) => selectRow(index, checked)}
                                        sx={CheckboxStyling}
                                    />
                                </td>
                            )}
                            <TableRow
                                headers={headers}
                                index={index}
                                rowData={rowData}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onRerunTraining={onRerunTraining}
                            />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
