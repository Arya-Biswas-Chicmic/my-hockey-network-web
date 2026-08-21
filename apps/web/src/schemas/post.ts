import type { CreatePostDTO, AddCommentDTO } from '../interfaces/post';

export function validateCreatePost(dto: Partial<CreatePostDTO>): { isValid: boolean; error?: string } {
  if (!dto.body || !dto.body.trim()) {
    return { isValid: false, error: 'Post body cannot be empty.' };
  }
  return { isValid: true };
}

export function validateAddComment(dto: Partial<AddCommentDTO>): { isValid: boolean; error?: string } {
  if (!dto.content || !dto.content.trim()) {
    return { isValid: false, error: 'Comment content cannot be empty.' };
  }
  return { isValid: true };
}
