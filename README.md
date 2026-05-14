---
title: Materiales Torrecillas API
emoji: 🏗️
colorFrom: yellow
colorTo: gray
sdk: docker
app_port: 7860
---

# Materiales Torrecillas - Backend ERP & WhatsApp AI

Este es el servidor central para el sistema de Materiales Torrecillas. 
Maneja la integración con WhatsApp (Baileys), la Inteligencia Artificial (Groq) y la base de datos local (PGlite).

## Configuración
Asegúrate de configurar los siguientes **Secrets** en Hugging Face:
- `GROQ_API_KEY`: Tu clave de API de Groq.
- `NODE_ENV`: production
