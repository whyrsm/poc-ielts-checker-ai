FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Update the VITE_API_URL to point to your VM's domain or IP
ARG VITE_API_URL=http://your-vm-ip:3000
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]