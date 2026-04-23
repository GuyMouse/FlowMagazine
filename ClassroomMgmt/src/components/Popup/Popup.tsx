import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ReactDOMServer from "react-dom/server";
import { useTranslation } from "react-i18next";
import "./Popup.scss";


const MySwal = withReactContent(Swal);

export type AlertIcon = "success" | "error" | "warning" | "info" | "question";

interface CustomAlertProps {
    title?: string;
    content: React.ReactNode;
    icon?: AlertIcon;
    confirmButtonText: string;
    cancelButtonText?: string;
    show: boolean;
    onCancel: () => void;
    onConfirm?: () => Promise<boolean>;
    onSuccessText?: string;
    onFailedText?: string;
    onSomethingWrongText?: string;
}

export const popupContentDefult = {
    message: "",
};

const Popup: React.FC<CustomAlertProps> = ({
    title,
    content,
    icon,
    confirmButtonText,
    cancelButtonText,
    show,
    onCancel,
    onConfirm,
    onSuccessText,
    onFailedText,
    onSomethingWrongText,
}) => {
    const { t } = useTranslation();
    const successText = onSuccessText || t("alerts.success");
    const failedText = onFailedText || t("alerts.failed");
    const somethingWrongText =
        onSomethingWrongText || t("alerts.something_went_wrong");

    React.useEffect(() => {
        if (show) {
            MySwal.fire({
                title: title && <strong>{title}</strong>,
                html: ReactDOMServer.renderToString(content as React.ReactElement),
                icon,
                confirmButtonText,
                cancelButtonText,
                showCancelButton: !!cancelButtonText,
                customClass: {
                    confirmButton: "button primary",
                    cancelButton: "button secondary",
                },
                allowOutsideClick: true,
                heightAuto: false,
            }).then(async (result) => {
                if (result.isConfirmed && onConfirm) {
                    try {
                        const isSuccess = await onConfirm();

                        if (isSuccess) {
                            MySwal.fire({
                                text: successText,
                            });
                        } else {
                            MySwal.fire({
                                text: failedText,
                            });
                        }
                    } catch (error) {
                        MySwal.fire({
                            text: somethingWrongText,
                        });
                    }
                } else if (result.dismiss === Swal.DismissReason.backdrop || result.dismiss === Swal.DismissReason.cancel) {
                    onCancel();
                }
            });
        }
    }, [
        show,
        title,
        content,
        icon,
        confirmButtonText,
        onCancel,
        onConfirm,
        cancelButtonText,
        failedText,
        somethingWrongText,
        successText,
    ]);

    return null;
};

export default Popup;
