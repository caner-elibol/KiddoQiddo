using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Application.Features.Children.Commands;

public record UpdateChildCommand(
    Guid ChildId,
    string Name,
    int? BirthYear,
    string AvatarKey) : IRequest;

public class UpdateChildCommandHandler : IRequestHandler<UpdateChildCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateChildCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateChildCommand request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        var child = await _db.Children
            .FirstOrDefaultAsync(c => c.Id == request.ChildId && c.FamilyId == familyId, cancellationToken)
            ?? throw new KeyNotFoundException("Çocuk bulunamadı.");

        child.Name = request.Name;
        child.BirthYear = request.BirthYear;
        child.AvatarKey = request.AvatarKey;

        await _db.SaveChangesAsync(cancellationToken);
    }
}
