var app = WebApplication.Create(args);
var notes = new List<string>();

app.MapGet("/hello", () => "Hello from IIS");
app.MapGet("/notes", () => notes);
app.MapPost("/notes", (Note note) =>
{
    notes.Add(note.Text);
    return notes;
});

app.Run();

record Note(string Text);
