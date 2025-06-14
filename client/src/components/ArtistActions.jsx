import React, { useState } from "react";
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';
import CommentIcon from '../assets/comment-5-svgrepo-com.svg?react';

const ICON_COLOR = "#A15E0A";
const ICON_HOVER_COLOR = "#C1873B";

const iconStyle = (active, hover) => ({
    width: 40,
    height: 40,
    background: "none",
    border: "none",
    color: hover ? ICON_HOVER_COLOR : ICON_COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "10px 0",
    cursor: "pointer",
    position: "relative",
    transition: "color 0.15s"
});

export default function ArtistActions({
    initialLikes = 12,
    initialDislikes = 6,
    initialComments = 3,
    onComment = () => { }
}) {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [hovered, setHovered] = useState(null);

    const handleLike = () => {
        if (liked) {
            setLiked(false);
            setLikes(likes - 1);
        } else {
            setLiked(true);
            setLikes(likes + 1);
            if (disliked) {
                setDisliked(false);
                setDislikes(dislikes - 1);
            }
        }
    };

    const handleDislike = () => {
        if (disliked) {
            setDisliked(false);
            setDislikes(dislikes - 1);
        } else {
            setDisliked(true);
            setDislikes(dislikes + 1);
            if (liked) {
                setLiked(false);
                setLikes(likes - 1);
            }
        }
    };

    const actions = [
        {
            key: "like",
            icon: <LikeIcon style={{ width: 32, height: 32, display: 'block' }} />,
            count: likes,
            onClick: handleLike,
            active: liked,
            countStyle: { left: "60%", top: "62%" }
        },
        {
            key: "dislike",
            icon: <DislikeIcon style={{ width: 32, height: 32, display: 'block' }} />,
            count: dislikes,
            onClick: handleDislike,
            active: disliked,
            countStyle: { left: "42%", top: "32%" }
        },
        {
            key: "comment",
            icon: <CommentIcon style={{ width: 26, height: 26, display: 'block', marginTop: '-15px' }} />,
            count: initialComments,
            onClick: onComment,
            active: false,
            countStyle: { left: "50%", top: "26%" }
        },
    ];

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            userSelect: "none"
        }}>
            {actions.map((action) => (
                <div
                    key={action.key}
                    style={iconStyle(action.active, hovered === action.key)}
                    onClick={action.onClick}
                    onMouseEnter={() => setHovered(action.key)}
                    onMouseLeave={() => setHovered(null)}
                >
                    <span style={{
                        position: "absolute",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#fff",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                        ...action.countStyle
                    }}>{action.count}</span>
                    {action.icon}
                </div>
            ))}
        </div>
    );
} 