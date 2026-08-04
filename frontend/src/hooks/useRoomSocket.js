import { useEffect, useRef, useCallback } from 'react'
import { useSocket } from '../context/SocketContext'

// Thin wrapper around the app's single shared socket (from SocketContext)
// scoped to one room code. Deliberately not a React Context of its own —
// room state is only relevant to the lobby/play/result pages, not the whole
// app, so a hook used per-page is simpler than a provider that would need
// to be mounted/unmounted around route changes.
export default function useRoomSocket(code, handlers = {}) {
  const { socket, connected } = useSocket()
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!socket || !code) return

    socket.emit('room:join', { code })

    const bindings = {
      'room:state': (p) => handlersRef.current.onState?.(p),
      'room:status': (p) => handlersRef.current.onStatus?.(p),
      'room:participant_count': (p) => handlersRef.current.onParticipantCount?.(p),
      'room:participant_ready': (p) => handlersRef.current.onParticipantReady?.(p),
      'room:participant_removed': (p) => handlersRef.current.onParticipantRemoved?.(p),
      'room:lock_changed': (p) => handlersRef.current.onLockChanged?.(p),
      'room:announcement': (p) => handlersRef.current.onAnnouncement?.(p),
      'room:question': (p) => handlersRef.current.onQuestion?.(p),
      'room:question:ended': (p) => handlersRef.current.onQuestionEnded?.(p),
      'room:answer:result': (p) => handlersRef.current.onAnswerResult?.(p),
      'room:leaderboard_update': (p) => handlersRef.current.onLeaderboard?.(p),
      'room:ended': (p) => handlersRef.current.onEnded?.(p),
      'room:error': (p) => handlersRef.current.onError?.(p),
    }

    Object.entries(bindings).forEach(([event, fn]) => socket.on(event, fn))
    return () => {
      Object.entries(bindings).forEach(([event, fn]) => socket.off(event, fn))
      socket.emit('room:leave', { code })
    }
  }, [socket, code])

  const start = useCallback(() => socket?.emit('room:start', { code }), [socket, code])
  const pause = useCallback(() => socket?.emit('room:pause', { code }), [socket, code])
  const resume = useCallback(() => socket?.emit('room:resume', { code }), [socket, code])
  const end = useCallback(() => socket?.emit('room:end', { code }), [socket, code])
  const lock = useCallback((locked) => socket?.emit('room:lock', { code, locked }), [socket, code])
  const kick = useCallback((userId) => socket?.emit('room:kick', { code, userId }), [socket, code])
  const setReady = useCallback((ready) => socket?.emit('room:ready', { code, ready }), [socket, code])
  const announce = useCallback((message) => socket?.emit('room:announcement', { code, message }), [socket, code])
  const submitAnswer = useCallback((questionId, chosenIndex) =>
    socket?.emit('room:answer:submit', { code, questionId, chosenIndex }), [socket, code])

  return { connected, start, pause, resume, end, lock, kick, setReady, announce, submitAnswer }
}
