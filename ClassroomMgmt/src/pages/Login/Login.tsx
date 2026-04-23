import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import AppLogo from "../../assets/logos/AppLogo.png";
import { TextField, Button, Popup } from "components";
import "./Login.scss";
import { useLogin } from "hooks/Login.hook";
import Person from "../../assets/icons/Person.svg";
import Lock from "../../assets/icons/Lock.svg";
import CopyRights from '../../components/CopyRights/CopyRights';


interface LoginProps extends React.HTMLAttributes<HTMLDivElement> { }

const Login: React.FC<LoginProps> = ({ }) => {
    const [isHintVisiable, setIsHintVisible] = useState(false);
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [failedLoginMessage, setFailedLoginMessage] = useState<string | null>(
        null,
    );

    const { t } = useTranslation();
    const { logIn } = useLogin();
    const hintRef = useRef<HTMLDivElement | null>(null);

    const handleLogIn = () => {
        const loggedIn = logIn(userName, password);
        if (!loggedIn) {
            setTimeout(() => {
                setFailedLoginMessage(t(`login.one_incorrect`));
            }, 100);
        }
    };

    return (
        <div className="login-page">
            <div className="login-page--wrapper">
                <div className="login-page--container">
                    <div className="login-header">
                        <div className="logo-wrapper">
                            <img className="logo" src={AppLogo} />
                            <h1>Flow TMS</h1>
                        </div>
                        <h2>ניהול הדרכה</h2>
                    </div>
                    <div className="login-fields">
                        <div className="text-fields">
                            <div className="text-field-wrapper">
                                <TextField icon={Person} name="login_user_name" label={t(`login.user_name`)} value={userName} onChange={(e) => {
                                    setUserName(e.target.value);
                                    if (failedLoginMessage) setFailedLoginMessage(null);
                                }} />
                            </div>
                            <div className="text-field-wrapper">
                                <TextField icon={Lock} type="password" name="login_password" label={t(`login.password`)} value={password} onChange={(e) => setPassword(e.target.value)} onEnter={handleLogIn} />
                            </div>
                        </div>
                        <div className="login-help">
                            <div className="forgot-password" onClick={() => setIsHintVisible(!isHintVisiable)} ref={hintRef} style={isHintVisiable ? { textDecoration: "underline" } : {}}>
                                {t(`login.forgot_password`)}
                            </div>
                            {isHintVisiable && (
                                <div className="forgot-hint">{t(`login.password_hint`)}</div>
                            )}
                        </div>
                    </div>
                    <div className="buttons-wrapper">
                        <Button onClick={handleLogIn} children={t(`login.login`)} variant="action" />
                    </div>
                    <Popup content={failedLoginMessage} confirmButtonText={t("login.close")} show={failedLoginMessage !== null} onCancel={() => setFailedLoginMessage(null)} />
                    <CopyRights />
                </div>
            </div>
        </div>
    );
};
export default Login;
