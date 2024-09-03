import { Peer } from './Peer';
import { Signaler, User } from './types';
export declare class PeerManager {
    peers: Peer[];
    _user: User;
    constructor(user: User);
    removePeer(receiverId: string): void;
    onmessage({ data: { candidate, desc, from, isNew }, signaler, rtcConfig, onNewPeer, }: {
        data: {
            candidate?: RTCIceCandidateInit;
            desc?: RTCSessionDescriptionInit;
            from: User;
            isNew: boolean;
        };
        signaler: Signaler;
        rtcConfig?: RTCConfiguration;
        onNewPeer?: () => void;
    }): Promise<void>;
}
