import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface Comment {
  name: string;
  avatarUrl: string;
  date: string;
  rating: number;
  text: string;
}

interface StarCommentProps {
  comments: Comment[];
}

const StarComment: React.FC<StarCommentProps> = ({ comments }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#000' : '#D1D5DB'}
          style={styles.star}
        />
      );
    }
    return stars;
  };

  if (comments.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No reviews yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {comments.map((comment, index) => (
        <View key={index} style={styles.commentContainer}>
          <View style={styles.commentHeader}>
            <Image source={{ uri: comment.avatarUrl }} style={styles.avatar} />
            <View style={styles.commentInfo}>
              <Text style={styles.reviewerName}>{comment.name}</Text>
              <Text style={styles.date}>{comment.date}</Text>
            </View>
          </View>
          
          <View style={styles.starsContainer}>
            {renderStars(comment.rating)}
          </View>
          
          <Text style={styles.commentText}>{comment.text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    marginRight: 2,
  },
  commentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default StarComment;
