@echo off
title Sistema Materiales Torrecillas - CRM/ERP
echo ======================================================
echo    Iniciando Sistema de Materiales Torrecillas
echo ======================================================
echo.
echo 1. Verificando dependencias...
echo.

:: Iniciar el servidor backend y el frontend
:: Se usa concurrently a traves de pnpm dev
start cmd /k "echo Iniciando Servidores... && pnpm dev"

echo 2. Esperando a que los servicios esten listos (10 segundos)...
timeout /t 10 /nobreak

echo 3. Abriendo Panel Administrativo...
start http://localhost:5173

echo.
echo ======================================================
echo    EL SISTEMA ESTA CORRIENDO EN SEGUNDO PLANO
echo    No cierres la otra ventana de comandos.
echo ======================================================
pause
