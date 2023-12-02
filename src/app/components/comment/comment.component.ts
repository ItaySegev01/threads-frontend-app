import { Component, Input, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentFormComponent } from '../comment-form/comment-form.component';
import { Comment } from '../../interfaces/comment.inteface';
import { CommentService } from '../../services/comment.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, CommentFormComponent],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss',
})
export class CommentComponent {
  @Input() comment!: Comment;
  isExpanded = signal(false);
  isReplying = signal(false);
  commentService = inject(CommentService);
  nestedComments = signal<Comment[]>([]);
  userService = inject(UserService);

  nestedCommentsEffect = effect(() => {
    if (this.isExpanded()) {
      this.commentService
        .getComments(this.comment._id)
        .subscribe((comments) => {
          this.nestedComments.set(comments);
        });
    }
  });

  toggleExpanded() {
    this.isExpanded.set(!this.isExpanded());
  }

  toggleReplying() {
    this.isReplying.set(!this.isReplying());
    if (this.isReplying()) {
      this.isExpanded.set(true);
    }
  }

  createComment(formValues: { text: string }) {
    const { text } = formValues;
    const user = this.userService.getUserFromStorage();
    if (!user) {
      return;
    }
    this.commentService
      .createComment({
        text,
        userId: user._id,
        parentId: this.comment._id,
      })
      .subscribe((createdComment) => {
        this.nestedComments.set([createdComment, ...this.nestedComments()]);
      });
  }

  commentTrackBy(_index: number, comment: Comment) {
    return comment._id;
  }
}
