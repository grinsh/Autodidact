import { useEffect, useRef, useState } from "react";

export const VideoPlayer = ({ filename, width = 640, height = 360 }) => {

      const REACT_APP_VIDEOS_URL = process.env.REACT_APP_VIDEOS_URL;

    const videoRef = useRef(null);
    const [blockedHtml, setBlockedHtml] = useState(null);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        const checkVideo = async () => {
            try {
                const response = await fetch(`${REACT_APP_VIDEOS_URL}/${filename}`);
                if (response.status === 418) {
                    const htmlRaw = await response.text();
                    const htmlClean = htmlRaw.replace(/<style[\s\S]*?<\/style>/gi, "");

                    setFade(true);
                    setTimeout(() => setBlockedHtml(htmlClean), 300);
                }
            } catch (err) {
                console.error("Error fetching video:", err);
            }
        };

        checkVideo();
    }, [filename]);

    return (
        <div
            style={{
                width,
                height,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {blockedHtml ? (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        opacity: fade ? 1 : 0,
                        transition: "opacity 0.3s ease-in-out",
                    }}
                    dangerouslySetInnerHTML={{ __html: blockedHtml }}
                />
            ) : (
                <video
                    ref={videoRef}
                    controls
                    width="100%"
                    height="100%"
                    style={{
                        display: "block",
                        opacity: fade ? 0 : 1,
                        transition: "opacity 0.3s ease-in-out",
                    }}
                >
                    <source
                        src={`${REACT_APP_VIDEOS_URL}/${filename}`}
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    );
};
