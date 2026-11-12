using MediatR;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Application.Features.Children.Commands;

public record CreateChildCommand(
    string Name,
    int? BirthYear,
    string AvatarKey,
    string Pin) : IRequest<Guid>;

public class CreateChildCommandHandler : IRequestHandler<CreateChildCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICurrentUserService _currentUser;

    public CreateChildCommandHandler(IApplicationDbContext db, IPasswordHasher passwordHasher, ICurrentUserService currentUser)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateChildCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.FamilyId == Guid.Empty)
            throw new UnauthorizedAccessException("Family not found.");

        var child = new Child
        {
            FamilyId = _currentUser.FamilyId,
            ParentId = _currentUser.UserId,
            Name = request.Name,
            BirthYear = request.BirthYear,
            AvatarKey = request.AvatarKey,
            PinCodeHash = _passwordHasher.Hash(request.Pin)
        };

        _db.Children.Add(child);
        await _db.SaveChangesAsync(cancellationToken);

        return child.Id;
    }
}
