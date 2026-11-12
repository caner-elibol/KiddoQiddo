using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParentTracker.Application.Features.Dashboard.Queries;
using ParentTracker.Application.Features.Reports;

namespace ParentTracker.Api.Controllers;

[ApiController]
[Route("api/parent")]
[Authorize(Roles = "Parent")]
public class ParentController : ControllerBase
{
    private readonly IMediator _mediator;

    public ParentController(IMediator mediator) => _mediator = mediator;

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDashboardQuery(), ct);
        return Ok(result);
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReport(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetFamilyReportQuery(), ct);
        return Ok(result);
    }
}
