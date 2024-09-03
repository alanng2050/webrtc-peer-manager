export declare const getChunkSize: (connection: RTCPeerConnection) => number;
export declare const sendFile: ({ file, channel, chunkSize, onPercent, }: {
    file: File;
    channel: RTCDataChannel;
    chunkSize?: number | undefined;
    onPercent?: ((percent: number) => void) | undefined;
}) => void;
export declare const receiveFile: ({ channel, filesize, onPercent, onComplete, }: {
    channel: RTCDataChannel;
    filesize: number;
    onPercent?: ((percent: number) => void) | undefined;
    onComplete?: ((data: Blob) => void) | undefined;
}) => void;
