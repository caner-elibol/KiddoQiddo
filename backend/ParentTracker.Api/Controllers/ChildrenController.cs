using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParentTracker.Application.Features.Children.Commands;
using ParentTracker.Application.Features.Children.Queries;

namespace ParentTracker.Api.Controllers;

[ApiController]
[Route("api/children")]
[Authorize(Roles = "Parent")]
public class ChildrenController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChildrenController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetChildrenQuery(), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateChildRequest request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateChildCommand(
            request.Name, request.BirthYear, request.AvatarKey, request.Pin), ct);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateChildRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpdateChildCommand(id, request.Name, request.BirthYear, request.AvatarKey), ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/pin")]
    public async Task<IActionResult> UpdatePin(Guid id, [FromBody] UpdatePinRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpdateChildPinCommand(id, request.NewPin), ct);
        return NoContent();
    }
}

public record CreateChildRequest(string Name, int? BirthYear, string AvatarKey, string Pin);
public record UpdateChildRequest(string Name, int? BirthYear, string AvatarKey);
public record UpdatePinRequest(string NewPin);
