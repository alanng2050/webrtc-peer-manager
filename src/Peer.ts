import { User, Signaler } from './types'

export class Peer {
  private _connection: RTCPeerConnection
  receiver: User
  user: User
  signaler: Signaler
  makingOffer = false
  rtcConifg?: RTCConfiguration
  candidates: RTCIceCandidateInit[] = []
  isOfferor = false

  constructor({
    signaler,
    rtcConfig,
    user,
    receiver,
    desc,
  }: {
    signaler: Signaler
    rtcConfig?: RTCConfiguration
    user: User
    receiver: User
    desc?: RTCSessionDescriptionInit
  }) {
    this.signaler = signaler
    this.rtcConifg = rtcConfig
    this.user = user
    this.receiver = receiver
    this._connection = new RTCPeerConnection(this.rtcConifg)
    if (desc) {
      this.isOfferor = false
      this._acceptNewOffer(desc)
    } else {
      this.isOfferor = true
      this._sendOffer()
    }
  }

  get connection() {
    return this._connection
  }

  // this will trigger when you create data channel or stream
  _onnegotiationneeded = async () => {
    try {
      this.makingOffer = true
      await this._connection!.setLocalDescription()
      this.signaler.send({
        to: this.receiver?.id,
        from: this.user,
        desc: this._connection!.localDescription,
      })
      console.log('sent offer to', this.receiver)
    } catch (ex) {
      console.error(ex)
    }
  }

  _onicecandidate = async ({ candidate }: RTCPeerConnectionIceEvent) => {
    if (candidate) {
      this.signaler.send({
        to: this.receiver?.id,
        from: this.user,
        candidate,
      })
      console.log('sent candidate')
    }
  }

  _checkIgnoreOffer() {
    const polite = this.user.priority < this.receiver.priority
    const signalingState = this._connection?.signalingState
    const offerCollision =
      this.makingOffer || (signalingState && signalingState !== 'stable')

    if (offerCollision && !polite) {
      console.log('ignored offer. Reason: offer collision')
      return true
    }

    return false
  }

  //
  async _acceptNewOffer(desc: RTCSessionDescriptionInit) {
    const ignoreOffer = this._checkIgnoreOffer()
    console.log(ignoreOffer)
    if (ignoreOffer) {
      return
    }

    await this._connection.setRemoteDescription(desc)
    await this._connection.setLocalDescription()
    console.log('accepted offer')

    this._connection.addEventListener('icecandidate', this._onicecandidate)
    // this._connection.addEventListener('datachannel', this._ondatachannel)

    this.signaler.send({
      to: this.receiver.id,
      from: this.user,
      desc: this._connection.localDescription,
    })
    console.log('sent answer')
  }

  async _handleCandidates() {
    if (this._connection?.remoteDescription) {
      for (let i = 0; i < this.candidates.length; i++) {
        await this._connection?.addIceCandidate(this.candidates[i])
        this.candidates.splice(i, 1)
      }
    }
  }

  /**
   * send offer to a new peer
   */
  _sendOffer() {
    this._connection.addEventListener(
      'negotiationneeded',
      this._onnegotiationneeded
    )
    this._connection.addEventListener('icecandidate', this._onicecandidate)
  }

  // =============== PUBLIC METHODS ======================

  addCandidate(candidate: RTCIceCandidateInit) {
    this.candidates.push(candidate)
    this._handleCandidates()
  }

  async remove() {
    this._connection.removeEventListener(
      'negotiationneeded',
      this._onnegotiationneeded
    )
    this._connection.removeEventListener('icecandidate', this._onicecandidate)
    this._connection.close()
  }

  async handleAnswer(desc: RTCSessionDescriptionInit) {
    if (!this._connection) throw new Error('Missing connection')
    await this._connection.setRemoteDescription(desc)
    console.log('accepted answer')
  }
}
