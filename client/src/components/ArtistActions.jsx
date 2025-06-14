import React, { useState, useEffect } from "react";
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';
import CommentIcon from '../assets/comment-5-svgrepo-com.svg?react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import { Toast } from "@heroui/react";

const ICON_COLOR = "#A15E0A";
const ICON_HOVER_COLOR = "#C1873B";

const iconStyle = (active, hover) => ({
    width: 40,
    height: 40,
    background: "none",
    border: "none",
    color: hover ? ICON_HOVER_COLOR : active ? ICON_HOVER_COLOR : ICON_COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "10px 0",
    cursor: "pointer",
    position: "relative",
    transition: "color 0.15s"
});

export default function ArtistActions({
    artistId,
    onComment = () => { }
}) {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [comments, setComments] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching data for artist:', artistId);

                // Fetch votes
                const votesResponse = await fetch(`/artist-votes/artist/${artistId}`, {
                    headers: {
                        'x-auth-token': localStorage.getItem('token')
                    }
                });
                console.log('Votes response status:', votesResponse.status);
                if (!votesResponse.ok) throw new Error('Failed to fetch votes');
                const votesData = await votesResponse.json();
                console.log('Votes data:', votesData);
                setLikes(votesData.upvotes.count);
                setDislikes(votesData.downvotes.count);

                // Set liked/disliked based on current user's vote
                if (user) {
                    setLiked(votesData.upvotes.users.includes(user._id));
                    setDisliked(votesData.downvotes.users.includes(user._id));
                }

                // Fetch comments
                const commentsResponse = await fetch(`/comments/artist/${artistId}`, {
                    headers: {
                        'x-auth-token': localStorage.getItem('token')
                    }
                });
                console.log('Comments response status:', commentsResponse.status);
                if (!commentsResponse.ok) throw new Error('Failed to fetch comments');
                const commentsData = await commentsResponse.json();
                console.log('Comments data:', commentsData);
                setComments(commentsData.length);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (artistId) {
            fetchData();
        }
    }, [artistId, user]);

    const handleVote = async (voteType) => {
        if (!user) {
            Toast.error({
                title: "Authentication Required",
                description: "Log in or sign up to like/dislike artists"
            });
            return;
        }

        try {
            const voteUrl = `/artist-votes/${artistId}/${voteType}`;
            console.log(`Making vote request to: ${voteUrl}`);
            const response = await fetch(voteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
            });

            console.log('Vote response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Vote response error:', errorText);
                throw new Error('Failed to vote');
            }

            const data = await response.json();
            console.log('Vote response data:', data);

            // Fetch updated vote counts
            const votesUrl = `/artist-votes/artist/${artistId}`;
            console.log(`Fetching updated votes from: ${votesUrl}`);
            const votesResponse = await fetch(votesUrl, {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });
            console.log('Votes response status:', votesResponse.status);

            if (!votesResponse.ok) {
                const errorText = await votesResponse.text();
                console.error('Votes response error:', errorText);
                throw new Error('Failed to fetch updated votes');
            }

            const votesData = await votesResponse.json();
            console.log('Updated votes data:', votesData);

            // Update all vote-related state
            setLikes(votesData.upvotes.count);
            setDislikes(votesData.downvotes.count);
            setLiked(votesData.upvotes.users.includes(user._id));
            setDisliked(votesData.downvotes.users.includes(user._id));

            console.log('Updated state:', {
                likes: votesData.upvotes.count,
                dislikes: votesData.downvotes.count,
                liked: votesData.upvotes.users.includes(user._id),
                disliked: votesData.downvotes.users.includes(user._id)
            });
        } catch (error) {
            console.error('Error voting:', error);
            Toast.error({
                title: "Error",
                description: "Failed to vote. Please try again."
            });
        }
    };

    const handleCommentClick = () => {
        // TODO: Replace with actual navigation when artist page is implemented
        console.log('Navigate to artist page for comments');
        // navigate(`/artist/${artistId}`); // Uncomment when ready
    };

    const actions = [
        {
            key: "like",
            icon: <LikeIcon style={{ width: 32, height: 32, display: 'block' }} />,
            count: likes,
            onClick: () => handleVote('up'),
            active: liked,
            countStyle: { left: "60%", top: "62%" }
        },
        {
            key: "dislike",
            icon: <DislikeIcon style={{ width: 32, height: 32, display: 'block' }} />,
            count: dislikes,
            onClick: () => handleVote('down'),
            active: disliked,
            countStyle: { left: "42%", top: "32%" }
        },
        {
            key: "comment",
            icon: <CommentIcon style={{ width: 26, height: 26, display: 'block', marginTop: '-15px' }} />,
            count: comments,
            onClick: handleCommentClick,
            active: false,
            countStyle: { left: "50%", top: "26%" }
        },
    ];

    if (loading) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                userSelect: "none"
            }}>
                {/* Simple loading indicator */}
                <div style={{ color: ICON_COLOR }}>...</div>
            </div>
        );
    }

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