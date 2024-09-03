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
exports.PeerManager = void 0;
const Peer_1 = require("./Peer");
class PeerManager {
    constructor(user) {
        this.peers = [];
        this._user = user;
    }
    removePeer(receiverId) {
        const index = this.peers.findIndex((item) => { var _a; return ((_a = item.receiver) === null || _a === void 0 ? void 0 : _a.id) === receiverId; });
        this.peers.splice(index, 1);
    }
    onmessage({ data: { candidate, desc, from, isNew }, signaler, rtcConfig, onNewPeer, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNew) {
                const newPeer = new Peer_1.Peer({
                    signaler,
                    rtcConfig,
                    user: this._user,
                    receiver: from,
                });
                this.peers.push(newPeer);
                onNewPeer === null || onNewPeer === void 0 ? void 0 : onNewPeer();
                return;
            }
            if ((desc === null || desc === void 0 ? void 0 : desc.type) === 'offer') {
                const newPeer = new Peer_1.Peer({
                    signaler,
                    rtcConfig,
                    user: this._user,
                    receiver: from,
                    desc,
                });
                this.peers.push(newPeer);
                onNewPeer === null || onNewPeer === void 0 ? void 0 : onNewPeer();
                return;
            }
            else if ((desc === null || desc === void 0 ? void 0 : desc.type) === 'answer') {
                const peer = this.peers.find((item) => { var _a; return ((_a = item.receiver) === null || _a === void 0 ? void 0 : _a.id) === from.id; });
                peer === null || peer === void 0 ? void 0 : peer.handleAnswer(desc);
                return;
            }
            if (candidate) {
                const peer = this.peers.find((item) => { var _a; return ((_a = item.receiver) === null || _a === void 0 ? void 0 : _a.id) === from.id; });
                peer === null || peer === void 0 ? void 0 : peer.addCandidate(candidate);
                return;
            }
        });
    }
}
exports.PeerManager = PeerManager;
