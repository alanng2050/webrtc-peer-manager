import { User, Signaler } from './types';
export declare class Peer {
    private _connection;
    receiver: User;
    user: User;
    signaler: Signaler;
    makingOffer: boolean;
    rtcConifg?: RTCConfiguration;
    candidates: RTCIceCandidateInit[];
    isOfferor: boolean;
    constructor({ signaler, rtcConfig, user, receiver, desc, }: {
        signaler: Signaler;
        rtcConfig?: RTCConfiguration;
        user: User;
        receiver: User;
        desc?: RTCSessionDescriptionInit;
    });
    get connection(): RTCPeerConnection;
    _onnegotiationneeded: () => Promise<void>;
    _onicecandidate: ({ candidate }: RTCPeerConnectionIceEvent) => Promise<void>;
    _checkIgnoreOffer(): boolean;
    _acceptNewOffer(desc: RTCSessionDescriptionInit): Promise<void>;
    _handleCandidates(): Promise<void>;
    _sendOffer(): void;
    addCandidate(candidate: RTCIceCandidateInit): void;
    remove(): Promise<void>;
    handleAnswer(desc: RTCSessionDescriptionInit): Promise<void>;
}
