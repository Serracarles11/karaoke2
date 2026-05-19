$url = "http://localhost:3000/videoclip?revision=1"

Start-Process $url
Write-Host "Abriendo modo revision de canciones: $url"
Write-Host "Si no carga, ejecuta primero: pnpm dev"
