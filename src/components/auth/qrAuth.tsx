import { useTheme } from "~hooks";
import { v4 as UUID } from 'uuid';
import { QRCodeSVG } from "qrcode.react";
import { Colors } from "~utils/styles";
import type { AuthResponse } from "~types";
import { Spinner } from "~components/spinner";
import useWebSocket from 'react-use-websocket';
import { QR_LOGO_URL, WS_DOMAIN } from "~utils";
import { type OnLogin } from "~components/wrapper/auth";
import { useState, useCallback, useEffect } from "react";
import {
    AlreadyRegistered,
    AuthQrContainer,
    QRAuthImage,
    QRContainer,
    QRSubTitle,
} from './styles';
import { persistAuthData } from "~utils/storage";

type QROwner = {
    avatar: string;
    username: string;
}

function AuthQrCode({ qrCode }: { qrCode: string }) {
    return (
        <QRCodeSVG
            size={300}
            value={qrCode}
            fgColor={Colors.dark}
            bgColor={Colors.light}
            imageSettings={{
                width: 45,
                height: 45,
                excavate: false,
                src: QR_LOGO_URL,
            }}
        />
    )
}

export function AuthWithQR({ onLogin }: { onLogin: OnLogin }) {
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';
    const spinnerColor = isDark ? Colors.light : Colors.dark;

    const [qrCode, setQrCode] = useState("");
    const [userID, setUserID] = useState(UUID());
    const [roomID, setRoomID] = useState(UUID());
    const [qrCodeLoading, setQrCodeLoading] = useState(true);
    const [owner, setOwner] = useState<QROwner | null>(null);

    const getMessage = useCallback((isRestart?: boolean) => {
        return {
            data: {},
            event: isRestart
                ? "restart:qr:session"
                : "start:qr:session",
        }
    }, []);

    const endpoint = `${WS_DOMAIN}/${roomID}/${userID}`;
    const { sendJsonMessage } = useWebSocket(endpoint, {
        onOpen: () => {
            sendJsonMessage(getMessage());
        },
        onMessage: (event) => {
            handleSocketMessage(event);
        }
    });

    const restartSession = useCallback(() => {
        setQrCodeLoading(true);
        setRoomID(UUID());
        setUserID(UUID());
        setOwner(null);

        const message = getMessage(true);
        return sendJsonMessage(message);
    }, [getMessage, sendJsonMessage]);

    const handleSocketMessage = useCallback(async (event: MessageEvent) => {
        if (!event?.data) return;
        const data = JSON.parse(event.data);

        if (data.event === "qr:session:started") {
            const endpoint = data?.data?.endpoint;
            if (!endpoint) return;

            setQrCode(data?.data?.endpoint);

            setTimeout(() => {
                setQrCodeLoading(false);
            }, 1000);
        }

        if (data.event === "qr:session:validated") {
            const owner = data?.data;
            if (!owner) return;

            setOwner(owner);
        }

        if (data.event === "qr:session:rejected") {
            restartSession();
        }

        if (data.event === "qr:session:accepted") {
            const response = data?.data as AuthResponse;
            if (!response) return;

            const { refreshToken, user } = response;
            await persistAuthData(response);
            onLogin(user, refreshToken);
        }
    }, [onLogin, restartSession]);

    useEffect(() => {
        // refresh the QR code every 5 minutes.
        const FIVE_MINUTES = 5 * 60 * 1000;
        const interval = setInterval(() => {
            restartSession();
        }, FIVE_MINUTES)

        return () => {
            clearInterval(interval);
        }
    }, [getMessage, sendJsonMessage, restartSession]);

    return (
        <AuthQrContainer>
            <QRContainer $qr={!qrCodeLoading && !owner}>
                {qrCodeLoading
                    ? <Spinner size={25} color={spinnerColor} />
                    : owner
                        ? <QRAuthImage
                            src={owner.avatar}
                            alt="qr-avatar"
                        />
                        : <AuthQrCode qrCode={qrCode} />
                }
            </QRContainer>

            <QRSubTitle $isSubText>
                {owner
                    ? `Trying to login as @${owner.username}?`
                    : `Scan this code with the Linkvite Mobile App to log in.`
                }
            </QRSubTitle>

            {owner
                ? <AlreadyRegistered
                    onClick={restartSession}
                >
                    Not you? start over
                </AlreadyRegistered>
                : null
            }
        </AuthQrContainer>
    )
}