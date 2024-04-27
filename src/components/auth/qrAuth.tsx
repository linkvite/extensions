import { useTheme } from "~hooks";
import { QRCodeSVG } from "qrcode.react";
import { Colors } from "~utils/styles";
import type { AuthResponse } from "~types";
import { Spinner } from "~components/spinner";
import { API_DOMAIN, QR_LOGO_URL, WS_ENDPOINT, parseQRAuth } from "~utils";
import { type OnLogin } from "~components/wrapper/auth";
import { useState, useCallback, useRef } from "react";
import { Centrifuge, type ServerPublicationContext } from 'centrifuge';
import {
    AlreadyRegistered,
    AuthQrContainer,
    QRAuthImage,
    QRContainer,
    QRSubTitle,
} from './styles';
import { persistAuthData } from "~utils/storage";
import toast from "react-hot-toast";
import { useEffectOnce } from "@legendapp/state/react";
import { AppText } from "~components/text";

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

    const ws = useRef<Centrifuge | null>(null);

    const [qr, setQR] = useState({
        code: "",
        loading: true,
        error: null as string | null,
        owner: null as QROwner | null,
    });

    const stopLoading = useCallback(() => {
        setTimeout(() => {
            setQR(prev => ({ ...prev, loading: false }));
        }, 1000);
    }, []);

    async function closeSession() {
        const { id } = parseQRAuth(qr.code);
        (async () => {
            if (id) {
                ws.current?.publish(`#${id}`, { event: "qr:session:canceled" });
            }
        })()
            .finally(() => {
                setQR(prev => ({ ...prev, owner: null }));
                ws.current?.disconnect();
                ws.current = null;
            })
    }

    function processEvent(ctx: ServerPublicationContext) {
        const data = ctx?.data?.data;
        const event = ctx?.data?.event as string;

        if (!event) {
            toast.error("Missing event");
            return;
        }

        if (event === "qr:session:closed") {
            toast.error("QR session closed by the other device.");
            setQR(prev => ({ ...prev, owner: null }));
            restartSession();
        }

        if (event === "qr:session:validated") {
            if (!data) {
                toast.error("Failed to validate QR code.");
                return;
            }
            setQR(prev => ({ ...prev, owner: data }));
        }

        if (event === "qr:session:accepted") {
            const response = data as AuthResponse;
            if (!response) {
                toast.error("Failed to log in.");
                return;
            }

            const { refreshToken, user } = response;
            persistAuthData(response);
            onLogin(user, refreshToken);
            toast.success("Logged in successfully.");
        }
    }

    async function init() {
        setQR(prev => ({ ...prev, loading: true }));

        const res = await fetch(`${API_DOMAIN}/qr-auth/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const resp = await res.json() as { ok: boolean; error: string; };
            setQR(prev => ({
                ...prev,
                code: "",
                error: resp?.error ?? "Failed to get QR code."
            }));
            stopLoading();
            return;
        }

        const data = await res.json() as { data: { token: string; endpoint: string; } };
        const token = data.data.token;
        if (!token) {
            stopLoading();
            setQR(prev => ({ ...prev, error: "Failed to get QR code." }));
            return;
        }

        setQR(prev => ({ ...prev, code: data.data.endpoint }));
        stopLoading();

        if (!ws.current) {
            ws.current = new Centrifuge([{
                transport: 'websocket',
                endpoint: WS_ENDPOINT,
            }], { token });

            ws.current
                .on("publication", processEvent)
                .connect();
        }
    }

    async function restartSession() {
        setQR(prev => ({ ...prev, loading: true }));
        closeSession();

        await init();
    }

    useEffectOnce(() => {
        init();

        return () => {
            ws.current?.disconnect();
            closeSession();
        }
    });

    useEffectOnce(() => {
        const FIVE_MINUTES = 5 * 60 * 1000;
        const interval = setInterval(() => {
            restartSession();
        }, FIVE_MINUTES)

        return () => {
            clearInterval(interval);
        }
    });

    return (
        <AuthQrContainer>
            <QRContainer $qr={!qr.loading && !qr.owner}>
                {qr.loading
                    ? <Spinner size={25} color={spinnerColor} />
                    : qr.owner
                        ? <QRAuthImage
                            src={qr.owner.avatar}
                            alt="qr-avatar"
                        />
                        : qr.code ? <AuthQrCode qrCode={qr.code} />
                            : <AppText color="dark" textAlign='center' isSubText>
                                Oh no! Could not load QR code {":("}
                            </AppText>
                }
            </QRContainer>

            <QRSubTitle isSubText>
                {qr.owner ? `Trying to login as @${qr.owner.username}?`
                    : qr.loading ? "Trying to get a QR code, please wait..."
                        : qr.code ? `Scan this code with the Linkvite Mobile App to log in.`
                            : qr.error ? qr.error
                                : "Ran into an issue loading the QR code. Please refresh the page to try again."
                }
            </QRSubTitle>

            {qr.owner
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