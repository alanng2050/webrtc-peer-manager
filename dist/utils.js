"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveFile = exports.sendFile = exports.getChunkSize = void 0;
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const getChunkSize = (connection) => {
    var _a, _b;
    const maxMessageSize = ((_a = connection.sctp) === null || _a === void 0 ? void 0 : _a.maxMessageSize) ||
        parseInt(((_b = connection.remoteDescription) === null || _b === void 0 ? void 0 : _b.sdp.split('max-message-size:')[1]) || '0');
    const chunkSize = maxMessageSize
        ? Math.floor((maxMessageSize * 2) / 3)
        : DEFAULT_CHUNK_SIZE;
    return chunkSize;
};
exports.getChunkSize = getChunkSize;
const sendFile = ({ file, channel, chunkSize = DEFAULT_CHUNK_SIZE, onPercent, }) => {
    let totalSent = 0;
    const fileSize = file.size;
    let from = 0;
    let to = 0;
    const end = fileSize;
    const sendBytes = () => __awaiter(void 0, void 0, void 0, function* () {
        if (from >= end) {
            channel.send('1');
            return;
        }
        if (channel.bufferedAmount > channel.bufferedAmountLowThreshold) {
            const onbufferedamountlow = () => {
                channel.removeEventListener('bufferedamountlow', onbufferedamountlow);
                sendBytes();
            };
            channel.addEventListener('bufferedamountlow', onbufferedamountlow);
            return;
        }
        to = Math.min(from + chunkSize, end);
        const bytes = yield file.slice(from, to).arrayBuffer();
        from = to;
        channel.send(bytes);
        totalSent += bytes.byteLength;
        const percent = (totalSent / fileSize) * 100;
        onPercent === null || onPercent === void 0 ? void 0 : onPercent(percent);
        setTimeout(sendBytes, 0);
    });
    sendBytes();
};
exports.sendFile = sendFile;
const receiveFile = ({ channel, filesize, onPercent, onComplete, }) => {
    let total = 0;
    const receivedBytes = [];
    const onmessage = (evt) => {
        receivedBytes.push(evt.data);
        total += evt.data.byteLength;
        const percent = (total / filesize) * 100;
        onPercent === null || onPercent === void 0 ? void 0 : onPercent(percent);
        if (total === filesize) {
            onComplete === null || onComplete === void 0 ? void 0 : onComplete(new Blob(receivedBytes));
            channel.close();
            channel.onmessage = null;
        }
    };
    channel.onmessage = onmessage;
};
exports.receiveFile = receiveFile;
