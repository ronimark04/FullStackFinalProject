import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';
import { useAuth } from '@/context/authContext';
import { useLanguage } from '@/context/languageContext';
import CommentActions from './CommentActions';
import ArtistActionsArtistPage from './ArtistActionsArtistPage';

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

function buildThreadedComments(comments) {
    const map = {};
    const roots = [];
    comments.forEach(c => {
        map[c._id] = { ...c, replies: [] };
    });
    comments.forEach(c => {
        if (c.reply_to && map[c.reply_to]) {
            map[c.reply_to].replies.push(map[c._id]);
        } else {
            roots.push(map[c._id]);
        }
    });
    return roots;
}

function ThreadedComments({ comments, usersById, replyingToCommentId, setReplyingToCommentId, replyText, setReplyText, refreshComments, artistId, editingCommentId, setEditingCommentId, editText, setEditText }) {
    return (
        <div>
            {comments.map(comment => (
                <CommentThread
                    key={comment._id}
                    comment={comment}
                    usersById={usersById}
                    replyingToCommentId={replyingToCommentId}
                    setReplyingToCommentId={setReplyingToCommentId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    refreshComments={refreshComments}
                    artistId={artistId}
                    editingCommentId={editingCommentId}
                    setEditingCommentId={setEditingCommentId}
                    editText={editText}
                    setEditText={setEditText}
                />
            ))}
        </div>
    );
}

function CommentThread({ comment, usersById, depth = 0, replyingToCommentId, setReplyingToCommentId, replyText, setReplyText, refreshComments, artistId, editingCommentId, setEditingCommentId, editText, setEditText }) {
    const user = usersById[comment.user] || {};
    const isReplying = replyingToCommentId === comment._id;
    const isEditing = editingCommentId === comment._id;
    const { user: currentUser } = useAuth();
    const isAuthor = currentUser && currentUser._id === comment.user;

    const handleEdit = async () => {
        if (!editText.trim()) return;
        const res = await fetch(`/comments/${comment._id}`, {
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
            if (refreshComments) refreshComments();
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        const res = await fetch(`/comments/${comment._id}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': localStorage.getItem('token'),
            },
        });
        if (res.ok) {
            if (refreshComments) refreshComments();
        }
    };

    return (
        <div style={{ marginLeft: depth * 24, marginTop: 12, borderLeft: depth ? '2px solid #ffe0b2' : undefined, paddingLeft: 8 }}>
            <div style={{ fontWeight: 600 }}>{user.username || 'Unknown User'} <span style={{ color: '#888', fontWeight: 400, fontSize: 12 }}>{new Date(comment.createdAt).toLocaleString()}</span></div>
            {isEditing ? (
                <div style={{ margin: '4px 0' }}>
                    <input
                        type="text"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        style={{ width: '70%', marginRight: 8 }}
                    />
                    <button
                        onClick={handleEdit}
                        style={{ padding: '4px 12px' }}
                    >
                        Submit
                    </button>
                </div>
            ) : (
                <div style={{ margin: '4px 0' }}>
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
                        onReplyClick={() => setReplyingToCommentId(isReplying ? null : comment._id)}
                        isReplying={isReplying}
                        onEditClick={() => {
                            if (isEditing) {
                                setEditingCommentId(null);
                                setEditText('');
                            } else {
                                setEditingCommentId(comment._id);
                                setEditText(comment.text);
                            }
                        }}
                        onDeleteClick={handleDelete}
                        isAuthor={isAuthor}
                    />
                </div>
            )}
            {isReplying && !comment.deleted && (
                <div style={{ marginTop: 8 }}>
                    <input
                        type="text"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        style={{ width: '70%', marginRight: 8 }}
                    />
                    <button
                        onClick={async () => {
                            if (!replyText.trim()) return;
                            const res = await fetch('/comments', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-auth-token': localStorage.getItem('token'),
                                },
                                body: JSON.stringify({
                                    text: replyText,
                                    artist: artistId,
                                    reply_to: comment._id,
                                }),
                            });
                            if (res.ok) {
                                setReplyText('');
                                setReplyingToCommentId(null);
                                if (refreshComments) refreshComments();
                            }
                        }}
                        style={{ padding: '4px 12px' }}
                    >
                        Submit
                    </button>
                </div>
            )}
            {comment.replies && comment.replies.length > 0 && (
                <ThreadedComments
                    comments={comment.replies}
                    usersById={usersById}
                    replyingToCommentId={replyingToCommentId}
                    setReplyingToCommentId={setReplyingToCommentId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    refreshComments={refreshComments}
                    artistId={artistId}
                    editingCommentId={editingCommentId}
                    setEditingCommentId={setEditingCommentId}
                    editText={editText}
                    setEditText={setEditText}
                />
            )}
        </div>
    );
}

// Helper to get up to 150 words and add Wikipedia link if needed
function getSummaryWithWiki(summary, wiki, language) {
    if (!summary) return 'No summary available.';
    const words = summary.split(/\s+/);
    const isLong = words.length > 150;
    const displayed = isLong ? words.slice(0, 150).join(' ') + '...' : summary;
    let wikiUrl = wiki?.[language] || wiki?.[language === 'heb' ? 'eng' : 'heb'] || null;
    let wikiLabel = language === 'heb' ? ' ויקיפדיה' : 'wikipedia';
    return (
        <>
            {displayed}
            {wikiUrl && (
                <a href={wikiUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none', marginLeft: 4, fontWeight: 500 }}>
                    {wikiLabel}
                    <span style={{ fontFamily: 'FontAwesome', marginLeft: 4 }}> &#xf08e;</span>
                </a>
            )}
        </>
    );
}

const ArtistPage = () => {
    const { artistId } = useParams();
    const { user } = useAuth();
    const { language } = useLanguage();
    const [artist, setArtist] = useState(null);
    const [comments, setComments] = useState([]);
    const [usersById, setUsersById] = useState({});
    const [loading, setLoading] = useState(true);
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch artist
                const artistRes = await fetch(`/artists/${artistId}`);
                const artistData = await artistRes.json();
                setArtist(artistData);
                // Fetch comments
                const commentsRes = await fetch(`/comments/artist/${artistId}`);
                const commentsData = await commentsRes.json();
                setComments(commentsData);
                // Fetch users for comments
                const userIds = Array.from(new Set(commentsData.map(c => c.user)));
                const usersMap = {};
                await Promise.all(userIds.map(async (uid) => {
                    try {
                        const res = await fetch(`/users/${uid}`);
                        if (res.ok) {
                            const u = await res.json();
                            usersMap[uid] = u;
                        }
                    } catch { }
                }));
                setUsersById(usersMap);
            } finally {
                setLoading(false);
            }
        }
        if (artistId) fetchData();
    }, [artistId]);

    const threadedComments = useMemo(() => buildThreadedComments(comments), [comments]);

    // Add a function to refresh comments
    const refreshComments = async () => {
        const commentsRes = await fetch(`/comments/artist/${artistId}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData);
        // Optionally update usersById if new users appear
        const userIds = Array.from(new Set(commentsData.map(c => c.user)));
        const usersMap = {};
        await Promise.all(userIds.map(async (uid) => {
            try {
                const res = await fetch(`/users/${uid}`);
                if (res.ok) {
                    const u = await res.json();
                    usersMap[uid] = u;
                }
            } catch { }
        }));
        setUsersById(usersMap);
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
    if (!artist) return <div style={{ padding: 40, textAlign: 'center' }}>Artist not found.</div>;

    return (
        <div style={{ background: '#ffe0b2', minHeight: '100vh', padding: '24px 4vw' }}>
            {/* Top row: Spotify embed (left), summary+actions (right) */}
            <div style={{ display: 'flex', gap: 32, alignItems: 'stretch', maxWidth: '1400px', margin: '0 auto', height: 'auto', minHeight: 0 }}>
                {/* Left: Spotify Embed */}
                <div style={{ flex: 1, maxWidth: '600px', minWidth: 0, display: 'flex', alignItems: 'stretch' }}>
                    {artist.spotifyId && (
                        <iframe
                            style={{ borderRadius: '12px', width: '100%', height: '100%', border: 'none', background: '#fff3e0', boxShadow: '0 2px 8px #0001', minHeight: 200 }}
                            src={`https://open.spotify.com/embed/artist/${artist.spotifyId}`}
                            frameBorder="0"
                            allowFullScreen=""
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            title="Spotify Artist Embed"
                        ></iframe>
                    )}
                </div>
                {/* Right: summary (top), actions (bottom) */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'flex-start' }}>
                    <div style={{ background: '#fff3e0', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, width: '100%', minHeight: 250 }}>
                        <div style={{ color: '#5d4037', fontSize: 18 }}
                            dir={language === 'heb' ? 'rtl' : 'ltr'}>
                            {getSummaryWithWiki(artist.summary?.[language], artist.wiki, language)}
                        </div>
                    </div>
                    <ArtistActionsArtistPage artistId={artist._id} />
                </div>
            </div>
            {/* Comments full width below */}
            <div style={{ maxWidth: '1400px', margin: '32px auto 0 auto', width: '100%' }}>
                <div style={{ background: '#fffde7', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, width: '100%' }}>
                    <ThreadedComments
                        comments={threadedComments}
                        usersById={usersById}
                        replyingToCommentId={replyingToCommentId}
                        setReplyingToCommentId={setReplyingToCommentId}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        refreshComments={refreshComments}
                        artistId={artist?._id}
                        editingCommentId={editingCommentId}
                        setEditingCommentId={setEditingCommentId}
                        editText={editText}
                        setEditText={setEditText}
                    />
                </div>
            </div>
        </div>
    );
};

export default ArtistPage;