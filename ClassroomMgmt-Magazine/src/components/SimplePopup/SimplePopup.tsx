import React from "react";
import "./SimplePopup.scss";
import Button from "../Button/Button";
import { ReactComponent as TrashIcon } from "assets/icons/Trash.svg";


interface SimplePopupProps {
    show: boolean;
    message: string;
    onClose: () => void;
    type?: "info" | "error" | "warning" | "success";
}

export const SimplePopup: React.FC<SimplePopupProps> = ({
    show,
    message,
    onClose,
    type = "info"
}) => {
    if (!show) return null;

    return (
        <div className="simple-popup-overlay" onClick={onClose}>
            <div className={`simple-popup simple-popup--${type}`} onClick={(e) => e.stopPropagation()}>
                <div className="simple-popup__content">
                    <p>{message}</p>
                </div>
                <div className="simple-popup__actions">
                    <button className="simple-popup__button" onClick={onClose}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

// interface SimpleInputPopupProps {
//     show: boolean;
//     title: string;
//     placeholder?: string;
//     onConfirm: (value: string) => void;
//     onCancel: () => void;
// }

// export const SimpleInputPopup: React.FC<SimpleInputPopupProps> = ({
//     show,
//     title,
//     placeholder = "",
//     onConfirm,
//     onCancel
// }) => {
//     const [inputValue, setInputValue] = React.useState("");

//     React.useEffect(() => {
//         if (show) {
//             setInputValue("");
//         }
//     }, [show]);

//     if (!show) return null;

//     const handleConfirm = () => {
//         if (inputValue.trim()) {
//             onConfirm(inputValue.trim());
//         }
//     };

//     const handleKeyPress = (e: React.KeyboardEvent) => {
//         if (e.key === "Enter") {
//             handleConfirm();
//         } else if (e.key === "Escape") {
//             onCancel();
//         }
//     };

//     return (
//         <div className="simple-popup-overlay" onClick={onCancel}>
//             <div className="simple-popup simple-popup--input" onClick={(e) => e.stopPropagation()}>
//                 <div className="simple-popup__content">
//                     <h3 className="simple-popup__title">{title}</h3>
//                     <input
//                         className="simple-popup__input"
//                         type="text"
//                         value={inputValue}
//                         onChange={(e) => setInputValue(e.target.value)}
//                         onKeyDown={handleKeyPress}
//                         placeholder={placeholder}
//                         autoFocus
//                     />
//                 </div>
//                 <div className="simple-popup__actions">
//                     <button className="simple-popup__button simple-popup__button--secondary" onClick={onCancel}>
//                         ביטול
//                     </button>
//                     <button className="simple-popup__button" onClick={handleConfirm} disabled={!inputValue.trim()}>
//                         אישור
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

interface SimpleConfirmPopupProps {
    show: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: "info" | "error" | "warning" | "success";
}

export const SimpleConfirmPopup: React.FC<SimpleConfirmPopupProps> = ({
    show,
    message,
    onConfirm,
    onCancel,
    confirmText = "אישור",
    cancelText = "ביטול",
    type = "warning"
}) => {
    if (!show) return null;

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onCancel();
        }
    };

    return (
        <div className="simple-popup-overlay" onClick={onCancel} onKeyDown={handleKeyPress}>
            <div className={`simple-popup simple-popup--${type} simple-popup--confirm`} onClick={(e) => e.stopPropagation()}>
                <div className="simple-popup__content">
                    <p>{message}</p>
                </div>
                <div className="simple-popup__actions">
                    <button className="simple-popup__button simple-popup__button--secondary" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="simple-popup__button" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface DeletePopupProp {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    contents: string[];
    message?: string;
}

export const DeletePopup: React.FC<DeletePopupProp> = ({
    show,
    onConfirm,
    onCancel,
    contents,
}) => {
    if (!show) return null;
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onCancel();
        }
    };

    return (

        <div className="delete-popup-overlay" onClick={onCancel} onKeyDown={handleKeyPress}>
            <div className="delete-popup" onClick={(e) => e.stopPropagation()} >
                <div className="delete-popup--head">
                    <div className="head-delete-icon">
                        <TrashIcon className="trashicon" />
                    </div>

                    <div className="head-text">
                        <span className="head-text--title">{`מחיקת ${contents[0]}`}</span>
                        <span className="simple-text">תאבד לצמיתות את התכנים הבאים:</span>
                    </div>

                </div>
                <div className="delete-popup--content">

                    {contents.map((content, index) => {
                        return <span key={index} className="simple-text">{`- ${content}`}</span>;
                    })}
                </div>
                <div className="delete-popup--actions">
                    <Button
                        variant="secondary"
                        onClick={() => { onCancel() }}
                    >
                        <span>בטל</span>
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => { onConfirm() }}

                    >
                        <span>מחק</span>
                    </Button>
                </div>
            </div>
        </div>
    )



};
