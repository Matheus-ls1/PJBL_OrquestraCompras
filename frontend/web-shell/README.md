# Web Shell

Host React/Vite independente do OrquestraCompras. Esta imagem não chama BFF ou microsserviços; módulos remotos ainda não publicados são exibidos como indisponíveis.

```powershell
npm install
npm run dev
npm run build
```

## Contêiner

```powershell
docker buildx build --platform linux/amd64 -t <dockerhub-usuario>/orquestracompras-web-shell:latest --load .
docker run --rm -p 8080:80 <dockerhub-usuario>/orquestracompras-web-shell:latest
docker push <dockerhub-usuario>/orquestracompras-web-shell:latest
```

O Nginx atende na porta `80` e aplica fallback SPA para `index.html`.
