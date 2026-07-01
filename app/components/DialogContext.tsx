"use client";

import {createContext, ReactNode, useContext, useState} from "react";

interface ConfirmState {
    message: string;
    resolve: (result: boolean) => void;
}

interface AlertState {
    message: string;
    resolve: () => void;
}

interface DialogContextValue {
    confirm: (message: string) => Promise<boolean>;
    alert: (message: string) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({children}: { children: ReactNode }) {
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const [alertState, setAlertState] = useState<AlertState | null>(null);

    const confirm = (message: string) =>
        new Promise<boolean>((resolve) => {
            setConfirmState({message, resolve});
        });

    const alert = (message: string) =>
        new Promise<void>((resolve) => {
            setAlertState({message, resolve});
        });

    const handleConfirmChoice = (result: boolean) => {
        confirmState?.resolve(result);
        setConfirmState(null);
    };

    const handleAlertClose = () => {
        alertState?.resolve();
        setAlertState(null);
    };

    return (
        <DialogContext.Provider value={{confirm, alert}}>
            {children}

            {confirmState && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#6E2A39]/40 px-3 backdrop-blur-sm sm:px-4">
                    <div className="w-full max-w-sm rounded-[1.25rem] border border-[#E5DED6] bg-[#F6F4F0] p-4 text-[#6E2A39] shadow-2xl sm:rounded-[2rem] sm:p-6">
                        <p className="text-sm sm:text-base">{confirmState.message}</p>

                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => handleConfirmChoice(false)}
                                className="w-full rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-5 py-2.5 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6] sm:w-auto"
                                style={{cursor: "pointer"}}
                            >
                                Скасувати
                            </button>

                            <button
                                type="button"
                                onClick={() => handleConfirmChoice(true)}
                                className="w-full rounded-full bg-[#6E2A39] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#F6F4F0] transition hover:bg-[#5b2230] sm:w-auto"
                                style={{cursor: "pointer"}}
                            >
                                Підтвердити
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {alertState && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#6E2A39]/40 px-3 backdrop-blur-sm sm:px-4">
                    <div className="w-full max-w-sm rounded-[1.25rem] border border-[#E5DED6] bg-[#F6F4F0] p-4 text-[#6E2A39] shadow-2xl sm:rounded-[2rem] sm:p-6">
                        <p className="text-sm sm:text-base">{alertState.message}</p>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={handleAlertClose}
                                className="w-full rounded-full bg-[#6E2A39] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#F6F4F0] transition hover:bg-[#5b2230] sm:w-auto"
                                style={{cursor: "pointer"}}
                            >
                                ОК
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
}

export function useDialog() {
    const context = useContext(DialogContext);

    if (!context) {
        throw new Error("useDialog must be used inside DialogProvider");
    }

    return context;
}
