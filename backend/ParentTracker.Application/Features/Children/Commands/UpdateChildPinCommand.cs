using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Application.Features.Children.Commands;

public record UpdateChildPinCommand(Guid ChildId, string NewPin) : IRequest;

public class UpdateChildPinCommandHandler : IRequestHandler<UpdateChildPinCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICurrentUserService _currentUser;

    public UpdateChildPinCommandHandler(IApplicationDbContext db, IPasswordHasher passwordHasher, ICurrentUserService currentUser)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateChildPinCommand request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        var child = await _db.Children
            .FirstOrDefaultAsync(c => c.Id == request.ChildId && c.FamilyId == familyId, cancellationToken)
            ?? throw new KeyNotFoundException("Çocuk bulunamadı.");

        child.PinCodeHash = _passwordHasher.Hash(request.NewPin);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
