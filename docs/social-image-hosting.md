# Alojamiento de imágenes para publicar en Instagram

## Por qué existe

Facebook acepta los bytes de la imagen directamente. **Instagram no**: su paso de
contenedor recibe `image_url` y va a buscar la foto él mismo. Esa asimetría es la
que hacía que el flujo terminara en un campo pidiéndole a la clienta "una URL
pública de la imagen" — algo que no tiene forma de producir.

`POST /api/social/image-url` recibe la imagen y devuelve una URL **firmada** que
Meta puede leer durante una hora.

Firmada y no pública a propósito: un aviso que todavía no se publicó no debería
quedar legible por cualquiera para siempre sólo porque pasó por acá.

## Contrato

```
POST /api/social/image-url
Authorization: Bearer <token de Supabase>

{ "imageBase64": "<sin prefijo data:>", "contentType": "image/png" }
→ 200 { "url": "https://…", "expiresInSeconds": 3600 }
```

Errores con código estable: `sign_in_required`, `unsupported_type`, `too_large`,
`empty`, `storage_unavailable`.

Sólo PNG, JPEG y WebP, hasta 8 MB — el límite que Instagram acepta. Fallar acá es
mejor que fallar en Meta con un mensaje que nadie entiende.

## Configuración de una sola vez (pendiente)

Falta crear el bucket en Supabase Storage:

- Nombre: **`social-images`**
- **Privado** (no público). Las URLs se firman al momento de publicar.

Sin el bucket, el endpoint responde `storage_unavailable` con copy humano y nada
más se rompe.

## Línea roja

Las imágenes se guardan bajo `<user_id>/<uuid>.<ext>`. Un id de usuario nunca
puede escribir en la carpeta de otro: la ruta se limpia de cualquier carácter que
permita salirse del espacio propio, y hay un test que lo comprueba.
