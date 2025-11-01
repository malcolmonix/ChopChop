#!/bin/bash

# Script to create a symlink from admin uploads to web app public directory
# This allows the web app to serve images uploaded through the admin panel

# Define paths
ADMIN_UPLOADS="../multivendor-admin/public/uploads"
WEB_PUBLIC_UPLOADS="public/uploads"

# Check if admin uploads directory exists
if [ ! -d "$ADMIN_UPLOADS" ]; then
  echo "❌ Admin uploads directory not found: $ADMIN_UPLOADS"
  exit 1
fi

# Remove existing symlink/directory if it exists
if [ -L "$WEB_PUBLIC_UPLOADS" ] || [ -d "$WEB_PUBLIC_UPLOADS" ]; then
  echo "🗑️ Removing existing uploads directory/symlink..."
  rm -rf "$WEB_PUBLIC_UPLOADS"
fi

# Create the symlink
echo "🔗 Creating symlink from $ADMIN_UPLOADS to $WEB_PUBLIC_UPLOADS..."
ln -s "$(realpath "$ADMIN_UPLOADS")" "$WEB_PUBLIC_UPLOADS"

if [ $? -eq 0 ]; then
  echo "✅ Symlink created successfully!"
  echo "📂 Web app can now serve images from: $WEB_PUBLIC_UPLOADS"
else
  echo "❌ Failed to create symlink"
  exit 1
fi