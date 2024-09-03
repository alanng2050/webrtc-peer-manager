import { Peer } from './Peer'
import { Signaler, User } from './types'

export class PeerManager {
  peers: Peer[] = []
  _user: User
  constructor(user: User) {
    this._user = user
  }

  removePeer(receiverId: string) {
    const index = this.peers.findIndex(
      (item) => item.receiver?.id === receiverId
    )
    this.peers.splice(index, 1)
  }

  async onmessage({
    data: { candidate, desc, from, isNew },
    signaler,
    rtcConfig,
    onNewPeer,
  }: {
    data: {
      candidate?: RTCIceCandidateInit
      desc?: RTCSessionDescriptionInit
      from: User
      isNew: boolean
    }
    signaler: Signaler
    rtcConfig?: RTCConfiguration
    onNewPeer?: () => void
  }) {
    // new member join
    // send offer to new member
    if (isNew) {
      const newPeer = new Peer({
        signaler,
        rtcConfig,
        user: this._user,
        receiver: from,
      })
      this.peers.push(newPeer)
      onNewPeer?.()
      return
    }

    // receive offer from others
    if (desc?.type === 'offer') {
      const newPeer = new Peer({
        signaler,
        rtcConfig,
        user: this._user,
        receiver: from,
        desc,
      })

      this.peers.push(newPeer)
      onNewPeer?.()
      return
    } else if (desc?.type === 'answer') {
      const peer = this.peers.find((item) => item.receiver?.id === from.id)
      peer?.handleAnswer(desc)
      return
    }

    if (candidate) {
      const peer = this.peers.find((item) => item.receiver?.id === from.id)
      peer?.addCandidate(candidate)
      return
    }
  }
}
