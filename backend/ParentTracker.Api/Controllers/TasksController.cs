using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParentTracker.Application.Features.Tasks.Commands;
using ParentTracker.Application.Features.Tasks.Queries;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Api.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;

    public TasksController(IMediator mediator) => _mediator = mediator;

    [HttpGet("templates")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> GetTemplates(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTaskTemplatesQuery(), ct);
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> GetTasks(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTaskItemsQuery(), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateTaskItemCommand(
            request.Title, request.Description, request.Category,
            request.Points, request.RepeatType, request.RequiresParentApproval,
            request.StartDate, request.EndDate), ct);
        return CreatedAtAction(nameof(GetMyTasks), new { id }, new { id });
    }

    [HttpPost("{taskId:guid}/assign/{childId:guid}")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> Assign(Guid taskId, Guid childId, CancellationToken ct)
    {
        var assignmentId = await _mediator.Send(new AssignTaskCommand(taskId, childId), ct);
        return Ok(new { assignmentId });
    }

    [HttpGet("pending-approvals")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> GetPendingApprovals(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPendingApprovalsQuery(), ct);
        return Ok(result);
    }

    [HttpPost("{childTaskId:guid}/approve")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> Approve(Guid childTaskId, [FromBody] ApproveTaskRequest request, CancellationToken ct)
    {
        await _mediator.Send(new ApproveTaskCommand(childTaskId, request.Approved, request.ParentNote), ct);
        return NoContent();
    }

    [HttpGet("today")]
    [Authorize(Roles = "Child")]
    public async Task<IActionResult> GetMyTasks(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTodayTasksQuery(), ct);
        return Ok(result);
    }

    [HttpPost("{childTaskId:guid}/submit")]
    [Authorize(Roles = "Child")]
    public async Task<IActionResult> Submit(Guid childTaskId, [FromBody] SubmitTaskRequest request, CancellationToken ct)
    {
        await _mediator.Send(new SubmitTaskCommand(childTaskId, request.Note), ct);
        return NoContent();
    }
}

public record CreateTaskRequest(
    string Title,
    string? Description,
    string Category,
    int Points,
    TaskRepeatType RepeatType,
    bool RequiresParentApproval,
    DateOnly? StartDate,
    DateOnly? EndDate);

public record ApproveTaskRequest(bool Approved, string? ParentNote);
public record SubmitTaskRequest(string? Note);
