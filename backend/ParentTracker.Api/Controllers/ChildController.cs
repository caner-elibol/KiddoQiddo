using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParentTracker.Application.Features.Children.Queries;
using ParentTracker.Application.Features.Rewards.Queries;

namespace ParentTracker.Api.Controllers;

[ApiController]
[Route("api/child")]
[Authorize(Roles = "Child")]
public class ChildController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChildController(IMediator mediator) => _mediator = mediator;

    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetChildMeQuery(), ct);
        return Ok(result);
    }

    [HttpGet("my-reward-requests")]
    public async Task<IActionResult> GetMyRewardRequests(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetChildRewardRequestsQuery(), ct);
        return Ok(result);
    }
}
