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
exports.Peer = void 0;
class Peer {
    constructor({ signaler, rtcConfig, user, receiver, desc, }) {
        this.makingOffer = false;
        this.candidates = [];
        this.isOfferor = false;
        this._onnegotiationneeded = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                this.makingOffer = true;
                yield this._connection.setLocalDescription();
                this.signaler.send({
                    to: (_a = this.receiver) === null || _a === void 0 ? void 0 : _a.id,
                    from: this.user,
                    desc: this._connection.localDescription,
                });
                console.log('sent offer to', this.receiver);
            }
            catch (ex) {
                console.error(ex);
            }
        });
        this._onicecandidate = ({ candidate }) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            if (candidate) {
                this.signaler.send({
                    to: (_b = this.receiver) === null || _b === void 0 ? void 0 : _b.id,
                    from: this.user,
                    candidate,
                });
                console.log('sent candidate');
            }
        });
        this.signaler = signaler;
        this.rtcConifg = rtcConfig;
        this.user = user;
        this.receiver = receiver;
        this._connection = new RTCPeerConnection(this.rtcConifg);
        if (desc) {
            this.isOfferor = false;
            this._acceptNewOffer(desc);
        }
        else {
            this.isOfferor = true;
            this._sendOffer();
        }
    }
    get connection() {
        return this._connection;
    }
    _checkIgnoreOffer() {
        var _a;
        const polite = this.user.priority < this.receiver.priority;
        const signalingState = (_a = this._connection) === null || _a === void 0 ? void 0 : _a.signalingState;
        const offerCollision = this.makingOffer || (signalingState && signalingState !== 'stable');
        if (offerCollision && !polite) {
            console.log('ignored offer. Reason: offer collision');
            return true;
        }
        return false;
    }
    _acceptNewOffer(desc) {
        return __awaiter(this, void 0, void 0, function* () {
            const ignoreOffer = this._checkIgnoreOffer();
            console.log(ignoreOffer);
            if (ignoreOffer) {
                return;
            }
            yield this._connection.setRemoteDescription(desc);
            yield this._connection.setLocalDescription();
            console.log('accepted offer');
            this._connection.addEventListener('icecandidate', this._onicecandidate);
            this.signaler.send({
                to: this.receiver.id,
                from: this.user,
                desc: this._connection.localDescription,
            });
            console.log('sent answer');
        });
    }
    _handleCandidates() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this._connection) === null || _a === void 0 ? void 0 : _a.remoteDescription) {
                for (let i = 0; i < this.candidates.length; i++) {
                    yield ((_b = this._connection) === null || _b === void 0 ? void 0 : _b.addIceCandidate(this.candidates[i]));
                    this.candidates.splice(i, 1);
                }
            }
        });
    }
    _sendOffer() {
        this._connection.addEventListener('negotiationneeded', this._onnegotiationneeded);
        this._connection.addEventListener('icecandidate', this._onicecandidate);
    }
    addCandidate(candidate) {
        this.candidates.push(candidate);
        this._handleCandidates();
    }
    remove() {
        return __awaiter(this, void 0, void 0, function* () {
            this._connection.removeEventListener('negotiationneeded', this._onnegotiationneeded);
            this._connection.removeEventListener('icecandidate', this._onicecandidate);
            this._connection.close();
        });
    }
    handleAnswer(desc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._connection)
                throw new Error('Missing connection');
            yield this._connection.setRemoteDescription(desc);
            console.log('accepted answer');
        });
    }
}
exports.Peer = Peer;
