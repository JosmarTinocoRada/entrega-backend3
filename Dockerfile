FROM node:22.14.0

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo package.json y package-lock.json para optimizar la caché de Docker
COPY package*.json ./

# Instalar dependencias sin paquetes de desarrollo (para producción)
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Exponer el puerto 8080
EXPOSE 8080

# Comando por defecto para iniciar la aplicación
CMD ["npm", "start"]
