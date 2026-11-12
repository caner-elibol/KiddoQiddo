using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Application.Features.Tasks.Queries;

public record GetTaskTemplatesQuery : IRequest<List<TaskTemplateDto>>;

public record TaskTemplateDto(Guid Id, string Title, string Category, int DefaultPoints, int? SuggestedAgeMin, int? SuggestedAgeMax);

public class GetTaskTemplatesQueryHandler : IRequestHandler<GetTaskTemplatesQuery, List<TaskTemplateDto>>
{
    private readonly IApplicationDbContext _db;

    public GetTaskTemplatesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<TaskTemplateDto>> Handle(GetTaskTemplatesQuery request, CancellationToken cancellationToken)
    {
        return await _db.TaskTemplates
            .OrderBy(t => t.Category).ThenBy(t => t.Title)
            .Select(t => new TaskTemplateDto(t.Id, t.Title, t.Category, t.DefaultPoints, t.SuggestedAgeMin, t.SuggestedAgeMax))
            .ToListAsync(cancellationToken);
    }
}
