import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Reciter } from '../services/audioApi';
import { RECITERS_LIST, getSurahAudioUrl } from '../services/audioApi';
import type { Surah, AudioSegment } from '../services/quranApi';
import { fetchSurahAudioTimestamps, fetchSurahsList } from '../services/quranApi';

export type RepeatMode = 'none' | 'ayah' | 'surah';

interface AudioContextType {
  currentSurah: Surah | null;
  currentReciter: Reciter;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  repeatMode: RepeatMode;
  activeAyahNumber: number | null;
  isFullPlayerOpen: boolean;
  surahList: Surah[];

  // Actions
  playSurah: (surah: Surah, reciter?: Reciter, startAyah?: number) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (val: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setReciter: (reciter: Reciter) => void;
  playNextSurah: () => void;
  playPrevSurah: () => void;
  setIsFullPlayerOpen: (open: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentReciter, setCurrentReciter] = useState<Reciter>(RECITERS_LIST[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [audioTimestamps, setAudioTimestamps] = useState<AudioSegment[]>([]);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State refs to keep single Audio event listeners always up-to-date without recreating audio element
  const currentSurahRef = useRef<Surah | null>(currentSurah);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  const audioTimestampsRef = useRef<AudioSegment[]>(audioTimestamps);
  const surahListRef = useRef<Surah[]>(surahList);
  const currentReciterRef = useRef<Reciter>(currentReciter);

  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    audioTimestampsRef.current = audioTimestamps;
  }, [audioTimestamps]);

  useEffect(() => {
    surahListRef.current = surahList;
  }, [surahList]);

  useEffect(() => {
    currentReciterRef.current = currentReciter;
  }, [currentReciter]);

  // Fetch surah list directory on mount
  useEffect(() => {
    fetchSurahsList().then(setSurahList);
  }, []);

  // Initialize single persistent Audio element once on mount
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);

      const timestamps = audioTimestampsRef.current;
      const surah = currentSurahRef.current;

      if (timestamps.length > 0) {
        const ms = audio.currentTime * 1000;
        const currentSegment = timestamps.find(
          (seg) => ms >= seg.timestampFrom && ms <= seg.timestampTo
        );
        if (currentSegment) {
          const [_, ayahNum] = currentSegment.verseKey.split(':');
          setActiveAyahNumber(parseInt(ayahNum, 10));
        }
      } else if (surah && audio.duration > 0) {
        const progressRatio = audio.currentTime / audio.duration;
        const estimatedAyah = Math.min(
          surah.numberOfAyahs,
          Math.max(1, Math.ceil(progressRatio * surah.numberOfAyahs))
        );
        setActiveAyahNumber(estimatedAyah);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      const mode = repeatModeRef.current;
      if (mode === 'surah') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (mode === 'ayah') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        // Play next surah
        const list = surahListRef.current;
        const cSurah = currentSurahRef.current;
        if (cSurah && list.length > 0) {
          const currentIndex = list.findIndex((s) => s.number === cSurah.number);
          const nextSurah = list[(currentIndex + 1) % list.length];
          playSurah(nextSurah, currentReciterRef.current);
        }
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Fetch audio timestamps whenever currentSurah or currentReciter changes
  useEffect(() => {
    if (currentSurah && currentReciter) {
      fetchSurahAudioTimestamps(currentReciter.quranComId, currentSurah.number).then((timestamps) => {
        setAudioTimestamps(timestamps);
      });
    }
  }, [currentSurah, currentReciter]);

  const playSurah = (surah: Surah, reciter?: Reciter, _startAyah?: number) => {
    const selectedReciter = reciter || currentReciter;
    setCurrentSurah(surah);
    setCurrentReciter(selectedReciter);

    if (audioRef.current) {
      const url = getSurahAudioUrl(selectedReciter, surah.number);
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Audio play failed:', err);
          setIsPlaying(false);
        });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentSurah) {
      if (surahList.length > 0) {
        playSurah(surahList[0]);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const setReciter = (reciter: Reciter) => {
    setCurrentReciter(reciter);
    if (currentSurah) {
      playSurah(currentSurah, reciter);
    }
  };

  const playNextSurah = () => {
    if (!currentSurah || surahList.length === 0) return;
    const currentIndex = surahList.findIndex((s) => s.number === currentSurah.number);
    const nextSurah = surahList[(currentIndex + 1) % surahList.length];
    playSurah(nextSurah);
  };

  const playPrevSurah = () => {
    if (!currentSurah || surahList.length === 0) return;
    const currentIndex = surahList.findIndex((s) => s.number === currentSurah.number);
    const prevSurah = surahList[(currentIndex - 1 + surahList.length) % surahList.length];
    playSurah(prevSurah);
  };

  return (
    <AudioContext.Provider
      value={{
        currentSurah,
        currentReciter,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackSpeed,
        repeatMode,
        activeAyahNumber,
        isFullPlayerOpen,
        surahList,
        playSurah,
        togglePlay,
        seekTo,
        setVolume,
        setPlaybackSpeed,
        setRepeatMode,
        setReciter,
        playNextSurah,
        playPrevSurah,
        setIsFullPlayerOpen
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
