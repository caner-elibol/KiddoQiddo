using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParentTracker.Application.Features.Notifications.Commands;
using ParentTracker.Application.Features.Notifications.Queries;

namespace ParentTracker.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetNotificationsQuery(page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost("read")]
    public async Task<IActionResult> MarkRead([FromBody] MarkReadRequest? request, CancellationToken ct)
    {
        await _mediator.Send(new MarkNotificationsReadCommand(request?.Ids), ct);
        return NoContent();
    }
}

public record MarkReadRequest(List<Guid>? Ids);
