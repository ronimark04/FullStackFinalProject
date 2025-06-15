import React, { useState, useEffect } from "react";
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';
import ReplyIcon from '../assets/reply-svgrepo-com.svg?react';
import EditIcon from '../assets/edit-svgrepo-com.svg?react';
import DeleteIcon from '../assets/delete-svgrepo-com.svg?react';
import { useAuth } from '@/context/authContext';
import { Toast } from "@heroui/react";

const ICON_COLOR = "#A15E0A";
const ICON_HOVER_COLOR = "#C1873B";

const iconStyle = (active, hover) => ({
    width: 32,
    height: 32,
    background: "none",
    border: "none",
    color: hover ? ICON_HOVER_COLOR : active ? ICON_HOVER_COLOR : ICON_COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 8px",
    cursor: "pointer",
    position: "relative",
    transition: "color 0.15s"
});

export default function CommentActions({ commentId, onReplyClick, isReplying, onEditClick, onDeleteClick, isAuthor }) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userVote, setUserVote] = useState(null);

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const res = await fetch(`/comment-votes/comment/${commentId}`);
                if (!res.ok) throw new Error('Failed to fetch comment votes');
                const data = await res.json();
                setLikes(data.upvotes.count);
                setDislikes(data.downvotes.count);
                if (user) {
                    setLiked(data.upvotes.users.includes(user._id));
                    setDisliked(data.downvotes.users.includes(user._id));
                } else {
                    setLiked(false);
                    setDisliked(false);
                }
            } catch (e) {
                // Optionally handle error
            } finally {
                setLoading(false);
            }
        };
        if (commentId) fetchVotes();
    }, [commentId, user]);

    useEffect(() => {
        async function fetchUserVote() {
            if (!user) return;
            try {
                const res = await fetch(`/comment-votes/user/${user._id}`);
                if (res.ok) {
                    const votes = await res.json();
                    const vote = votes.find(v => v.comment.toString() === commentId);
                    setUserVote(vote?.vote_type || null);
                }
            } catch (error) {
                console.error('Error fetching user vote:', error);
            }
        }
        fetchUserVote();
    }, [commentId, user]);

    const handleVote = async (voteType) => {
        if (!user) {
            Toast.error({
                title: "Authentication Required",
                description: "Log in or sign up to like/dislike comments"
            });
            return;
        }
        try {
            const voteUrl = `/comment-votes/${commentId}/${voteType}`;
            const response = await fetch(voteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
            });
            if (!response.ok) throw new Error('Failed to vote');
            // Refetch votes after voting
            const res = await fetch(`/comment-votes/comment/${commentId}`);
            if (!res.ok) throw new Error('Failed to fetch updated votes');
            const data = await res.json();
            setLikes(data.upvotes.count);
            setDislikes(data.downvotes.count);
            setLiked(data.upvotes.users.includes(user._id));
            setDisliked(data.downvotes.users.includes(user._id));
            // Refresh user vote
            const userVotesRes = await fetch(`/comment-votes/user/${user._id}`);
            if (userVotesRes.ok) {
                const votes = await userVotesRes.json();
                const vote = votes.find(v => v.comment.toString() === commentId);
                setUserVote(vote?.vote_type || null);
            }
        } catch (e) {
            Toast.error({
                title: "Error",
                description: "Failed to vote. Please try again."
            });
        }
    };

    if (loading) return <div style={{ height: 32 }} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
            {isAuthor && (
                <>
                    <button
                        onClick={onEditClick}
                        style={iconStyle(false, false)}
                        title="Edit comment"
                    >
                        <EditIcon style={{ width: 20, height: 20 }} />
                    </button>
                    <button
                        onClick={onDeleteClick}
                        style={iconStyle(false, false)}
                        title="Delete comment"
                    >
                        <DeleteIcon style={{ width: 20, height: 20 }} />
                    </button>
                </>
            )}
            <div
                style={iconStyle(liked, hovered === 'like')}
                onClick={() => handleVote('up')}
                onMouseEnter={() => setHovered('like')}
                onMouseLeave={() => setHovered(null)}
            >
                <span style={{ position: "absolute", fontWeight: 600, fontSize: 13, color: "#fff", left: 18, top: 18, transform: "translate(-50%, -50%)", pointerEvents: "none" }}>{likes}</span>
                <LikeIcon style={{ width: 24, height: 24, display: 'block', margin: 'auto' }} />
            </div>
            <div
                style={iconStyle(disliked, hovered === 'dislike')}
                onClick={() => handleVote('down')}
                onMouseEnter={() => setHovered('dislike')}
                onMouseLeave={() => setHovered(null)}
            >
                <span style={{ position: "absolute", fontWeight: 600, fontSize: 13, color: "#fff", left: 18, top: 18, transform: "translate(-50%, -50%)", pointerEvents: "none" }}>{dislikes}</span>
                <DislikeIcon style={{ width: 24, height: 24, display: 'block', margin: 'auto' }} />
            </div>
            {user && (
                <div
                    style={iconStyle(isReplying, hovered === 'reply')}
                    onClick={onReplyClick}
                    onMouseEnter={() => setHovered('reply')}
                    onMouseLeave={() => setHovered(null)}
                >
                    <ReplyIcon style={{ width: 26, height: 26, display: 'block', margin: 'auto' }} />
                </div>
            )}
        </div>
    );
} 