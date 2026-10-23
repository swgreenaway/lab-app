using System.Collections.Concurrent;
using System.Diagnostics;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// IIS hosts this as the /api application, so routes here are relative to /api
// (the ASP.NET Core Module passes /api through as Request.PathBase).

app.MapGet("/hello", () => new
{
    message = "Hello from ASP.NET Core behind IIS",
    time = DateTimeOffset.Now,
});

// Handy for seeing what IIS hands the app: in-process hosting shows w3wp as the process
app.MapGet("/info", (HttpContext ctx) => new
{
    machine = Environment.MachineName,
    process = Process.GetCurrentProcess().ProcessName,
    processId = Environment.ProcessId,
    user = Environment.UserName,
    framework = RuntimeInformation.FrameworkDescription,
    environment = app.Environment.EnvironmentName,
    pathBase = ctx.Request.PathBase.Value,
    path = ctx.Request.Path.Value,
    remoteIp = ctx.Connection.RemoteIpAddress?.ToString(),
    headers = ctx.Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString()),
});

// In-memory store: lost whenever the app pool recycles or the site restarts
var notes = new ConcurrentDictionary<int, Note>();
var nextId = 0;

app.MapGet("/notes", () => notes.Values.OrderBy(n => n.Id));

app.MapPost("/notes", (NoteInput input) =>
{
    if (string.IsNullOrWhiteSpace(input.Text))
        return Results.BadRequest(new { error = "text is required" });

    var note = new Note(Interlocked.Increment(ref nextId), input.Text.Trim(), DateTimeOffset.Now);
    notes[note.Id] = note;
    return Results.Created($"notes/{note.Id}", note);
});

app.MapDelete("/notes/{id:int}", (int id) =>
    notes.TryRemove(id, out _) ? Results.NoContent() : Results.NotFound());

app.Run();

record NoteInput(string? Text);
record Note(int Id, string Text, DateTimeOffset Created);
