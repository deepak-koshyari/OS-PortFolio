import React, { useEffect, useMemo, useState } from 'react';

interface VideoItem {
  title: string;
  src: string;
  updatedAtMs: number;
}

const VideoPlayerApp: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadVideos = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/videos', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.status}`);
        }
        const data: { videos?: VideoItem[] } = await response.json();
        const fetchedVideos = data.videos ?? [];

        if (!isMounted) return;
        setVideos(fetchedVideos);
        setSelectedVideo(prev =>
          prev ? fetchedVideos.find(video => video.src === prev.src) ?? fetchedVideos[0] ?? null : fetchedVideos[0] ?? null
        );
      } catch (err) {
        if (!isMounted) return;
        setError(`Could not load videos. ${String(err)}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedVideoSrc = useMemo(() => {
    if (!selectedVideo) return '';
    // Cache-buster so updated file content appears immediately even with same filename.
    return `${selectedVideo.src}?v=${Math.floor(selectedVideo.updatedAtMs)}`;
  }, [selectedVideo]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full p-4 bg-gray-900 text-white">
      {/* Video List */}
      <div className="md:w-1/4 w-full mb-4 md:mb-0 md:mr-4">
        <h2 className="text-lg font-bold mb-2">Portfolio Videos</h2>
        {loading && <p className="text-sm text-gray-400">Loading videos...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && !error && videos.length === 0 && (
          <p className="text-sm text-gray-400">No videos found in `public/portfolio-videos`.</p>
        )}
        <ul>
          {videos.map((video) => (
            <li key={video.src}>
              <button
                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-700 ${selectedVideo?.src === video.src ? 'bg-gray-800' : ''}`}
                onClick={() => setSelectedVideo(video)}
              >
                {video.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Video Player */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {selectedVideo ? (
          <>
            <video
              key={selectedVideoSrc}
              src={selectedVideoSrc}
              controls
              className="w-full max-w-2xl rounded shadow-lg"
            />
            <div className="mt-2 text-center">{selectedVideo.title}</div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Select a video to play.</p>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerApp;
