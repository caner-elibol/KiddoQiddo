using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParentTracker.Application.Features.Rewards.Commands;
using ParentTracker.Application.Features.Rewards.Queries;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Api.Controllers;

[ApiController]
[Route("api/rewards")]
[Authorize]
public class RewardsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RewardsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRewardsQuery(), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> Create([FromBody] CreateRewardRequest request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateRewardCommand(request.Title, request.Description, request.RequiredPoints, request.ChildIds), ct);
        return Ok(new { id });
    }

    [HttpGet("requests")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> GetRequests([FromQuery] RewardRequestStatus? status, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRewardRequestsQuery(status), ct);
        return Ok(result);
    }

    [HttpPost("{rewardId:guid}/request")]
    [Authorize(Roles = "Child")]
    public async Task<IActionResult> RequestReward(Guid rewardId, CancellationToken ct)
    {
        var id = await _mediator.Send(new RequestRewardCommand(rewardId), ct);
        return Ok(new { id });
    }

    [HttpPost("requests/{requestId:guid}/handle")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> HandleRequest(Guid requestId, [FromBody] HandleRewardRequestBody body, CancellationToken ct)
    {
        await _mediator.Send(new HandleRewardRequestCommand(requestId, body.Approved), ct);
        return NoContent();
    }

    [HttpPost("requests/{requestId:guid}/deliver")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> DeliverRequest(Guid requestId, CancellationToken ct)
    {
        await _mediator.Send(new DeliverRewardCommand(requestId), ct);
        return NoContent();
    }
}

public record CreateRewardRequest(string Title, string? Description, int RequiredPoints, List<Guid>? ChildIds);
public record HandleRewardRequestBody(bool Approved);
