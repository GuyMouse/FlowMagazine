import React from "react";
import Papa from "papaparse";
import { ReactComponent as UploadSrc } from "assets/icons/Upload.svg";

import { Button } from "components";

interface CsvToJsonProps extends React.HTMLAttributes<HTMLDivElement> {
  onDataUpload: (parsedData: object[]) => void;
  dataModel: object;
}

const CsvToJson: React.FC<CsvToJsonProps> = ({ onDataUpload, dataModel }) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data as (typeof dataModel)[];
        onDataUpload(parsedData);
      },
    });
  };

  return (
    <Button
      onClick={handleButtonClick}
      variant="secondary"
      startIcon={<UploadSrc />}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      Upload csv
    </Button>
  );
};

export default CsvToJson;
