import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import { useLanguage } from '@/context/languageContext';
import CommentActions from './CommentActions';
import { motion } from 'framer-motion';
import { Avatar } from "@heroui/react";

// Helper function to detect if text is mainly Hebrew
function isMainlyHebrew(text) {
    if (!text) return false;
    const hebrewPattern = /[\u0590-\u05FF]/g;
    const hebrewChars = (text.match(hebrewPattern) || []).length;
    return hebrewChars > text.length * 0.5;
}

const COMMENT_BACKGROUNDS = [
    '#fffef5',  // Original color
    '#fff8e1',  // Slightly warmer
    '#fff3e0',  // Warmer still
    '#ffecb3',  // Light amber
    '#ffe0b2'   // Light orange
];

const ProfilePage = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const { language } = useLanguage();
    const [profileUser, setProfileUser] = useState(null);
    const [likedArtists, setLikedArtists] = useState([]);
    const [dislikedArtists, setDislikedArtists] = useState([]);
    const [comments, setComments] = useState([]);
    const [likedComments, setLikedComments] = useState([]);
    const [dislikedComments, setDislikedComments] = useState([]);
    const [replyToComments, setReplyToComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch user profile
                const userRes = await fetch(`/users/${userId}`);
                const userData = await userRes.json();
                setProfileUser(userData);

                // Fetch user's votes
                const votesRes = await fetch(`/artist-votes/user/${userId}`);
                const votesData = await votesRes.json();

                // Fetch liked artists
                const likedArtistsPromises = votesData.upvotes.map(async (artistId) => {
                    const res = await fetch(`/artists/${artistId}`);
                    return res.json();
                });
                const likedArtistsData = await Promise.all(likedArtistsPromises);
                setLikedArtists(likedArtistsData);

                // Fetch disliked artists
                const dislikedArtistsPromises = votesData.downvotes.map(async (artistId) => {
                    const res = await fetch(`/artists/${artistId}`);
                    return res.json();
                });
                const dislikedArtistsData = await Promise.all(dislikedArtistsPromises);
                setDislikedArtists(dislikedArtistsData);

                // Fetch user's comments
                const commentsRes = await fetch(`/comments/user/${userId}`);
                const commentsData = await commentsRes.json();
                setComments(commentsData);

                // Fetch user's liked comments
                const commentVotesRes = await fetch(`/comment-votes/user/${userId}`);
                const commentVotesData = await commentVotesRes.json();

                // Fetch liked comments
                const likedCommentsPromises = commentVotesData.upvotes.map(async (commentId) => {
                    const res = await fetch(`/comments/${commentId}`);
                    return res.json();
                });
                const likedCommentsData = await Promise.all(likedCommentsPromises);
                setLikedComments(likedCommentsData);

                // Fetch disliked comments
                const dislikedCommentsPromises = commentVotesData.downvotes.map(async (commentId) => {
                    const res = await fetch(`/comments/${commentId}`);
                    return res.json();
                });
                const dislikedCommentsData = await Promise.all(dislikedCommentsPromises);
                setDislikedComments(dislikedCommentsData);

                // Fetch reply_to comments for both user's comments and liked comments
                const allComments = [...commentsData, ...likedCommentsData, ...dislikedCommentsData];
                const replyToIds = allComments
                    .filter(comment => comment.reply_to)
                    .map(comment => comment.reply_to);

                const uniqueReplyToIds = [...new Set(replyToIds)];
                const replyToCommentsPromises = uniqueReplyToIds.map(async (commentId) => {
                    const res = await fetch(`/comments/${commentId}`);
                    return res.json();
                });
                const replyToCommentsData = await Promise.all(replyToCommentsPromises);

                // Create a map of reply_to comments
                const replyToMap = {};
                replyToCommentsData.forEach(comment => {
                    replyToMap[comment._id] = comment;
                });
                setReplyToComments(replyToMap);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        }
        if (userId) fetchData();
    }, [userId]);

    const handleEdit = async (commentId) => {
        if (!editText.trim()) return;
        const res = await fetch(`/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                text: editText,
            }),
        });
        if (res.ok) {
            setEditText('');
            setEditingCommentId(null);
            // Refresh comments
            const commentsRes = await fetch(`/comments/user/${userId}`);
            const commentsData = await commentsRes.json();
            setComments(commentsData);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        const res = await fetch(`/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': localStorage.getItem('token'),
            },
        });
        if (res.ok) {
            // Refresh comments
            const commentsRes = await fetch(`/comments/user/${userId}`);
            const commentsData = await commentsRes.json();
            setComments(commentsData);
        }
    };

    const renderComment = (comment, isAuthor = false) => {
        const isEditing = editingCommentId === comment._id;
        const replyToComment = comment.reply_to ? replyToComments[comment.reply_to] : null;

        return (
            <div
                key={comment._id}
                style={{
                    borderRadius: 12,
                    padding: '16px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    position: 'relative'
                }}
            >
                {replyToComment && (
                    <div style={{
                        color: '#666',
                        fontSize: '0.9rem',
                        marginBottom: '8px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'בתגובה ל' : 'In reply to:'} {replyToComment.text.substring(0, 30)}...
                    </div>
                )}
                {isEditing ? (
                    <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            dir={isMainlyHebrew(editText) ? 'rtl' : 'ltr'}
                            style={{
                                width: '70%',
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: '1px solid #ccc',
                                fontSize: 14,
                                marginRight: 8,
                                outline: 'none',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        />
                        <button
                            onClick={() => handleEdit(comment._id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: '#A15E0A',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#C1873B'}
                            onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}
                        >
                            Submit
                        </button>
                    </div>
                ) : (
                    <div style={{
                        margin: '8px 0',
                        lineHeight: 1.5,
                        fontSize: 14,
                        color: '#333',
                        direction: isMainlyHebrew(comment.text) ? 'rtl' : 'ltr'
                    }}>
                        {comment.deleted ? (
                            <span style={{ color: '#888', fontStyle: 'italic' }}>[Deleted]</span>
                        ) : (
                            comment.text
                        )}
                    </div>
                )}
                {!comment.deleted && (
                    <div style={{ marginTop: 6 }}>
                        <CommentActions
                            commentId={comment._id}
                            onReplyClick={() => { }}
                            isReplying={false}
                            onEditClick={() => {
                                if (isEditing) {
                                    setEditingCommentId(null);
                                    setEditText('');
                                } else {
                                    setEditingCommentId(comment._id);
                                    setEditText(comment.text);
                                }
                            }}
                            onDeleteClick={() => handleDelete(comment._id)}
                            isAuthor={isAuthor}
                            showReplyButton={false}
                        />
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
    if (!profileUser) return <div style={{ padding: 40, textAlign: 'center' }}>User not found.</div>;

    const isOwnProfile = currentUser && currentUser._id === userId;

    return (
        <div style={{ minHeight: '100vh', padding: '24px 4vw' }}>
            {/* User name headline */}
            <div style={{ maxWidth: '1400px', margin: '0 auto 32px auto', width: '100%' }}>
                <h1 style={{
                    fontSize: '3rem',
                    color: '#5D4037',
                    textAlign: 'center',
                    marginTop: '18px',
                    marginBottom: '32px',
                    fontFamily: 'adobe-hebrew',
                    textShadow: '0 0 12px #FFF8EF',
                    direction: language === 'heb' ? 'rtl' : 'ltr'
                }}>
                    {profileUser.username}
                </h1>
            </div>

            {/* Likes section */}
            <div style={{ maxWidth: '1400px', margin: '0 auto 32px auto', width: '100%' }}>
                <div style={{
                    background: 'transparent',
                    borderRadius: 16,
                    padding: 24,
                    width: '100%'
                }}>
                    <h2 style={{
                        color: '#5D4037',
                        fontSize: '2.6rem',
                        fontFamily: 'adobe-hebrew',
                        textShadow: '0 0 12px #FFF8EF',
                        marginBottom: '48px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'לייקים' : 'Likes'}
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '1px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {likedArtists.map(artist => (
                            <Link
                                key={artist._id}
                                to={`/artist/${artist._id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <div className="shadow-[0_0_8px_0.5px_rgba(161,19,10,0.8)] rounded-2xl">
                                        <Avatar
                                            src={artist.image.url}
                                            className="w-20 h-20 [&>img]:object-top"
                                            fallback={artist.name[language].charAt(0)}
                                            radius="lg"
                                            isBordered
                                            color="danger"
                                        />
                                    </div>
                                    <span style={{
                                        color: '#5D4037',
                                        fontSize: '1.1rem',
                                        // fontWeight: 'bold',
                                        textAlign: 'center',
                                        direction: language === 'heb' ? 'rtl' : 'ltr'
                                    }}>
                                        {artist.name[language]}
                                    </span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dislikes section */}
            <div style={{ maxWidth: '1400px', margin: '0 auto 32px auto', width: '100%' }}>
                <div style={{
                    background: 'transparent',
                    borderRadius: 16,
                    padding: 24,
                    width: '100%'
                }}>
                    <h2 style={{
                        color: '#5D4037',
                        fontSize: '2.5rem',
                        fontFamily: 'adobe-hebrew',
                        marginBottom: '50px',
                        textShadow: '0 0 12px #FFF8EF',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'דיסלייקים' : 'Dislikes'}
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '1px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {dislikedArtists.map(artist => (
                            <Link
                                key={artist._id}
                                to={`/artist/${artist._id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <div className="shadow-[0_0_8px_0.5px_rgba(161,19,10,0.8)] rounded-2xl">
                                        <Avatar
                                            src={artist.image.url}
                                            className="w-20 h-20 [&>img]:object-top"
                                            fallback={artist.name[language].charAt(0)}
                                            radius="lg"
                                            isBordered
                                            color="danger"
                                        />
                                    </div>
                                    <span style={{
                                        color: '#5D4037',
                                        fontSize: '1.1rem',
                                        // fontWeight: 'bold',
                                        textAlign: 'center',
                                        direction: language === 'heb' ? 'rtl' : 'ltr'
                                    }}>
                                        {artist.name[language]}
                                    </span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comments and Liked Comments sections side by side */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%',
                display: 'flex',
                gap: '24px',
                alignItems: 'flex-start',
                flexDirection: language === 'eng' ? 'row' : 'row-reverse'
            }}>
                {/* User's Comments section */}
                <div style={{
                    flex: 1,
                    background: '#fff3e0',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px #0001',
                    padding: 24,
                    width: '33.33%',
                    height: 'fit-content'
                }}>
                    <h2 style={{
                        color: '#5D4037',
                        fontSize: '2rem',
                        // fontWeight: 'bold',
                        marginBottom: '16px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'תגובות' : 'Comments'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {comments.filter(comment => !comment.deleted).map(comment => renderComment(comment, isOwnProfile))}
                    </div>
                </div>

                {/* Liked Comments section */}
                <div style={{
                    flex: 1,
                    background: '#fff3e0',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px #0001',
                    padding: 24,
                    width: '33.33%',
                    height: 'fit-content'
                }}>
                    <h2 style={{
                        color: '#5D4037',
                        fontSize: '2rem',
                        // fontWeight: 'bold',
                        marginBottom: '16px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'תגובות שאהבתי' : 'Liked Comments'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {likedComments.filter(comment => !comment.deleted).map(comment => renderComment(comment, false))}
                    </div>
                </div>

                {/* Disliked Comments section */}
                <div style={{
                    flex: 1,
                    background: '#fff3e0',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px #0001',
                    padding: 24,
                    width: '33.33%',
                    height: 'fit-content'
                }}>
                    <h2 style={{
                        color: '#5D4037',
                        fontSize: '2rem',
                        // fontWeight: 'bold',
                        marginBottom: '16px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'תגובות שלא אהבתי' : 'Disliked Comments'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {dislikedComments.filter(comment => !comment.deleted).map(comment => renderComment(comment, false))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage; 