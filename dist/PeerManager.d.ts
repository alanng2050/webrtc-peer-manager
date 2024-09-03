import { Peer, User } from './Peer';
export declare class PeerManager {
    peers: Peer[];
    _user: User;
    constructor(user: User);
    removePeer(receiverId: string): void;
    onmessage({ data: { candidate, desc, from, isNew }, sendMessage, rtcConfig, onNewPeer, }: {
        data: {
            candidate?: RTCIceCandidateInit;
            desc?: RTCSessionDescriptionInit;
            from: User;
            isNew: boolean;
        };
        sendMessage: (data: unknown) => void;
        rtcConfig?: RTCConfiguration;
        onNewPeer?: () => void;
    }): Promise<void>;
}
