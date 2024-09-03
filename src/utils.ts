const DEFAULT_CHUNK_SIZE = 64 * 1024

export const getChunkSize = (connection: RTCPeerConnection) => {
  const maxMessageSize =
    connection.sctp?.maxMessageSize ||
    parseInt(
      connection.remoteDescription?.sdp.split('max-message-size:')[1] || '0'
    )
  const chunkSize = maxMessageSize
    ? Math.floor((maxMessageSize * 2) / 3)
    : DEFAULT_CHUNK_SIZE
  return chunkSize
}

export const sendFile = ({
  file,
  channel,
  chunkSize = DEFAULT_CHUNK_SIZE,
  onPercent,
}: {
  file: File
  channel: RTCDataChannel
  chunkSize?: number
  onPercent?: (percent: number) => void
}) => {
  let totalSent = 0
  const fileSize = file.size
  let from = 0
  let to = 0
  const end = fileSize

  const sendBytes = async () => {
    if (from >= end) {
      channel.send('1')
      return
    }

    if (channel.bufferedAmount > channel.bufferedAmountLowThreshold) {
      const onbufferedamountlow = () => {
        channel.removeEventListener('bufferedamountlow', onbufferedamountlow)
        sendBytes()
      }
      channel.addEventListener('bufferedamountlow', onbufferedamountlow)
      return
    }

    to = Math.min(from + chunkSize, end)

    const bytes = await file.slice(from, to).arrayBuffer()
    from = to

    channel.send(bytes)
    totalSent += bytes.byteLength
    const percent = (totalSent / fileSize) * 100
    onPercent?.(percent)
    setTimeout(sendBytes, 0)
  }

  sendBytes()
}

export const receiveFile = ({
  channel,
  filesize,
  onPercent,
  onComplete,
}: {
  channel: RTCDataChannel
  filesize: number
  onPercent?: (percent: number) => void
  onComplete?: (data: Blob) => void
}) => {
  let total = 0
  const receivedBytes: ArrayBuffer[] = []

  const onmessage = (evt: MessageEvent) => {
    receivedBytes.push(evt.data)
    total += evt.data.byteLength

    const percent = (total / filesize) * 100
    onPercent?.(percent)
    // dispatch.channel.updatePercent({ fileId: processingFile.id, percent })
    if (total === filesize) {
      onComplete?.(new Blob(receivedBytes))
      channel.close()
      channel.onmessage = null
    }
  }

  channel.onmessage = onmessage
}
