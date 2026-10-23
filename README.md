# IIS Lab App

A minimal app for practising IIS: a static HTML/CSS/JS page served directly by IIS, plus an ASP.NET Core minimal API hosted as a separate IIS application at `/api`.

```
<site>            site/        index.html, style.css, app.js
 └─ /api          api/         ASP.NET Core (.NET 10), its own app pool
```

| Endpoint | Description |
|---|---|
| `GET /api/hello` | Simple JSON response |
| `GET /api/info` | What IIS hands the app: process name, path base, headers, client IP |
| `GET /api/notes` | List notes |
| `POST /api/notes` | Add a note: `{"text": "..."}` |
| `DELETE /api/notes/{id}` | Delete a note |

Notes are kept in memory, so they are lost whenever the app pool recycles.

## Requirements

- **Build machine:** .NET 10 SDK
- **Server:** IIS, plus the [.NET 10 Hosting Bundle](https://aka.ms/dotnet/10.0/dotnet-hosting-win.exe). Run `iisreset` after installing it.

## Build

```powershell
dotnet publish api -c Release -o publish
```

Copy `site\*` and `publish\*` to two folders on the server, e.g. `C:\inetpub\LabApp` and `C:\inetpub\LabApp-api`. The source files (`*.cs`, `*.csproj`, `obj\`) aren't needed on the server.

## IIS setup

1. **App pools:** one for the site (defaults are fine) and one for the API with **.NET CLR version = No Managed Code**.
2. **Site:** physical path = the `site` folder, bound to port 80 with a blank host name. Stop *Default Web Site* first if it holds port 80, then make sure the new site is **Started**.
3. **Application:** right-click the site → *Add Application*. Alias **`api`** (the page calls `api/...`), physical path = the publish folder, app pool = the API pool.
4. **Permissions:** give `IIS AppPool\<pool name>` Read & Execute on each folder (type the name; it won't show in search).

**Check:** browse to `http://<server>/` and click *Server info*. You should see `"process": "w3wp"` (in-process hosting) and `"pathBase": "/api"`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Plain "HTTP Error 404. The requested resource is not found." | No site matched the request (HTTP.sys, not IIS): site is stopped, or the binding's host name/IP/port doesn't match the URL |
| 500.19 on `/api` | Hosting Bundle not installed, so IIS doesn't recognise `aspNetCore` in `web.config` |
| 500.30 / 500.31 on `/api` | App failed to start or .NET 10 runtime missing. Set `stdoutLogEnabled="true"` in the API's `web.config`, create a `logs` folder the pool can write to, and recycle the pool |
| 503 on `/api` | API app pool is stopped |
| Page loads, API buttons 404 | Application isn't named `api`, or was added under a different site |

## Run locally

```powershell
dotnet run --project api --urls http://localhost:5079
```

Locally the API is at the root (`http://localhost:5079/hello`); the `/api` prefix only exists when IIS hosts it as an application.
