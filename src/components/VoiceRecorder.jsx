import React, { useState, useEffect, useRef } from 'react';
import { apiPost } from '../utils/api';
import { playPop, playTick, playChime } from '../utils/audio';

export default function VoiceRecorder({ onTranscript, onClose, language = 'en' }) {
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [volumeLevels, setVolumeLevels] = useState([12, 18, 14, 22, 16, 12, 20]);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    let timerInterval = null;

    async function startRecording() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support audio recording.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Initialize AudioContext & Analyser for Live Wave Visualizer
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateWave = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);

            // Sample 7 frequency bands for the animated bars
            const step = Math.floor(bufferLength / 7);
            const nextLevels = [];
            for (let i = 0; i < 7; i++) {
              const val = dataArray[i * step] || 0;
              // Map 0-255 to 10px-42px height
              const height = Math.max(8, Math.min(42, Math.round((val / 255) * 42)));
              nextLevels.push(height);
            }
            setVolumeLevels(nextLevels);
            animFrameRef.current = requestAnimationFrame(updateWave);
          };

          updateWave();
        }

        // Determine supported audio container
        let mimeType = 'audio/webm;codecs=opus';
        if (typeof MediaRecorder !== 'undefined') {
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
            else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
            else mimeType = '';
          }
        }

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(200); // 200ms slices

        timerInterval = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);

      } catch (err) {
        console.error('Failed to access microphone:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else {
          setErrorMessage(err.message || 'Could not start microphone.');
        }
      }
    }

    startRecording();

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      cleanupStreams();
    };
  }, []);

  const cleanupStreams = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleStopAndTranscribe = async () => {
    if (!mediaRecorderRef.current || isProcessing) return;
    playPop();
    setIsProcessing(true);

    const recorder = mediaRecorderRef.current;
    const finalMime = recorder.mimeType || 'audio/webm';

    recorder.onstop = async () => {
      try {
        cleanupStreams();
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });
        
        if (audioBlob.size < 500) {
          setErrorMessage('No voice detected. Please speak clearly into your mic.');
          setIsProcessing(false);
          return;
        }

        // Convert Blob to Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result;
          const base64Audio = dataUrl.split(',')[1];

          try {
            const res = await apiPost('/transcribe', {
              audioData: base64Audio,
              mimeType: finalMime,
              language
            });

            if (res.transcript) {
              playChime();
              onTranscript(res.transcript);
            } else {
              setErrorMessage('Could not decipher speech. Try speaking a bit louder.');
              setIsProcessing(false);
            }
          } catch (err) {
            console.error('Transcription error:', err);
            setErrorMessage('Transcription failed. Please try again.');
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(audioBlob);

      } catch (err) {
        console.error('Audio processing error:', err);
        setErrorMessage('Failed to process voice note.');
        setIsProcessing(false);
      }
    };

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const handleCancel = () => {
    playTick();
    cleanupStreams();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    onClose();
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="voice-recorder-overlay glass-strong">
      {errorMessage ? (
        <div className="voice-error-row">
          <span className="voice-error-icon">⚠️</span>
          <span className="voice-error-text">{errorMessage}</span>
          <button className="voice-btn-close" onClick={handleCancel}>Close</button>
        </div>
      ) : isProcessing ? (
        <div className="voice-processing-row">
          <div className="voice-spinner"></div>
          <span className="voice-proc-text">Transcribing your voice with Westy AI...</span>
        </div>
      ) : (
        <div className="voice-active-row">
          {/* Recording Status & Timer */}
          <div className="voice-status-badge">
            <span className="voice-red-ping"></span>
            <span className="voice-timer-text">{formatTimer(duration)}</span>
          </div>

          {/* Live Dancing Audio Waveform */}
          <div className="voice-waveform-container" title="Live Microphone Audio Waveform">
            {volumeLevels.map((lvl, idx) => (
              <span
                key={idx}
                className="voice-wave-bar"
                style={{ height: `${lvl}px` }}
              ></span>
            ))}
          </div>

          <span className="voice-prompt-hint">Speak now...</span>

          {/* Actions */}
          <div className="voice-actions-group">
            <button
              className="voice-action-btn voice-btn-transcribe glow-hover"
              onClick={handleStopAndTranscribe}
              title="Transcribe speech to prompt"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Done</span>
            </button>

            <button
              className="voice-action-btn voice-btn-cancel"
              onClick={handleCancel}
              title="Cancel recording"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
