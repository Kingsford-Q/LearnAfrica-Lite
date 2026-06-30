namespace LearnAfricaLite.Api.DTOs;

public record ForumThreadDto(Guid Id, Guid LessonId, Guid UserId, string UserName, string? UserAvatar, string Title, string Body, DateTime CreatedAt, int ReplyCount);

public record ForumThreadDetailDto(Guid Id, Guid LessonId, Guid UserId, string UserName, string? UserAvatar, string Title, string Body, DateTime CreatedAt, List<ForumReplyDto> Replies);

public record ForumReplyDto(Guid Id, Guid ThreadId, Guid UserId, string UserName, string? UserAvatar, string Body, DateTime CreatedAt);

public record CreateForumThreadRequest(string Title, string Body);

public record CreateForumReplyRequest(string Body);
