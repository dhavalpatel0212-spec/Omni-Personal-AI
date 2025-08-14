import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { Button } from './Button';
import styles from './VoiceRecorder.module.css';

// TypeScript declarations for SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription, isProcessing, className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);
    };
    
    rec.onend = () => {
      setIsRecording(false);
    };

    setRecognition(rec);

    return () => {
      rec.stop();
    };
  }, []);

  const toggleRecording = useCallback(() => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      setTranscript('');
      recognition.start();
    }
    setIsRecording(!isRecording);
  }, [recognition, isRecording]);

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscription(transcript.trim());
      setTranscript('');
    }
  };

  if (!recognition) {
    return <div className={styles.notSupported}>Voice input is not supported by your browser.</div>;
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={isRecording ? "Listening..." : "Press mic to start speaking"}
          className={styles.transcriptInput}
          disabled={isProcessing}
        />
        <Button
          type="button"
          size="icon"
          variant={isRecording ? 'destructive' : 'primary'}
          onClick={toggleRecording}
          disabled={isProcessing}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? <MicOff /> : <Mic />}
        </Button>
      </div>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!transcript.trim() || isProcessing}
        className={styles.submitButton}
      >
        {isProcessing ? 'Processing...' : <><Send size={16} /> Add from Text</>}
      </Button>
    </div>
  );
};