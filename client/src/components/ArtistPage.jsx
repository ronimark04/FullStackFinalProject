import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';
import { useAuth } from '@/context/authContext';
import { useLanguage } from '@/context/languageContext';

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

function ThreadedComments({ comments, usersById }) {
    return (
        <div>
            {comments.map(comment => (
                <CommentThread key={comment._id} comment={comment} usersById={usersById} />
            ))}
        </div>
    );
}

function CommentThread({ comment, usersById, depth = 0 }) {
    const user = usersById[comment.user] || {};
    return (
        <div style={{ marginLeft: depth * 24, marginTop: 12, borderLeft: depth ? '2px solid #ffe0b2' : undefined, paddingLeft: 8 }}>
            <div style={{ fontWeight: 600 }}>{user.name || 'Unknown User'} <span style={{ color: '#888', fontWeight: 400, fontSize: 12 }}>{new Date(comment.createdAt).toLocaleString()}</span></div>
            <div style={{ margin: '4px 0' }}>{comment.text}</div>
            {comment.replies && comment.replies.length > 0 && (
                <ThreadedComments comments={comment.replies} usersById={usersById} />
            )}
        </div>
    );
}

const ArtistPage = () => {
    const { artistId } = useParams();
    const { user } = useAuth();
    const { language } = useLanguage();
    const [artist, setArtist] = useState(null);
    const [votes, setVotes] = useState({ upvotes: { count: 0 }, downvotes: { count: 0 } });
    const [comments, setComments] = useState([]);
    const [usersById, setUsersById] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch artist
                const artistRes = await fetch(`/artists/${artistId}`);
                const artistData = await artistRes.json();
                setArtist(artistData);
                // Fetch votes
                const votesRes = await fetch(`/artist-votes/artist/${artistId}`);
                const votesData = await votesRes.json();
                setVotes(votesData);
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
                    <div style={{ background: '#fff3e0', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 32, width: '100%' }}>
                        <div style={{ fontWeight: 700, fontSize: 28, color: '#e65100', marginBottom: 12 }}>Summary</div>
                        <div style={{ color: '#5d4037', fontSize: 18 }}
                            dir={language === 'heb' ? 'rtl' : 'ltr'}>
                            {artist.summary?.[language] || 'No summary available.'}
                        </div>
                    </div>
                    <div style={{ background: '#fff3e0', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, width: '100%', display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ ...iconStyle, color: ICON_COLOR, background: '#ffe0b2', borderRadius: 12, minWidth: 80, justifyContent: 'center', fontWeight: 600, fontSize: 18 }}>
                            <LikeIcon style={{ width: 28, height: 28, marginRight: 8 }} />
                            <span style={{ color: '#a15e0a', fontWeight: 700 }}>{votes.upvotes?.count || 0}</span>
                        </div>
                        <div style={{ ...iconStyle, color: ICON_COLOR, background: '#ffe0b2', borderRadius: 12, minWidth: 80, justifyContent: 'center', fontWeight: 600, fontSize: 18 }}>
                            <DislikeIcon style={{ width: 28, height: 28, marginRight: 8 }} />
                            <span style={{ color: '#a15e0a', fontWeight: 700 }}>{votes.downvotes?.count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Comments full width below */}
            <div style={{ maxWidth: '1400px', margin: '32px auto 0 auto', width: '100%' }}>
                <div style={{ background: '#fffde7', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 32, width: '100%' }}>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#e65100', marginBottom: 8 }}>Comments</div>
                    <ThreadedComments comments={threadedComments} usersById={usersById} />
                </div>
            </div>
        </div>
    );
};

export default ArtistPage;