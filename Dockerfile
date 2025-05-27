FROM node:18-alpine as build

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json trước (để cache tốt hơn)
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ code
COPY . .

# Expose cổng
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]
