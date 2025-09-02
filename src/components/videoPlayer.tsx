import React, { useState, useRef, useEffect } from 'react';
// import './videoPlayer.module.css';

const VideoPlayer: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);//очистка ресурсов
      }
    };
  }, [videoSrc]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. MIME type
    if (!file.type.startsWith('video/')) {
      setError('Please, select a video');
      return;
    }

    // 2. Size
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too big. Max size: 100MB');
      return;
    }

    setError(null);
    setIsLoading(true);

    const objectUrl = URL.createObjectURL(file);
    setVideoSrc(objectUrl);
  };
  
  const handleLoadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleVideoLoaded = () => {
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setError('Failed to load file');//3.error
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
      setVideoSrc(null);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().catch((err) => {
        console.error('Player error', err);
        setError('Failed to play file');
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRemoveVideo = () => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!videoSrc) {
    return (
      <div className="video-player-container">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="video-upload-area">
          <button 
            className="load-button"
            onClick={handleLoadButtonClick}
            disabled={isLoading}
          >
            {isLoading ? 'loading..' : 'Load video'}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src={videoSrc}
          onLoadedMetadata={handleVideoLoaded}
          onTimeUpdate={handleTimeUpdate}
          onError={handleVideoError}
          onPause={() => {setIsPlaying(false)}}
          onPlay={() => { setIsPlaying(true); }}
        />
        
        <div className="video-controls">
          <button 
            className="play-pause-btn"
            onClick={handlePlayPause}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <input
            type="range"
            className="progress-bar"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            step="0.1"
          />
          
          <button 
            className="remove-btn"
            onClick={handleRemoveVideo}
            title="Remove video"
          >
            Remove video
          </button>
        </div>
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Загрузка...</div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default VideoPlayer;