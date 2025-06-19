# Development Automation - No More Manual WebSocket Server!

You no longer need to manually run `node websocket-server.js` every time. Here are all the automated options:

## 🎯 Recommended: Single Command Start

```bash
npm run dev
```

This single command now:
- ✅ Starts the WebSocket server on `ws://localhost:1234`
- ✅ Starts the Vite development server on `http://localhost:8081`
- ✅ Shows colored output to distinguish between servers
- ✅ Handles both servers in one terminal
- ✅ Stops both servers with a single Ctrl+C

**Output Example:**
```
[WS] 🚀 Starting WebSocket server for Yjs collaboration...
[WS] ✅ WebSocket server running on ws://localhost:1234
[VITE] VITE v5.4.10 ready in 195 ms
[VITE] ➜ Local: http://localhost:8081/
```

## 🛠️ Alternative Options

### Option 1: Shell Script
```bash
./dev-start.sh
```
- Includes dependency checks
- User-friendly startup messages
- Cross-platform compatible

### Option 2: VS Code Tasks
- Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
- Type "Tasks: Run Task"
- Select "Start Collaborative Editor"

### Option 3: Separate Terminals (if needed)
```bash
# Terminal 1
npm run websocket

# Terminal 2  
npm run dev:vite-only
```

## 📋 Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | **Main command** - starts both servers |
| `npm run dev:vite-only` | Starts only Vite (if WebSocket is running elsewhere) |
| `npm run websocket` | Starts only WebSocket server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🔧 How It Works

The automation uses `concurrently` package to run multiple npm scripts simultaneously:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run websocket\" \"npm run vite\" --names \"WS,VITE\" --prefix-colors \"blue,green\""
  }
}
```

## 🚀 Quick Start Workflow

1. **Clone/Open Project**
2. **Install Dependencies** (if needed): `npm install`
3. **Start Development**: `npm run dev`
4. **Open Browser**: `http://localhost:8081`
5. **Test Collaboration**: Open multiple tabs to the same idea page

## 🎉 Benefits

- ✅ **No manual server management**
- ✅ **Single command to start everything**
- ✅ **Colored output for easy debugging**
- ✅ **Automatic dependency handling**
- ✅ **Cross-platform compatibility**
- ✅ **VS Code integration**
- ✅ **Graceful shutdown with Ctrl+C**

## 🐛 Troubleshooting

### Port Already in Use
If you see port conflicts:
- WebSocket server will try port 1234
- Vite will automatically find an available port (8081, 8082, etc.)

### Stopping Servers
- Press `Ctrl+C` once to stop both servers
- If servers don't stop, press `Ctrl+C` again

### Restarting Development
```bash
# Stop current servers (Ctrl+C)
# Then restart
npm run dev
```

## 🎯 Production Notes

- The WebSocket server is for development only
- For production, you'll need a proper WebSocket infrastructure
- Consider using services like Socket.io, Pusher, or Ably for production

---

**You're all set! Just run `npm run dev` and start collaborating! 🚀**
