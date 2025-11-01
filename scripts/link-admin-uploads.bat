@echo off
REM Script to create a symlink from admin uploads to web app public directory
REM This allows the web app to serve images uploaded through the admin panel

set ADMIN_UPLOADS=..\multivendor-admin\public\uploads
set WEB_PUBLIC_UPLOADS=public\uploads

REM Check if admin uploads directory exists
if not exist "%ADMIN_UPLOADS%" (
    echo ❌ Admin uploads directory not found: %ADMIN_UPLOADS%
    exit /b 1
)

REM Remove existing symlink/directory if it exists
if exist "%WEB_PUBLIC_UPLOADS%" (
    echo 🗑️ Removing existing uploads directory/symlink...
    rmdir /s /q "%WEB_PUBLIC_UPLOADS%"
)

REM Create the symlink (requires admin privileges on Windows)
echo 🔗 Creating symlink from %ADMIN_UPLOADS% to %WEB_PUBLIC_UPLOADS%...
mklink /D "%WEB_PUBLIC_UPLOADS%" "%ADMIN_UPLOADS%"

if %errorlevel% equ 0 (
    echo ✅ Symlink created successfully!
    echo 📂 Web app can now serve images from: %WEB_PUBLIC_UPLOADS%
) else (
    echo ❌ Failed to create symlink (you may need to run as Administrator)
    echo 💡 Alternatively, copy the files manually or use the API proxy
    exit /b 1
)