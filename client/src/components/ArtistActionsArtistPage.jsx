import React, { useState, useEffect } from "react";
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';
import { useAuth } from '@/context/authContext';
import { Toast } from "@heroui/react";

const ICON_COLOR = "#A15E0A";
const ICON_HOVER_COLOR = "#C1873B";

const iconStyle = {
    width: 40,
    height: 40,
    background: "none",
    border: "none",
    color: ICON_COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 10px",
    cursor: "pointer",
    position: "relative",
    transition: "color 0.15s"
};

export default function ArtistActionsArtistPage({ artistId }) {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch votes
                const votesResponse = await fetch(`/artist-votes/artist/${artistId}`, {
                    headers: {
                        'x-auth-token': localStorage.getItem('token')
                    }
                });
                if (!votesResponse.ok) throw new Error('Failed to fetch votes');
                const votesData = await votesResponse.json();
                setLikes(votesData.upvotes.count);
                setDislikes(votesData.downvotes.count);

                // Set liked/disliked based on current user's vote
                if (user) {
                    setLiked(votesData.upvotes.users.includes(user._id));
                    setDisliked(votesData.downvotes.users.includes(user._id));
                }
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
            const response = await fetch(voteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
            });

            if (!response.ok) {
                throw new Error('Failed to vote');
            }

            // Fetch updated vote counts
            const votesUrl = `/artist-votes/artist/${artistId}`;
            const votesResponse = await fetch(votesUrl, {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });

            if (!votesResponse.ok) {
                throw new Error('Failed to fetch updated votes');
            }

            const votesData = await votesResponse.json();

            // Update all vote-related state
            setLikes(votesData.upvotes.count);
            setDislikes(votesData.downvotes.count);
            setLiked(votesData.upvotes.users.includes(user._id));
            setDisliked(votesData.downvotes.users.includes(user._id));
        } catch (error) {
            console.error('Error voting:', error);
            Toast.error({
                title: "Error",
                description: "Failed to vote. Please try again."
            });
        }
    };

    if (loading) {
        return (
            <div style={{ background: '#fff3e0', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, width: '100%', display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: ICON_COLOR }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ background: '#fff3e0', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, width: '100%', display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
            <div
                style={{
                    ...iconStyle,
                    color: liked ? ICON_HOVER_COLOR : ICON_COLOR,
                    background: '#ffe0b2',
                    borderRadius: 12,
                    minWidth: 80,
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 18
                }}
                onClick={() => handleVote('up')}
            >
                <LikeIcon style={{ width: 28, height: 28, marginRight: 8 }} />
                <span style={{ color: '#a15e0a', fontWeight: 700 }}>{likes}</span>
            </div>
            <div
                style={{
                    ...iconStyle,
                    color: disliked ? ICON_HOVER_COLOR : ICON_COLOR,
                    background: '#ffe0b2',
                    borderRadius: 12,
                    minWidth: 80,
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 18
                }}
                onClick={() => handleVote('down')}
            >
                <DislikeIcon style={{ width: 28, height: 28, marginRight: 8 }} />
                <span style={{ color: '#a15e0a', fontWeight: 700 }}>{dislikes}</span>
            </div>
        </div>
    );
} 