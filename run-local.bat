@echo off
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
cd /d "%ROOT%"

if not exist "node_modules" (
  echo node_modules not found. Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    exit /b 1
  )
)

echo Starting development server...
call npm run dev
