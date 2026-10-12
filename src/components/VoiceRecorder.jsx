import React, { useState, useEffect, useRef } from 'react';
import { apiPost } from '../utils/api';
import { playPop, playTick, playChime } from '../utils/audio';

export default function VoiceRecorder({ onTranscript, onClose, language = 'en', onLiveUpdate }) {
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [liveText, setLiveText] = useState('');

  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechRecRef = useRef(null);

  const langSpeechMap = {
    en: 'en-US',
    yo: 'yo-NG',
    ig: 'ig-NG',
    ha: 'ha-NG',
    pcm: 'en-NG',
    zh: 'zh-CN',
    es: 'es-ES',
    fr: 'fr-FR',
    ar: 'ar-SA',
    hi: 'hi-IN',
    pt: 'pt-BR',
    ja: 'ja-JP',
    ko: 'ko-KR',
    de: 'de-DE',
    sw: 'sw-KE',
    zu: 'zu-ZA'
  };

  useEffect(() => {
    let timerInterval = null;

    async function startRecording() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support audio recording.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Initialize AudioContext & Analyser for Live Dynamic Waveform Canvas
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.65;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const freqData = new Uint8Array(bufferLength);
          let phase = 0;

          const renderWave = () => {
            if (!analyserRef.current || !canvasRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            analyserRef.current.getByteFrequencyData(freqData);

            // Compute Average RMS volume to drive wave amplitude
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += freqData[i];
            }
            const avgVol = sum / bufferLength; // 0 to 255
            // High or low amplitude multiplier based on mic volume
            const normVol = Math.max(0.08, (avgVol / 80));

            ctx.clearRect(0, 0, width, height);

            phase += 0.09;

            // 3 Multi-layered glowing neon sound waves
            const waves = [
              { color: 'rgba(0, 245, 212, 0.9)', width: 2.5, blur: 12, speed: 1.0, ampScale: 1.0 },
              { color: 'rgba(56, 189, 248, 0.75)', width: 1.8, blur: 8, speed: 1.4, ampScale: 0.8 },
              { color: 'rgba(167, 139, 250, 0.65)', width: 1.5, blur: 6, speed: 0.7, ampScale: 0.6 }
            ];

            waves.forEach((w, idx) => {
              ctx.beginPath();
              ctx.lineWidth = w.width;
              ctx.strokeStyle = w.color;
              ctx.shadowBlur = w.blur;
              ctx.shadowColor = w.color;

              const wavePhase = phase * w.speed + idx * 1.2;
              const maxAmp = (height * 0.42) * normVol * w.ampScale;

              for (let x = 0; x <= width; x += 2) {
                // Hanning envelope window: tapers smoothly to 0 at edges
                const envelope = Math.sin((x / width) * Math.PI);
                const y = height / 2 + Math.sin(x * 0.05 + wavePhase) * maxAmp * envelope;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            });

            animFrameRef.current = requestAnimationFrame(renderWave);
          };

          renderWave();
        }

        // Parallel Live Speech-to-Text streaming if supported by browser
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            const sr = new SpeechRecognition();
            speechRecRef.current = sr;
            sr.continuous = true;
            sr.interimResults = true;
            sr.lang = langSpeechMap[language] || 'en-US';

            sr.onresult = (event) => {
              let transcript = '';
              for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
              }
              if (transcript) {
                setLiveText(transcript);
                if (onLiveUpdate) onLiveUpdate(transcript);
              }
            };

            sr.onerror = (e) => {
              console.warn('Live speech recognition warning:', e.error);
            };

            sr.start();
          } catch (e) {
            console.warn('Live SpeechRecognition not started:', e);
          }
        }

        // MediaRecorder for high-fidelity audio capture (Brave / Safari / Chrome)
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

        recorder.start(200);

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
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch (e) {}
      speechRecRef.current = null;
    }
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
    if (isProcessing) return;
    playPop();
    setIsProcessing(true);

    // If liveText already captured from real-time SpeechRecognition, use it immediately!
    if (liveText && liveText.trim().length > 1) {
      cleanupStreams();
      playChime();
      onTranscript(liveText.trim());
      return;
    }

    // Otherwise, fallback to Gemini High-Fidelity Audio Model (for Brave / Safari)
    if (!mediaRecorderRef.current) {
      cleanupStreams();
      onClose();
      return;
    }

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

            if (res.transcript && res.transcript.trim()) {
              playChime();
              onTranscript(res.transcript.trim());
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
        setErrorMessage('Failed to process voice recording.');
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
          <span className="voice-proc-text">✨ Transcribing with Westy AI...</span>
        </div>
      ) : (
        <div className="voice-active-row">
          {/* Status & Timer */}
          <div className="voice-status-badge">
            <span className="voice-red-ping"></span>
            <span className="voice-timer-text">{formatTimer(duration)}</span>
          </div>

          {/* Live Continuous Sine Waveform Canvas */}
          <div className="voice-canvas-wrapper" title="Live Voice Waves (High & Low)">
            <canvas ref={canvasRef} width={260} height={42} className="voice-wave-canvas" />
          </div>

          {/* Real-time speech preview */}
          <div className="voice-live-text-preview">
            {liveText ? (
              <span className="voice-transcribing-words">"{liveText}"</span>
            ) : (
              <span className="voice-prompt-hint">Listening to your voice...</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="voice-actions-group">
            <button
              className="voice-action-btn voice-btn-transcribe glow-hover"
              onClick={handleStopAndTranscribe}
              title="Finish & insert prompt (or press Ctrl + M)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Done</span>
            </button>

            <button
              className="voice-action-btn voice-btn-cancel"
              onClick={handleCancel}
              title="Cancel recording (Esc)"
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
