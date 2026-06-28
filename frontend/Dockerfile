# ============================================================
# frontend/Dockerfile
#
# Uses nginx:alpine to serve static HTML/CSS/JS files.
# The backend is a separate container — we just proxy to it.
# ============================================================

FROM nginx:alpine

# Copy all frontend files to Nginx's document root
COPY . /app

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Nginx serves on port 3000 (to avoid conflict with backend on 8000)
EXPOSE 3000

# Start Nginx in the foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
