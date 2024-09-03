export type User = {
    priority: number;
    id: string;
    name?: string;
};
export type SignalData = {
    to: string;
    from: User;
    desc?: RTCSessionDescriptionInit | null;
    candidate?: RTCIceCandidateInit | null;
};
export type Signaler = {
    send: (data: SignalData) => void;
};
