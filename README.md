# Karaoke

## Desarrollo local

```bash
pnpm install
pnpm dev
```

La app arranca en `http://localhost:3000`.

## Despliegue en Vercel

El proyecto queda preparado para Vercel con dos comportamientos:

- En local, `pnpm build` sigue copiando los videos necesarios a `public/canciones/`.
- En Vercel, `.vercelignore` evita subir `cancionesnormalizadas`, `downloads` y los videos generados en `public/canciones`.
- Si defines `VIDEO_CDN_BASE_URL`, el build genera `public/canciones-manifest.json` con URLs remotas.
- Si no defines `VIDEO_CDN_BASE_URL`, Vercel despliega igual pero la pantalla de videoclip no tendra videos disponibles.

### Pasos

1. Importa en Vercel la carpeta `karaoke/` como proyecto.
2. Usa `pnpm` como package manager.
3. Deja `pnpm build` como comando de build.
4. Opcional pero recomendado: define `VIDEO_CDN_BASE_URL` con la base donde alojes los `.mp4`.
5. Despliega.

### Ejemplo de `VIDEO_CDN_BASE_URL`

```bash
VIDEO_CDN_BASE_URL=https://tu-cdn.example.com/canciones
```

El manifiesto resultante apuntara a URLs del tipo:

```text
https://tu-cdn.example.com/canciones/unanochemas.mp4
```

### Limite importante

Los videos ocupan varios cientos de MB. Vercel no debe usarse para alojar esta biblioteca de archivos. La opcion correcta es servirlos desde almacenamiento externo o CDN y dejar en el despliegue solo el manifiesto con sus URLs.
